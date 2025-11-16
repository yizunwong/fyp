import {
  CreateProduceDto,
  UploadProduceImageDto,
  useFarmerControllerCreateProduce,
  useFarmerControllerFindProduces,
  useProduceControllerUploadProduceImage,
} from "@/api";
import { parseError } from "@/utils/format-error";

export function useProduceQuery(farmerId: string) {
  const query = useFarmerControllerFindProduces(farmerId);
  return {
    ...query,
    error: query.error ? parseError(query.error) : null,
  };
}

export function useCreateProduceMutation() {
  const mutation = useFarmerControllerCreateProduce();
  return {
    ...mutation,
    createProduce: (farmId: string, id: string, data: CreateProduceDto) =>
      mutation.mutateAsync({ farmId, id, data }),
    error: parseError(mutation.error),
  };
}

export function useUploadProduceImageMutation() {
  const mutation = useProduceControllerUploadProduceImage();
  return {
    ...mutation,
    uploadProduceImage: (id: string, data: UploadProduceImageDto) =>
      mutation.mutateAsync({ id, data }),
    error: parseError(mutation.error),
  };
}

export default function useFarm() {
  const createMutation = useCreateProduceMutation();

  return {
    createProduce: createMutation.createProduce,
    isCreatingProduce: createMutation.isPending,
  };
}
