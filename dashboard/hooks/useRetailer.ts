import {
  useProduceControllerListAllBatches,
  useProduceControllerListRetailerReviewHistory,
  useRetailerControllerListAssignedBatches,
  useRetailerControllerListRetailerProfiles,
  type ProduceControllerListAllBatchesParams,
} from "@/api";
import { parseError } from "@/utils/format-error";

export function useAssignedBatchesQuery() {
  const query = useRetailerControllerListAssignedBatches();
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
