import { useMemo, useState, useCallback, useEffect } from "react";
import {
  type Abi,
  parseEther,
  keccak256,
  stringToBytes,
  parseEventLogs,
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type Hash,
  type PublicClient,
  type WalletClient,
} from "viem";
import { sepolia, hardhat } from "viem/chains";
import Toast from "react-native-toast-message";
import { useQuery } from "@tanstack/react-query";
import SubsidyPayoutAbi from "@/abi/SubsidyPayout.json";
import type {
  CreateProgramDto,
  CreateProgramDtoStatus,
  CreateProgramDtoType,
} from "@/api";

type HexString = `0x${string}`;
type EthereumProvider = {
  on?: (event: string, handler: (payload: any) => void) => void;
  removeListener?: (event: string, handler: (payload: any) => void) => void;
};

const subsidyPayoutAddress =
  (process.env.EXPO_PUBLIC_SUBSIDY_PAYOUT_ADDRESS as HexString | undefined) ??
  "0x0000000000000000000000000000000000000000";

console.log("Using Subsidy Payout Address:", subsidyPayoutAddress);

const rpcUrl =
  process.env.EXPO_PUBLIC_RPC_URL ??
  process.env.NEXT_PUBLIC_RPC_URL ??
  "http://127.0.0.1:8545";

const targetChain =
  rpcUrl.includes("127.0.0.1") || rpcUrl.includes("localhost")
    ? hardhat
    : sepolia;

function usePublicBlockchainClient() {
  const transport = useMemo(() => http(rpcUrl || undefined), [rpcUrl]);
  const client = useMemo(
    () =>
      createPublicClient({
        chain: targetChain,
        transport,
      }),
    [transport]
  );

  return client;
}

export function useSubsidyPayout() {
  const publicClient = usePublicBlockchainClient();
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [walletAddress, setWalletAddress] = useState<HexString | undefined>();
  const [isWriting, setIsWriting] = useState(false);

  const [txHash, setTxHash] = useState<HexString | undefined>();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const eth = (window as any).ethereum as
      | (EthereumProvider & {
          request?: (args: { method: string }) => Promise<string[]>;
        })
      | undefined;

    if (!eth) return;

    const client = createWalletClient({
      chain: targetChain,
      transport: custom(eth as any),
    });

    let mounted = true;
    setWalletClient(client);

    client
      .getAddresses()
      .then((addresses) => {
        if (!mounted) return;
        setWalletAddress((addresses[0] ?? null) as HexString | undefined);
      })
      .catch(() => {
        if (!mounted) return;
        setWalletAddress(undefined);
      });

    const handler = (accounts: string[]) => {
      setWalletAddress((accounts?.[0] ?? null) as HexString | undefined);
    };

    eth.on?.("accountsChanged", handler);

    return () => {
      mounted = false;
      eth.removeListener?.("accountsChanged", handler);
    };
  }, []);

  const {
    data: receipt,
    isPending: receiptPending,
    isFetching: receiptFetching,
    status: receiptStatus,
  } = useQuery({
    queryKey: ["subsidy-wait-for-tx", txHash],
    enabled: Boolean(txHash),
    queryFn: () =>
      publicClient.waitForTransactionReceipt({
        hash: txHash as Hash,
      }),
    refetchOnWindowFocus: false,
  });

  const isWaitingReceipt =
    Boolean(txHash) &&
    (receiptPending || receiptFetching || receiptStatus === "pending");

  const contractConfig = useMemo(
    () => ({
      address: subsidyPayoutAddress,
      abi: SubsidyPayoutAbi,
    }),
    []
  );

  const hashMetadata = useCallback((payload: string) => {
    return keccak256(stringToBytes(payload)) as HexString;
  }, []);

  const resolveWalletAddress = useCallback(async () => {
    if (!walletClient) return undefined;
    try {
      const addresses = await walletClient.getAddresses();
      const next = (addresses?.[0] ?? null) as HexString | undefined;
      if (next) setWalletAddress(next);
      return next;
    } catch (error) {
      console.error("Failed to resolve wallet address", error);
      return undefined;
    }
  }, [walletClient]);

  const handleWrite = useCallback(
    async (
      fn: Parameters<WalletClient["writeContract"]>[0]["functionName"],
      args: readonly unknown[],
      valueWei?: bigint
    ) => {
      console.log({ fn, walletClient, walletAddress });
      if (!walletClient) {
        Toast.show({
          type: "error",
          text1: "Wallet not connected",
        });
        throw new Error("Wallet not connected");
      }

      let account = walletAddress;
      if (!account) {
        account = await resolveWalletAddress();
      }
      if (!account) {
        Toast.show({
          type: "error",
          text1: "Wallet not connected",
        });
        throw new Error("Wallet not connected");
      }

      try {
        setIsWriting(true);
        const hash = await walletClient.writeContract({
          ...contractConfig,
          functionName: fn,
          args,
          value: valueWei,
          chain: targetChain,
          account,
        });
        setTxHash(hash as HexString);
        Toast.show({
          type: "success",
          text1: "Transaction sent",
          text2: hash,
        });
        return hash as HexString;
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Transaction failed",
        });
        throw error;
      } finally {
        setIsWriting(false);
      }
    },
    [contractConfig, resolveWalletAddress, walletAddress, walletClient]
  );

  const submitClaim = useCallback(
    async (programsId: bigint, metadataHash: string) => {
      const txHash = await handleWrite("submitClaim", [
        programsId,
        metadataHash,
      ]);

      // Wait for receipt and parse claim id from events
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash as Hash,
      });
      const parsed = parseEventLogs({
        abi: SubsidyPayoutAbi as Abi,
        logs: receipt.logs,
        eventName: "ClaimSubmitted",
      }) as { args: { claimId: bigint } }[];

      const claimId = parsed[0]?.args?.claimId;
      return { txHash, claimId };
    },
    [handleWrite, publicClient]
  );

  const enrollInProgram = useCallback(
    async (programsId: bigint) => handleWrite("enrollInProgram", [programsId]),
    [handleWrite]
  );

  // Government-only; approval now pays out immediately in the contract.
  const approveClaim = useCallback(
    async (claimId: bigint) => handleWrite("approveClaim", [claimId]),
    [handleWrite]
  );

  // Government-only; disburses funds for an already approved claim.
  const disburseClaim = useCallback(
      async (claimId: bigint) => handleWrite("disburseClaim", [claimId]),
      [handleWrite]
    );

  // Government-only rejection path.
  const rejectClaim = useCallback(
    async (claimId: bigint, reason: string) =>
      handleWrite("rejectClaim", [claimId, reason]),
    [handleWrite]
  );

  const deposit = useCallback(
    async (amountEth: string) =>
      handleWrite("deposit", [], parseEther(amountEth)),
    [handleWrite]
  );

  const getAgencyBalance = useCallback(
    async (agencyAddress?: HexString) => {
      if (!publicClient) return 0n;
      const address = agencyAddress || walletAddress;
      if (!address) return 0n;

      try {
        const balance = await publicClient.readContract({
          address: subsidyPayoutAddress,
          abi: SubsidyPayoutAbi,
          functionName: "getAgencyBalance",
          args: [address],
        });
        return balance as bigint;
      } catch (error) {
        console.error("Error getting agency balance:", error);
        return 0n;
      }
    },
    [publicClient, walletAddress]
  );

  return {
    walletAddress,
    contractConfig,
    isWriting,
    isWaitingReceipt,
    txHash,
    receipt,
    enrollInProgram,
    submitClaim,
    approveClaim,
    rejectClaim,
    deposit,
    getAgencyBalance,
    hashMetadata,
    publicClient,
    handleWrite,
    disburseClaim,
  };
}

export function useSubsidyProgram(programsId?: bigint) {
  const publicClient = usePublicBlockchainClient();

  return useQuery({
    queryKey: ["subsidy-programs", programsId],
    enabled: Boolean(programsId),
    queryFn: () =>
      publicClient.readContract({
        address: subsidyPayoutAddress,
        abi: SubsidyPayoutAbi,
        functionName: "getProgram",
        args: [programsId as bigint],
      }),
  });
}

export function useSubsidyClaim(claimId?: bigint) {
  const publicClient = usePublicBlockchainClient();

  return useQuery({
    queryKey: ["subsidy-claim", claimId],
    enabled: Boolean(claimId),
    queryFn: () =>
      publicClient.readContract({
        address: subsidyPayoutAddress,
        abi: SubsidyPayoutAbi,
        functionName: "getClaim",
        args: [claimId as bigint],
      }),
  });
}

const programsTypeMap: Record<CreateProgramDtoType, bigint> = {
  drought: 0n,
  flood: 1n,
  crop_loss: 2n,
  manual: 3n,
};

const programsStatusMap: Record<CreateProgramDtoStatus, bigint> = {
  draft: 0n,
  active: 1n,
};

type CreateProgramOnChainResult = {
  txHash: HexString;
  metadataHash: HexString;
  programsId?: bigint;
};

export function useSubsidyProgramCreation() {
  const base = useSubsidyPayout();

  const toUnixSeconds = useCallback((value: string, label: string): bigint => {
    const ms = Date.parse(value);
    if (Number.isNaN(ms)) {
      throw new Error(`${label} is not a valid date`);
    }
    return BigInt(Math.floor(ms / 1000));
  }, []);

  const toUint = useCallback((value: number | undefined): bigint => {
    if (value === undefined || Number.isNaN(value)) return 0n;
    return BigInt(Math.max(0, Math.round(value)));
  }, []);

  const createProgramOnChain = useCallback(
    async (programs: CreateProgramDto): Promise<CreateProgramOnChainResult> => {
      if (!base.publicClient) {
        throw new Error("Blockchain client is not available");
      }

      if (!programs.payoutRule) {
        throw new Error("Payout rule is required before writing on-chain");
      }

      const eligibility = programs.eligibility;
      const metadataPayload = {
        ...programs,
        eligibility,
        payoutRule: programs.payoutRule,
      };
      const metadataJson = JSON.stringify(metadataPayload);
      const metadataHash = base.hashMetadata(metadataJson);

      const txHash = await base.handleWrite("createProgram", [
        programs.name,
        programs.description ?? "",
        programsTypeMap[programs.type],
        programsStatusMap[programs.status ?? "draft"],
        toUnixSeconds(programs.startDate, "Start date"),
        toUnixSeconds(programs.endDate, "End date"),
        programs.createdBy,
        metadataHash,
        {
          amount: parseEther(programs.payoutRule.amount.toString()),
          maxCap: parseEther(programs.payoutRule.maxCap.toString()),
        },
        {
          hasMinFarmSize: eligibility?.minFarmSize !== undefined,
          hasMaxFarmSize: eligibility?.maxFarmSize !== undefined,
          minFarmSize: toUint(eligibility?.minFarmSize),
          maxFarmSize: toUint(eligibility?.maxFarmSize),
          states: eligibility?.states ?? [],
          districts: eligibility?.districts ?? [],
          cropTypes: eligibility?.cropTypes ?? [],
          certifications: eligibility?.landDocumentTypes ?? [],
        },
      ]);

      console.log("Creating program on-chain:", programs);

      const receipt = await base.publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      const parsed = parseEventLogs({
        abi: SubsidyPayoutAbi as Abi,
        logs: receipt.logs,
        eventName: "ProgramCreated",
      }) as { args: { programsId: bigint } }[];

      const programsId = parsed[0]?.args?.programsId;

      return { txHash, metadataHash, programsId };
    },
    [base, toUnixSeconds, toUint]
  );

  return {
    ...base,
    createProgramOnChain,
  };
}
