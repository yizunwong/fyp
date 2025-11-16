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
    createFarm: (data: CreateFarmDto) =>
      mutation.mutateAsync({ data }),
    error: parseError(mutation.error),
  };
}

export function useUpdateFarmMutation() {
  const mutation = useFarmerControllerUpdateFarm();
  return {
    ...mutation,
    updateFarm: (farmId: string, data: UpdateFarmDto) =>
      mutation.mutateAsync({  farmId, data }),
    error: parseError(mutation.error),
  };
}

export function useDeleteFarmMutation() {
  const mutation = useFarmerControllerDeleteFarm();
  return {
    ...mutation,
    deleteFarm: (farmId: string) =>
      mutation.mutateAsync({ farmId }),
    error: parseError(mutation.error),
  };
}

export function useFarmsQuery() {
  const query = useFarmerControllerFindFarms();
  return {
    ...query,
    error: query.error ? parseError(query.error) : null,
  };
}

export function useFarmQuery(farmId: string) {
  const query = useFarmerControllerFindFarm(farmId);
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
