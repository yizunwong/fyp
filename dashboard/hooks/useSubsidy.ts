import {
  RequestSubsidyDto,
  SubsidyResponseDto,
  UpdateOnChainSubsidyDto,
  UploadSubsidyEvidenceDto,
  useSubsidyControllerGetSubsidy,
  useSubsidyControllerListSubsidies,
  useSubsidyControllerMarkOnChain,
  useSubsidyControllerRequestSubsidy,
  useSubsidyControllerUploadEvidence,
} from "@/api";
import { parseError } from "@/utils/format-error";

export function useRequestSubsidyMutation() {
  const mutation = useSubsidyControllerRequestSubsidy();
  return {
    ...mutation,
    requestSubsidy: (data: RequestSubsidyDto) =>
      mutation.mutateAsync({ data }),
    error: parseError(mutation.error),
  };
}

export function useSubsidiesQuery() {
  const query = useSubsidyControllerListSubsidies();
  return {
    ...query,
    error: parseError(query.error),
  };
}

export function useSubsidyQuery(id?: string) {
  const query = useSubsidyControllerGetSubsidy(id as string, {
    query: { enabled: Boolean(id) },
  });
  return {
    ...query,
    error: parseError(query.error),
  };
}

export function useMarkSubsidyOnChainMutation() {
  const mutation = useSubsidyControllerMarkOnChain();
  return {
    ...mutation,
    markOnChain: (id: string, data: UpdateOnChainSubsidyDto) =>
      mutation.mutateAsync({ id, data }),
    error: parseError(mutation.error),
  };
}

export function useUploadSubsidyEvidenceMutation() {
  const mutation = useSubsidyControllerUploadEvidence();
  return {
    ...mutation,
    uploadSubsidyEvidence: (id: string, data: UploadSubsidyEvidenceDto) =>
      mutation.mutateAsync({ id, data }),
    error: parseError(mutation.error),
  };
}

export default function useSubsidy() {
  const requestMutation = useRequestSubsidyMutation();
  const subsidiesQuery = useSubsidiesQuery();
  const uploadEvidenceMutation = useUploadSubsidyEvidenceMutation();

  return {
    requestSubsidy: requestMutation.requestSubsidy,
    uploadSubsidyEvidence: uploadEvidenceMutation.uploadSubsidyEvidence,
    isRequestingSubsidy: requestMutation.isPending,
    subsidies: (subsidiesQuery.data as SubsidyResponseDto[]) ?? [],
    isLoadingSubsidies: subsidiesQuery.isLoading,
    refetchSubsidies: subsidiesQuery.refetch,
    subsidiesError: subsidiesQuery.error,
  };
}
