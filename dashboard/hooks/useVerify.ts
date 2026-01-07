import {
  useVerifyControllerVerifyBatch,
  useAuthControllerProfile,
  getVerifyControllerVerifyBatchQueryKey,
} from "@/api";
import { parseError } from "@/utils/format-error";
import { useVerifyBatchAsRetailer } from "./useRetailer";
import { useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useVerifyBatchQuery(batchId: string) {
  const { data: profileResponse } = useAuthControllerProfile();
  const userRole = profileResponse?.data?.role;
  const isRetailer = userRole === "RETAILER";
  const queryClient = useQueryClient();

  // All users can query verification status (read-only)
  const verifyQuery = useVerifyControllerVerifyBatch(batchId, {
    query: {
      enabled: !!batchId,
    },
  });

  // Retailers can also verify batches (mutation)
  const retailerMutation = useVerifyBatchAsRetailer();

  // Wrapper function to verify and refetch
  const handleVerifyBatch = useCallback(
    async (batchIdToVerify: string) => {
      try {
        await retailerMutation.verifyBatch(batchIdToVerify);
        // Refetch verification status after successful verification
        await queryClient.invalidateQueries({
          queryKey: getVerifyControllerVerifyBatchQueryKey(batchIdToVerify),
        });
      } catch (error) {
        // Error is handled by the mutation
        throw error;
      }
    },
    [retailerMutation.verifyBatch, queryClient]
  );

  return useMemo(() => {
    const baseResult = {
      ...verifyQuery,
      error: verifyQuery.error ? parseError(verifyQuery.error) : null,
      isRetailer,
    };

    if (isRetailer) {
      return {
        ...baseResult,
        verifyBatch: handleVerifyBatch,
        isVerifying: retailerMutation.isVerifying,
        verifyError: retailerMutation.error,
      };
    }

    return {
      ...baseResult,
      verifyBatch: undefined,
      isVerifying: false,
      verifyError: null,
    };
  }, [isRetailer, verifyQuery, retailerMutation, handleVerifyBatch]);
}
