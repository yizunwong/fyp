import {
  useProduceControllerListAllBatches,
  useProduceControllerListRetailerReviewHistory,
  useRetailerControllerListAssignedBatches,
  useRetailerControllerListRetailerProfiles,
  useRetailerControllerVerifyBatch,
  type ProduceControllerListAllBatchesParams,
  type RetailerControllerListAssignedBatchesParams,
} from "@/api";
import { parseError } from "@/utils/format-error";

export function useAssignedBatchesQuery(
  params?: RetailerControllerListAssignedBatchesParams
) {
  const query = useRetailerControllerListAssignedBatches(params);
  return {
    ...query,
    batches: query.data?.data ?? [],
    total: query.data?.count ?? 0,
    error: query.error ? parseError(query.error) : null,
  };
}

export function useBatchesQuery(
  params?: ProduceControllerListAllBatchesParams & {
    search?: string;
    harvestFrom?: string;
    harvestTo?: string;
  }
) {
  const hasQueryParams = Boolean(
    params?.search ||
      params?.harvestFrom ||
      params?.harvestTo ||
      params?.status
  );
  const query = useProduceControllerListAllBatches(
    hasQueryParams ? params : undefined
  );
  return {
    ...query,
    batches: query.data?.data ?? [],
    total: query.data?.count ?? 0,
    error: query.error ? parseError(query.error) : null,
  };
}

export function useReviewHistoryQuery() {
  const query = useProduceControllerListRetailerReviewHistory();
  return {
    ...query,
    reviews: query.data?.data ?? [],
    total: query.data?.count ?? 0,
    error: query.error ? parseError(query.error) : null,
  };
}

export function useRetailersWithProfiles() {
  const query = useRetailerControllerListRetailerProfiles();
  return {
    ...query,
    retailers: query.data?.data ?? [],
    total: query.data?.count ?? 0,
    error: query.error ? parseError(query.error) : null,
  };
}

export function useVerifyBatchAsRetailer() {
  const mutation = useRetailerControllerVerifyBatch();
  return {
    ...mutation,
    verifyBatch: (batchId: string) => 
      mutation.mutateAsync({ batchId }),
    isVerifying: mutation.isPending,
    error: mutation.error ? parseError(mutation.error) : null,
  };
}
