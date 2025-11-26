import { useMemo, useState, useCallback } from "react";
import {
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
  useAccount,
  usePublicClient,
} from "wagmi";
import { parseEther, keccak256, stringToBytes } from "viem";
import Toast from "react-native-toast-message";
import SubsidyPayoutAbi from "@/abi/SubsidyPayout.json";

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

  const approveAndPayout = useCallback(
    async (claimId: bigint) => handleWrite("approveAndPayout", [claimId]),
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
    submitClaim,
    approveAndPayout,
    deposit,
    hashMetadata,
    publicClient,
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
