import { useFarmControllerGetPendingFarm, useFarmControllerListPendingFarms} from "@/api";
import { parseError } from "@/utils/format-error";

export function usePendingFarmsQuery() {
  const query = useFarmControllerListPendingFarms();
  return {
    ...query,
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
