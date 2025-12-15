import {
  useFarmControllerGetPendingFarm,
  useFarmControllerListPendingFarms,
  type FarmControllerListPendingFarmsParams,
} from "@/api";
import { parseError } from "@/utils/format-error";

export function usePendingFarmsQuery(
  params?: FarmControllerListPendingFarmsParams
) {
  const hasParams = Boolean(
    params?.name ||
      params?.location ||
      params?.status ||
      params?.category ||
      params?.sizeUnit ||
      params?.minSize ||
      params?.maxSize ||
      params?.page ||
      params?.limit
  );

  const query = useFarmControllerListPendingFarms(
    hasParams ? params : undefined
  );
  return {
    ...query,
    farms: query.data?.data ?? [],
    total: query.data?.count ?? 0,
    error: query.error ? parseError(query.error) : null,
  };
}

export function usePendingFarmQuery(farmId: string) {
  const query = useFarmControllerGetPendingFarm(farmId, {
    query: {
      enabled: Boolean(farmId),
    },
  });
  return {
    ...query,
    error: query.error ? parseError(query.error) : null,
  };
}
