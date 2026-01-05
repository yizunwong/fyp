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
  useProduceControllerMarkArrival,
  useProduceControllerCreateProduceReview,
  CreateProduceReviewDto,
  useProduceControllerListPendingReviews,
  FarmerControllerFindProducesParams,
} from "@/api";
import { parseError } from "@/utils/format-error";

export function useProduceQuery(params?: FarmerControllerFindProducesParams & { sort?: string }) {
  const hasParams = Boolean(
    params?.search ||
      params?.harvestFrom ||
      params?.harvestTo ||
      params?.status ||
      params?.sort ||
      params?.page ||
      params?.limit
  );
  const query = useFarmerControllerFindProduces(hasParams ? params : undefined);
  return {
    ...query,
    produces: query.data?.data ?? [],
    total: query.data?.count ?? 0,
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

export function useMarkArrivedMutation() {
  const mutation = useProduceControllerMarkArrival();
  return {
    ...mutation,
    markArrived: (batchId: string) => mutation.mutateAsync({ batchId }),
    error: parseError(mutation.error),
  };
}

export function useRateBatchMuation() {
  const mutation = useProduceControllerCreateProduceReview();
  return {
    ...mutation,
    rateBatch: (batchId: string, data: CreateProduceReviewDto) =>
      mutation.mutateAsync({ batchId, data }),
    error: parseError(mutation.error),
  };
}

export function usePendingReviewQuery(
) {
  const query = useProduceControllerListPendingReviews();
  return {
    ...query,
    batches: query.data?.data ?? [],
    total: query.data?.count ?? 0,
    error: query.error ? parseError(query.error) : null,
  };
}

export default function useFarm() {
  const createMutation = useCreateProduceMutation();

  return {
    createProduce: createMutation.createProduce,
    isCreatingProduce: createMutation.isPending,
  };
}
