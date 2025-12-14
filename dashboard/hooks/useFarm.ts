import {
  CreateFarmDto,
  FarmerControllerFindFarm200,
  FarmControllerListFarmReviewsParams,
  FarmerControllerFindFarmsParams,
  ProduceListResponseDtoStatus,
  UpdateFarmDto,
  UpdateFarmStatusDto,
  UploadFarmDocumentsDto,
  UploadFarmDocumentsDtoTypesItem,
  getFarmerControllerFindFarmQueryKey,
  useFarmControllerListFarmReviews,
  useFarmControllerUpdateVerificationStatus,
  useFarmControllerUploadDocuments,
  useFarmerControllerCreateFarm,
  useFarmerControllerDeleteFarm,
  useFarmerControllerFindFarms,
  useFarmerControllerUpdateFarm,
} from "@/api";
import { parseError } from "@/utils/format-error";
import { UploadedDocument } from "@/validation/upload";
import { customFetcher } from "@/api/fetch";
import { useQuery } from "@tanstack/react-query";

export type FindFarmQueryParams = {
  search?: string;
  status?: ProduceListResponseDtoStatus;
  harvestFrom?: string;
  harvestTo?: string;
  page?: number;
  limit?: number;
};

export function useCreateFarmMutation() {
  const mutation = useFarmerControllerCreateFarm();
  return {
    ...mutation,
    createFarm: (data: CreateFarmDto) => mutation.mutateAsync({ data }),
    error: parseError(mutation.error),
  };
}

export function useUpdateFarmMutation() {
  const mutation = useFarmerControllerUpdateFarm();
  return {
    ...mutation,
    updateFarm: (farmId: string, data: UpdateFarmDto) =>
      mutation.mutateAsync({ farmId, data }),
    error: parseError(mutation.error),
  };
}

export function useDeleteFarmMutation() {
  const mutation = useFarmerControllerDeleteFarm();
  return {
    ...mutation,
    deleteFarm: (farmId: string) => mutation.mutateAsync({ farmId }),
    error: parseError(mutation.error),
  };
}

export function useFarmsQuery(params?: FarmerControllerFindFarmsParams) {
  const query = useFarmerControllerFindFarms(params);
  return {
    ...query,
    error: query.error ? parseError(query.error) : null,
  };
}

export function useFarmQuery(farmId: string, params?: FindFarmQueryParams) {
  const queryParams = params ?? {};
  const query = useQuery({
    queryKey: getFarmerControllerFindFarmQueryKey(farmId).concat(queryParams),
    queryFn: ({ signal }) =>
      customFetcher<FarmerControllerFindFarm200>({
        url: `/farmer/farm/${farmId}`,
        method: "GET",
        signal,
        params: queryParams as Record<string, string | number>,
      }),
    enabled: Boolean(farmId),
  });
  return {
    ...query,
    error: query.error ? parseError(query.error) : null,
  };
}

export function useUploadFarmDocumentsMutation() {
  const mutation = useFarmControllerUploadDocuments();
  return {
    ...mutation,
    uploadFarmDocuments: (id: string, docs: UploadedDocument[] = []) => {
      const validDocs = (docs ?? []).filter(
        (doc) => typeof Blob !== "undefined" && doc.file instanceof Blob
      );
      if (!validDocs.length) {
        return Promise.resolve();
      }
      const documents = validDocs.map((doc) => doc.file as Blob);
      const types = validDocs.map(
        (doc) => doc.landDocumentType ?? UploadFarmDocumentsDtoTypesItem.OTHERS
      );

      const payload: UploadFarmDocumentsDto = {
        documents,
        types,
      };

      return mutation.mutateAsync({
        id,
        data: payload,
      });
    },
    error: parseError(mutation.error),
  };
}

export function useUpdateFarmStatusMutation() {
  const mutation = useFarmControllerUpdateVerificationStatus();
  return {
    ...mutation,
    updateFarmStatus: (id: string, status: UpdateFarmStatusDto) =>
      mutation.mutateAsync({ id, data: status }),
    error: parseError(mutation.error),
  };
}

export function useFarmReviewsQuery(
  farmId?: string,
  params?: FarmControllerListFarmReviewsParams
) {
  const query = useFarmControllerListFarmReviews(farmId ?? "", params, {
    query: { enabled: !!farmId },
  });
  return {
    ...query,
    reviews: query.data?.data?.reviews ?? [],
    summary: query.data?.data?.summary ?? null,
    error: query.error ? parseError(query.error) : null,
  };
}

export default function useFarm() {
  const createMutation = useCreateFarmMutation();
  const updateMutation = useUpdateFarmMutation();
  const deleteMutation = useDeleteFarmMutation();
  const uploadDocumentsMutation = useUploadFarmDocumentsMutation();

  return {
    createFarm: createMutation.createFarm,
    isCreatingFarm: createMutation.isPending,
    updateFarm: updateMutation.updateFarm,
    isUpdatingFarm: updateMutation.isPending,
    deleteFarm: deleteMutation.deleteFarm,
    isDeletingFarm: deleteMutation.isPending,
    uploadFarmDocuments: uploadDocumentsMutation.uploadFarmDocuments,
    isUploadingDocuments: uploadDocumentsMutation.isPending,
  };
}
