import {
  CreateProduceDto,
  UploadProduceCertificatesDto,
  UploadProduceImageDto,
  AssignRetailerDto,
  useFarmerControllerCreateProduce,
  useFarmerControllerFindProduces,
  useProduceControllerUploadCertificates,
  useProduceControllerUploadProduceImage,
  useProduceControllerAssignRetailer,
} from "@/api";
import { parseError } from "@/utils/format-error";

export function useProduceQuery() {
  const query = useFarmerControllerFindProduces();
  return {
    ...query,
    error: query.error ? parseError(query.error) : null,
  };
}

export function useCreateProduceMutation() {
  const mutation = useFarmerControllerCreateProduce();
  return {
    ...mutation,
    createProduce: (farmId: string, data: CreateProduceDto) =>
      mutation.mutateAsync({ farmId, data }),
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

export function useUploadProduceCertificatesMutation() {
  const mutation = useProduceControllerUploadCertificates();
  return {
    ...mutation,
    uploadProduceCertificates: (
      id: string,
      data: UploadProduceCertificatesDto
    ) => mutation.mutateAsync({ id, data }),
    error: parseError(mutation.error),
  };
}

export function useAssignRetailerMutation() {
  const mutation = useProduceControllerAssignRetailer();
  return {
    ...mutation,
    assignRetailer: (id: string, data: AssignRetailerDto) =>
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
