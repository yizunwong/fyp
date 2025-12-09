import {
  CreatePolicyDto,
  PolicyResponseDto,
  usePolicyControllerCreatePolicy,
  usePolicyControllerGetPolicies,
  usePolicyControllerGetPolicy,
  usePolicyControllerGetFarmerPolicies,
  usePolicyControllerEnrollInPolicy,
} from "@/api";
import { parseError } from "@/utils/format-error";

export function useCreatePolicyMutation() {
  const mutation = usePolicyControllerCreatePolicy();
  const parsedError = mutation.error ? parseError(mutation.error) : undefined;
  return {
    ...mutation,
    createPolicy: (data: CreatePolicyDto) => mutation.mutateAsync({ data }),
    isCreatingPolicy: mutation.isPending,
    error: parsedError,
  };
}

export function useEnrollPolicyMutation() {
  const mutation = usePolicyControllerEnrollInPolicy();
  const parsedError = mutation.error ? parseError(mutation.error) : undefined;
  return {
    ...mutation,
    enrollPolicy: (id: string) => mutation.mutateAsync({ id }),
    isEnrollingPolicy: mutation.isPending,
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

export function useFarmerPoliciesQuery() {
  const query = usePolicyControllerGetFarmerPolicies();
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
  const enrolledPoliciesQuery = useFarmerPoliciesQuery();

  return {
    createPolicy: createMutation.createPolicy,
    isCreatingPolicy: createMutation.isPending,
    policies: policiesQuery.policies,
    isLoadingPolicies: policiesQuery.isLoading,
    refetchPolicies: policiesQuery.refetch,
    policiesError: policiesQuery.error,
    enrolledPolicies: enrolledPoliciesQuery.policies,
    isLoadingEnrolledPolicies: enrolledPoliciesQuery.isLoading,
    refetchEnrolledPolicies: enrolledPoliciesQuery.refetch,
    enrolledPoliciesError: enrolledPoliciesQuery.error,
  };
}
