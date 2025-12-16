import {
  useUserControllerCreate,
  useUserControllerFindAll,
  useUserControllerFindOne,
  useUserControllerUpdate,
  useDashboardControllerGetUserStats,
  CreateUserDto,
  UserResponseDto,
  UpdateUserDto,
  UserDetailResponseDto,
  UserStatsDto,
} from "@/api";
import { useQueryClient } from "@tanstack/react-query";

export function useUsers() {
  const query = useUserControllerFindAll({
    query: {
      staleTime: 30 * 1000, // 30 seconds
    },
  });

  return {
    users: query.data?.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
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

export function useUserStats() {
  const query = useDashboardControllerGetUserStats({
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

export function useCreateUser() {
  const queryClient = useQueryClient();
  const mutation = useUserControllerCreate({
    mutation: {
      onSuccess: () => {
        // Invalidate users query to refetch
        queryClient.invalidateQueries({ queryKey: ["/user"] });
        queryClient.invalidateQueries({
          queryKey: ["/dashboard/admin/user-stats"],
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
          queryKey: ["/dashboard/admin/user-stats"],
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

export type {
  UserResponseDto,
  UserDetailResponseDto,
  CreateUserDto,
  UpdateUserDto,
  UserStatsDto,
};
