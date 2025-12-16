import {
  RequestSubsidyDto,
  UploadSubsidyEvidenceDto,
  useSubsidyControllerApproveSubsidy,
  useSubsidyControllerDisburseSubsidy,
  useSubsidyControllerGetSubsidy,
  useSubsidyControllerListSubsidies,
  useSubsidyControllerRequestSubsidy,
  useSubsidyControllerUploadEvidence,
  SubsidyControllerListSubsidiesParams,
} from "@/api";
import { parseError } from "@/utils/format-error";

export function useRequestSubsidyMutation() {
  const mutation = useSubsidyControllerRequestSubsidy();
  return {
    ...mutation,
    requestSubsidy: (data: RequestSubsidyDto) => mutation.mutateAsync({ data }),
    error: parseError(mutation.error),
  };
}

export function useSubsidiesQuery(
  params?: SubsidyControllerListSubsidiesParams
) {
  const query = useSubsidyControllerListSubsidies(params);
  const subsidies = query.data?.data;
  const parsedError = query.error ? parseError(query.error) : undefined;
  const total = query.data?.count ?? 0;
  return {
    ...query,
    subsidies,
    total,
    error: parsedError,
  };
}

export function useSubsidyQuery(id: string = "") {
  const query = useSubsidyControllerGetSubsidy(id, {
    query: { enabled: Boolean(id) },
  });
  return {
    ...query,
    error: parseError(query.error),
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

export function useApproveSubsidyMutation() {
  const mutation = useSubsidyControllerApproveSubsidy();
  return {
    ...mutation,
    approveSubsidy: (id: string) => mutation.mutateAsync({ id }),
    error: parseError(mutation.error),
  };
}

export function useDisburseSubsidyMutation() {
  const mutation = useSubsidyControllerDisburseSubsidy();
  return {
    ...mutation,
    disburseSubsidy: (id: string) => mutation.mutateAsync({ id }),
    error: parseError(mutation.error),
  };
}

export default function useSubsidy(
  subsidyQueryParams?: SubsidyControllerListSubsidiesParams
) {
  const requestMutation = useRequestSubsidyMutation();
  const subsidiesQuery = useSubsidiesQuery(subsidyQueryParams);
  const uploadEvidenceMutation = useUploadSubsidyEvidenceMutation();
  const approveSubsidyMutation = useApproveSubsidyMutation();
  return {
    requestSubsidy: requestMutation.requestSubsidy,
    uploadSubsidyEvidence: uploadEvidenceMutation.uploadSubsidyEvidence,
    approveSubsidy: approveSubsidyMutation.approveSubsidy,
    isRequestingSubsidy: requestMutation.isPending,
    isUploadingSubsidyEvidence: uploadEvidenceMutation.isPending,
    isApprovingSubsidy: approveSubsidyMutation.isPending,
    subsidies: subsidiesQuery.subsidies,
    totalSubsidies: subsidiesQuery.total,
    isLoadingSubsidies: subsidiesQuery.isLoading,
    refetchSubsidies: subsidiesQuery.refetch,
    subsidiesError: subsidiesQuery.error,
    approveSubsidyError: approveSubsidyMutation.error,
  };
}
