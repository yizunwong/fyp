import {
  CreateProduceDto,
  useFarmerControllerCreateProduce,
  useFarmerControllerFindProduces,
} from "@/api";
import { parseError } from "@/utils/format-error";

export function useProduceQuery(farmerId: string) {
  const query = useFarmerControllerFindProduces(farmerId);
  return {
    ...query,
    error: query.error ? parseError(query.error) : null,
  };
}

export function useCreareProduceMutation() {
  const mutation = useFarmerControllerCreateProduce();
  return {
    ...mutation,
    createProduce: (farmId: string, id: string, data: CreateProduceDto) =>
      mutation.mutateAsync({ farmId, id, data }),
    error: parseError(mutation.error),
  };
}

export default function useFarm() {
  const createMutation = useCreareProduceMutation();

  return {
    createProduce: createMutation.createProduce,
    isCreatingProduce: createMutation.isPending,
  };
}

