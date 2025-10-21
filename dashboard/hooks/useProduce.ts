import { useFarmerControllerFindProduces } from "@/api";
import { parseError } from '@/utils/format-error';

export function useProduceQuery(farmerId: string) {
  const query = useFarmerControllerFindProduces(farmerId);
  return {
    ...query,
    error: query.error ? parseError(query.error) : null,
  };
}
