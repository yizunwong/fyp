import {
  CreateProgramDto,
  ProgramResponseDto,
  useProgramControllerCreateProgram,
  useProgramControllerGetPrograms,
  useProgramControllerGetProgram,
  useProgramControllerGetFarmerPrograms,
  useProgramControllerEnrollInProgram,
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

export function useProgramsQuery() {
  const query = useProgramControllerGetPrograms();
  const programs = (query.data?.data as ProgramResponseDto[] | undefined) ?? [];
  const parsedError = query.error ? parseError(query.error) : undefined;
  return {
    ...query,
    programs,
    error: parsedError,
  };
}

export function useFarmerProgramsQuery() {
  const query = useProgramControllerGetFarmerPrograms();
  const programs = (query.data?.data as ProgramResponseDto[] | undefined) ?? [];
  const parsedError = query.error ? parseError(query.error) : undefined;
  return {
    ...query,
    programs,
    error: parsedError,
  };
}

export function useProgramQuery(id?: string) {
  const query = useProgramControllerGetProgram(id as string, {
    query: { enabled: Boolean(id) },
  });
  const programs = query.data?.data as ProgramResponseDto | undefined;
  const parsedError = query.error ? parseError(query.error) : undefined;
  return {
    ...query,
    programs,
    error: parsedError,
  };
}

export default function useProgram() {
  const createMutation = useCreateProgramMutation();
  const programsQuery = useProgramsQuery();
  const enrolledProgramsQuery = useFarmerProgramsQuery();

  return {
    createProgram: createMutation.createProgram,
    isCreatingProgram: createMutation.isPending,
    programs: programsQuery.programs,
    isLoadingPrograms: programsQuery.isLoading,
    refetchPrograms: programsQuery.refetch,
    programsError: programsQuery.error,
    enrolledPrograms: enrolledProgramsQuery.programs,
    isLoadingEnrolledPrograms: enrolledProgramsQuery.isLoading,
    refetchEnrolledPrograms: enrolledProgramsQuery.refetch,
    enrolledProgramsError: enrolledProgramsQuery.error,
  };
}
