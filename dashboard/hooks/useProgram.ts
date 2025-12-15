import {
  CreateProgramDto,
  ProgramResponseDto,
  useProgramControllerCreateProgram,
  useProgramControllerGetPrograms,
  useProgramControllerGetProgram,
  useProgramControllerGetFarmerPrograms,
  useProgramControllerEnrollInProgram,
  useProgramControllerUpdateStatus,
  ProgramControllerGetProgramsParams,
  ProgramControllerGetFarmerProgramsParams,
  type UpdateProgramStatusDto,
} from "@/api";
import { parseError } from "@/utils/format-error";

export function useCreateProgramMutation() {
  const mutation = useProgramControllerCreateProgram();
  const parsedError = mutation.error ? parseError(mutation.error) : undefined;
  return {
    ...mutation,
    createProgram: (data: CreateProgramDto) => mutation.mutateAsync({ data }),
    isCreatingProgram: mutation.isPending,
    error: parsedError,
  };
}

export function useEnrollProgramMutation() {
  const mutation = useProgramControllerEnrollInProgram();
  const parsedError = mutation.error ? parseError(mutation.error) : undefined;
  return {
    ...mutation,
    enrollProgram: (id: string) => mutation.mutateAsync({ id }),
    isEnrollingProgram: mutation.isPending,
    error: parsedError,
  };
}

export function useUpdateProgramStatusMutation() {
  const mutation = useProgramControllerUpdateStatus();
  const parsedError = mutation.error ? parseError(mutation.error) : undefined;
  return {
    ...mutation,
    updateProgramStatus: (id: string, data: UpdateProgramStatusDto) =>
      mutation.mutateAsync({ id, data }),
    isUpdatingStatus: mutation.isPending,
    error: parsedError,
  };
}

export function useProgramsQuery(params?: ProgramControllerGetProgramsParams) {
  const hasParams = Boolean(
    params?.name ||
      params?.status ||
      params?.activeFrom ||
      params?.activeTo ||
      params?.page ||
      params?.limit ||
      params?.type ||
      params?.startDateFrom ||
      params?.startDateTo ||
      params?.endDateFrom ||
      params?.endDateTo ||
      params?.payoutAmountMin ||
      params?.payoutAmountMax ||
      params?.payoutCapMin ||
      params?.payoutCapMax
  );
  const query = useProgramControllerGetPrograms(hasParams ? params : undefined);
  const programs = query.data?.data;
  const parsedError = query.error ? parseError(query.error) : undefined;
  const total = query.data?.count ?? 0;
  return {
    ...query,
    programs,
    total,
    error: parsedError,
  };
}

export function useFarmerProgramsQuery(
  params?: ProgramControllerGetFarmerProgramsParams
) {
  const hasParams = Boolean(params?.page || params?.limit);
  const query = useProgramControllerGetFarmerPrograms(
    hasParams ? params : undefined
  );
  const programs = query.data?.data;
  const parsedError = query.error ? parseError(query.error) : undefined;
  const total = query.data?.count ?? 0;
  return {
    ...query,
    programs,
    total,
    error: parsedError,
  };
}

export function useProgramQuery(id?: string) {
  const query = useProgramControllerGetProgram(id as string, {
    query: { enabled: Boolean(id) },
  });
  const programs = query.data?.data;
  const parsedError = query.error ? parseError(query.error) : undefined;
  return {
    ...query,
    programs,
    error: parsedError,
  };
}

export default function useProgram(
  programQueryParams?: ProgramControllerGetProgramsParams,
  farmerProgramsQueryParams?: ProgramControllerGetFarmerProgramsParams
) {
  const createMutation = useCreateProgramMutation();
  const programsQuery = useProgramsQuery(programQueryParams);
  const enrolledProgramsQuery = useFarmerProgramsQuery(
    farmerProgramsQueryParams
  );

  return {
    createProgram: createMutation.createProgram,
    isCreatingProgram: createMutation.isPending,
    programs: programsQuery.programs,
    isLoadingPrograms: programsQuery.isLoading,
    refetchPrograms: programsQuery.refetch,
    programsError: programsQuery.error,
    enrolledPrograms: enrolledProgramsQuery.programs,
    totalEnrolledPrograms: enrolledProgramsQuery.total,
    isLoadingEnrolledPrograms: enrolledProgramsQuery.isLoading,
    refetchEnrolledPrograms: enrolledProgramsQuery.refetch,
    enrolledProgramsError: enrolledProgramsQuery.error,
  };
}
