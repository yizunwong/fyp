import {
  CreatePolicyDto,
  PolicyResponseDto,
  usePolicyControllerCreatePolicy,
  usePolicyControllerGetPolicies,
  usePolicyControllerGetPolicy,
} from "@/api";
import { parseError } from "@/utils/format-error";

export function useCreatePolicyMutation() {
  const mutation = usePolicyControllerCreatePolicy();
  return {
    ...mutation,
    createPolicy: (data: CreatePolicyDto) =>
      mutation.mutateAsync({ data }),
    isCreatingPolicy: mutation.isPending,
    error: parseError(mutation.error),
  };
}

export function usePoliciesQuery() {
  const query = usePolicyControllerGetPolicies();
  return {
    ...query,
    error: parseError(query.error),
  };
}

export function usePolicyQuery(id?: string) {
  const query = usePolicyControllerGetPolicy(id as string, {
    query: { enabled: Boolean(id) },
  });
  return {
    ...query,
    error: parseError(query.error),
  };
}

export default function usePolicy() {
  const createMutation = useCreatePolicyMutation();
  const policiesQuery = usePoliciesQuery();

  return {
    createPolicy: createMutation.createPolicy,
    isCreatingPolicy: createMutation.isPending,
    policies: (policiesQuery.data as PolicyResponseDto[]) ?? [],
    isLoadingPolicies: policiesQuery.isLoading,
    refetchPolicies: policiesQuery.refetch,
    policiesError: policiesQuery.error,
  };
}
