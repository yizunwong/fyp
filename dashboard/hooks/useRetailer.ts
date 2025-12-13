import {
  RateFarmDto,
  useProduceControllerListAllBatches,
  useRetailerControllerListAssignedBatches,
  useRetailerControllerListRetailerProfiles,
  useRetailerControllerRateFarm,
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

export function useBatchesQuery() {
  const query = useProduceControllerListAllBatches();
  return {
    ...query,
    batches: query.data?.data ?? [],
    total: query.data?.count ?? 0,
    error: query.error ? parseError(query.error) : null,
  };
}

export function useRateFarmMutation() {
  const mutation = useRetailerControllerRateFarm();
  return {
    ...mutation,
    rateFarm: (farmId: string, data: RateFarmDto) =>
      mutation.mutateAsync({ farmId, data }),
    error: parseError(mutation.error),
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
