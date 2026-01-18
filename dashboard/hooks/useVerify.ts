import {
  useVerifyControllerVerifyBatch,
  getVerifyControllerVerifyBatchQueryKey,
} from "@/api";
import { parseError } from "@/utils/format-error";
import { useVerifyBatchAsRetailer } from "./useRetailer";
import { useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useVerifyBatchQuery(batchId: string, isRetailer: boolean = false) {
  const queryClient = useQueryClient();

  const verifyQuery = useVerifyControllerVerifyBatch(batchId, {
    query: {
      enabled: !!batchId,
    },
  });

  const retailerMutation = useVerifyBatchAsRetailer();

  const handleVerifyBatch = useCallback(
    async (batchIdToVerify: string) => {
      try {
        await retailerMutation.verifyBatch(batchIdToVerify);
        await queryClient.invalidateQueries({
          queryKey: getVerifyControllerVerifyBatchQueryKey(batchIdToVerify),
        });
      } catch (error) {
        throw error;
      }
    },
    [retailerMutation, queryClient]
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
