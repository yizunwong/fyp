import {
  CreateFarmDto,
  UpdateFarmDto,
  useFarmerControllerCreateFarm,
  useFarmerControllerDeleteFarm,
  useFarmerControllerFindFarm,
  useFarmerControllerFindFarms,
  useFarmerControllerUpdateFarm,
} from "@/api";
import { parseError } from "@/utils/format-error";

export function useCreateFarmMutation() {
  const mutation = useFarmerControllerCreateFarm();
  return {
    ...mutation,
    createFarm: (id: string, data: CreateFarmDto) =>
      mutation.mutateAsync({ id, data }),
    error: parseError(mutation.error),
  };
}

export function useUpdateFarmMutation() {
  const mutation = useFarmerControllerUpdateFarm();
  return {
    ...mutation,
    updateFarm: (farmerId: string, farmId: string, data: UpdateFarmDto) =>
      mutation.mutateAsync({ id: farmerId, farmId, data }),
    error: parseError(mutation.error),
  };
}

export function useDeleteFarmMutation() {
  const mutation = useFarmerControllerDeleteFarm();
  return {
    ...mutation,
    deleteFarm: (farmerId: string, farmId: string) =>
      mutation.mutateAsync({ id: farmerId, farmId }),
    error: parseError(mutation.error),
  };
}

export function useFarmsQuery(id: string) {
  const query = useFarmerControllerFindFarms(id);
  return {
    ...query,
    error: query.error ? parseError(query.error) : null,
  };
}

export function useFarmQuery(id: string, farmId: string) {
  const query = useFarmerControllerFindFarm(id, farmId);
  return {
    ...query,
    error: query.error ? parseError(query.error) : null,
  };
}

export default function useFarm() {
  const createMutation = useCreateFarmMutation();
  const updateMutation = useUpdateFarmMutation();
  const deleteMutation = useDeleteFarmMutation();

  return {
    createFarm: createMutation.createFarm,
    isCreatingFarm: createMutation.isPending,
    updateFarm: updateMutation.updateFarm,
    isUpdatingFarm: updateMutation.isPending,
    deleteFarm: deleteMutation.deleteFarm,
    isDeletingFarm: deleteMutation.isPending,
  };
}
