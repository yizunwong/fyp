import { useMemo, useState, useCallback } from "react";
import {
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
  useAccount,
  usePublicClient,
} from "wagmi";
import {
  type Abi,
  parseEther,
  keccak256,
  stringToBytes,
  parseEventLogs,
} from "viem";
import Toast from "react-native-toast-message";
import SubsidyPayoutAbi from "@/abi/SubsidyPayout.json";
import type {
  CreatePolicyDto,
  CreatePolicyDtoStatus,
  CreatePolicyDtoType,
  CreatePayoutRuleDtoFrequency,
  CreatePayoutRuleDtoBeneficiaryCategory,
} from "@/api";

type HexString = `0x${string}`;

const subsidyPayoutAddress =
  (process.env.NEXT_PUBLIC_SUBSIDY_PAYOUT_ADDRESS as HexString | undefined) ??
  "0x0000000000000000000000000000000000000000";

export function useSubsidyPayout() {
  const { address: walletAddress } = useAccount();
  const publicClient = usePublicClient();

  const { writeContractAsync, isPending: isWriting } = useWriteContract();
  const [txHash, setTxHash] = useState<HexString | undefined>();

  const { isLoading: isWaitingReceipt, data: receipt } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

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

  const handleWrite = useCallback(
    async (
      fn: Parameters<typeof writeContractAsync>[0]["functionName"],
      args: readonly unknown[],
      valueWei?: bigint
    ) => {
      try {
        const hash = await writeContractAsync({
          ...contractConfig,
          functionName: fn,
          args,
          value: valueWei,
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
      }
    },
    [contractConfig, writeContractAsync]
  );

  const submitClaim = useCallback(
    async (policyId: bigint, metadataJson: string) => {
      const metadataHash = hashMetadata(metadataJson);
      return handleWrite("submitClaim", [policyId, metadataHash]);
    },
    [handleWrite, hashMetadata]
  );

  const enrollInPolicy = useCallback(
    async (policyId: bigint) => handleWrite("enrollInPolicy", [policyId]),
    [handleWrite]
  );

  // Government-only; approval now pays out immediately in the contract.
  const approveClaim = useCallback(
    async (claimId: bigint) => handleWrite("approveClaim", [claimId]),
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

  return {
    walletAddress,
    contractConfig,
    isWriting,
    isWaitingReceipt,
    txHash,
    receipt,
    enrollInPolicy,
    submitClaim,
    approveClaim,
    rejectClaim,
    deposit,
    hashMetadata,
    publicClient,
    handleWrite,
  };
}

export function useSubsidyPolicy(policyId?: bigint) {
  return useReadContract({
    address: subsidyPayoutAddress,
    abi: SubsidyPayoutAbi,
    functionName: "getPolicy",
    args: policyId !== undefined ? [policyId] : undefined,
    query: { enabled: Boolean(policyId) },
  });
}

export function useSubsidyClaim(claimId?: bigint) {
  return useReadContract({
    address: subsidyPayoutAddress,
    abi: SubsidyPayoutAbi,
    functionName: "getClaim",
    args: claimId !== undefined ? [claimId] : undefined,
    query: { enabled: Boolean(claimId) },
  });
}

const policyTypeMap: Record<CreatePolicyDtoType, bigint> = {
  drought: 0n,
  flood: 1n,
  crop_loss: 2n,
  manual: 3n,
};

const policyStatusMap: Record<CreatePolicyDtoStatus, bigint> = {
  draft: 0n,
  active: 1n,
  archived: 2n,
};

const payoutFrequencyMap: Record<CreatePayoutRuleDtoFrequency, bigint> = {
  per_trigger: 0n,
  annual: 1n,
  monthly: 2n,
};

const beneficiaryCategoryMap: Record<
  CreatePayoutRuleDtoBeneficiaryCategory,
  bigint
> = {
  all_farmers: 0n,
  small_medium_farmers: 1n,
  organic_farmers: 2n,
  certified_farmers: 3n,
};

type CreatePolicyOnChainResult = {
  txHash: HexString;
  metadataHash: HexString;
  policyId?: bigint;
};

export function useSubsidyPolicyCreation() {
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

  const createPolicyOnChain = useCallback(
    async (policy: CreatePolicyDto): Promise<CreatePolicyOnChainResult> => {
      if (!base.publicClient) {
        throw new Error("Blockchain client is not available");
      }

      if (!policy.payoutRule) {
        throw new Error("Payout rule is required before writing on-chain");
      }

      const eligibility = policy.eligibility ?? {};
      const metadataPayload = {
        ...policy,
        eligibility,
        payoutRule: policy.payoutRule,
      };
      const metadataJson = JSON.stringify(metadataPayload);
      const metadataHash = base.hashMetadata(metadataJson);

      const txHash = await base.handleWrite("createPolicy", [
        policy.name,
        policy.description ?? "",
        policyTypeMap[policy.type],
        policyStatusMap[policy.status ?? "draft"],
        toUnixSeconds(policy.startDate, "Start date"),
        toUnixSeconds(policy.endDate, "End date"),
        policy.createdBy,
        metadataHash,
        {
          amount: parseEther(policy.payoutRule.amount.toString()),
          maxCap: parseEther(policy.payoutRule.maxCap.toString()),
          frequency: payoutFrequencyMap[policy.payoutRule.frequency],
          beneficiaryCategory:
            beneficiaryCategoryMap[policy.payoutRule.beneficiaryCategory],
        },
        {
          hasMinFarmSize: eligibility.minFarmSize !== undefined,
          hasMaxFarmSize: eligibility.maxFarmSize !== undefined,
          minFarmSize: toUint(eligibility.minFarmSize),
          maxFarmSize: toUint(eligibility.maxFarmSize),
          states: eligibility.states ?? [],
          districts: eligibility.districts ?? [],
          cropTypes: eligibility.cropTypes ?? [],
          certifications: eligibility.certifications ?? [],
        },
      ]);

      const receipt = await base.publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      const parsed = parseEventLogs({
        abi: SubsidyPayoutAbi as Abi,
        logs: receipt.logs,
        eventName: "PolicyCreated",
      }) as { args: { policyId: bigint } }[];

      const policyId = parsed[0]?.args?.policyId;

      return { txHash, metadataHash, policyId };
    },
    [base, toUnixSeconds, toUint]
  );

  return {
    ...base,
    createPolicyOnChain,
  };
}
