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
  const parsedError = mutation.error ? parseError(mutation.error) : undefined;
  return {
    ...mutation,
    createPolicy: (data: CreatePolicyDto) =>
      mutation.mutateAsync({ data }),
    isCreatingPolicy: mutation.isPending,
    error: parsedError,
  };
}

export function usePoliciesQuery() {
  const query = usePolicyControllerGetPolicies();
  const policies = (query.data?.data as PolicyResponseDto[] | undefined) ?? [];
  const parsedError = query.error ? parseError(query.error) : undefined;
  return {
    ...query,
    policies,
    error: parsedError,
  };
}

export function usePolicyQuery(id?: string) {
  const query = usePolicyControllerGetPolicy(id as string, {
    query: { enabled: Boolean(id) },
  });
  const policy = query.data?.data as PolicyResponseDto | undefined;
  const parsedError = query.error ? parseError(query.error) : undefined;
  return {
    ...query,
    policy,
    error: parsedError,
  };
}

export default function usePolicy() {
  const createMutation = useCreatePolicyMutation();
  const policiesQuery = usePoliciesQuery();

  return {
    createPolicy: createMutation.createPolicy,
    isCreatingPolicy: createMutation.isPending,
    policies: policiesQuery.policies,
    isLoadingPolicies: policiesQuery.isLoading,
    refetchPolicies: policiesQuery.refetch,
    policiesError: policiesQuery.error,
  };
}
