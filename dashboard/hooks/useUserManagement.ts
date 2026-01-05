import {
  useUserControllerCreate,
  useUserControllerFindAll,
  useUserControllerFindOne,
  useUserControllerUpdate,
  useDashboardControllerGetAdminDashboard,
  useDashboardControllerGetUserStats,
  CreateUserDto,
  UpdateUserDto,
  useUserControllerGetProfile,
} from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { parseError } from "@/utils/format-error";

// Note: This type should match UserControllerFindAllParams once the API client is regenerated
export type UserControllerFindAllParams = {
  page?: number;
  limit?: number;
  role?: "FARMER" | "RETAILER" | "GOVERNMENT_AGENCY" | "ADMIN";
  search?: string;
};

export function useUsersQuery(params?: UserControllerFindAllParams) {
  const hasParams = Boolean(
    params?.page || params?.limit || params?.role || params?.search
  );

  const query = useUserControllerFindAll(hasParams ? params : undefined, {
    query: {
      staleTime: 30 * 1000, // 30 seconds
    },
  });

  return {
    ...query,
    users: query.data?.data ?? [],
    total: query.data?.count ?? 0,
    error: query.error ? parseError(query.error) : null,
  };
}

export function useUser(userId: string | null) {
  const query = useUserControllerFindOne(userId || "", {
    query: {
      enabled: !!userId,
      staleTime: 30 * 1000,
    },
  });

  return {
    user: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useAdminDashboard() {
  const query = useDashboardControllerGetAdminDashboard({
    query: {
      staleTime: 60 * 1000, // 1 minute
    },
  });

  return {
    stats: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useUserStats() {
  const query = useDashboardControllerGetUserStats({
    query: {
      staleTime: 60 * 1000, // 1 minute
    },
  });

  return {
    stats: query.data?.data,
    isLoading: query.isLoading,
    error: query.error ? parseError(query.error) : null,
    refetch: query.refetch,
  };
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const mutation = useUserControllerCreate({
    mutation: {
      onSuccess: () => {
        // Invalidate users query to refetch
        queryClient.invalidateQueries({ queryKey: ["/user"] });
        queryClient.invalidateQueries({
          queryKey: ["/dashboard/admin/users/status-stats"],
        });
      },
    },
  });

  return {
    createUser: (data: CreateUserDto) => mutation.mutateAsync({ data }),
    isCreating: mutation.isPending,
    error: mutation.error,
  };
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const mutation = useUserControllerUpdate({
    mutation: {
      onSuccess: () => {
        // Invalidate users queries to refetch
        queryClient.invalidateQueries({ queryKey: ["/user"] });
        queryClient.invalidateQueries({
          queryKey: ["/dashboard/admin/users/status-stats"],
        });
      },
    },
  });

  return {
    updateUser: (id: string, data: UpdateUserDto) =>
      mutation.mutateAsync({ id, data }),
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}

export function useUserProfile() {
  const query = useUserControllerGetProfile({
    query: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  });

  return {
    profile: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
