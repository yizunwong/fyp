import React, { useState, useMemo, useCallback } from "react";
import { View, Text, ScrollView } from "react-native";
import { Plus, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react-native";
import { router } from "expo-router";
import { useUsersQuery, useUserStats, type UserControllerFindAllParams } from "@/hooks/useUserManagement";
import UserTable from "@/components/admin/users/UserTable";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import type { UserResponseDto } from "@/api";
import { useAppLayout } from "@/components/layout/AppLayoutContext";
import Pagination from "@/components/common/Pagination";
import { RightHeaderButton } from "@/components/ui/RightHeaderButton";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const queryParams = useMemo<UserControllerFindAllParams>(() => ({
    page,
    limit: pageSize,
  }), [page, pageSize]);

  const { users, total, isLoading, error, refetch } = useUsersQuery(queryParams);
  const { stats: userStats, isLoading: isLoadingStats } = useUserStats();
  const { isDesktop } = useResponsiveLayout();
  
  const hasNextPage = useMemo(() => {
    return page * pageSize < (total ?? 0);
  }, [page, pageSize, total]);

  const handleCreateUser = useCallback(() => {
    router.push("/dashboard/admin/users/create" as never);
  }, []);

  const layoutMeta = useMemo(
    () => ({
      title: "User Management",
      subtitle: "Manage users, roles, and account status",
      rightHeaderButton: isDesktop ? (
        <RightHeaderButton
          onPress={handleCreateUser}
          label="Create User"
          icon={<Plus color="#fff" size={18} />}
          colors={["#7c3aed", "#6d28d9"]}
        />
      ) : undefined,
      mobile: {
        floatingAction: (
          <FloatingActionButton
            onPress={handleCreateUser}
            icon={<Plus color="#fff" size={18} />}
            colors={["#7c3aed", "#6d28d9"]}
          />
        ),
      },
    }),
    [isDesktop, handleCreateUser]
  );

  useAppLayout(layoutMeta);

  const handleEditUser = (user: UserResponseDto) => {
    router.push(`/dashboard/admin/users/${user.id}` as never);
  };

  if (isLoading || isLoadingStats) {
    return (
      <View className="flex-1 bg-gray-50">
        <LoadingState message="Loading users..." />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50">
        <ErrorState
          message={error || "Failed to load users"}
          onRetry={refetch}
        />
      </View>
    );
  }

  const statusStats = {
    total: userStats?.totalUsers ?? 0,
    active: userStats?.active ?? 0,
    inactive: userStats?.inactive ?? 0,
    suspended: userStats?.suspended ?? 0,
    pendingVerification: userStats?.pendingVerification ?? 0,
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-6 py-6">
        {/* User Status Stats Cards */}
        <View className="flex-row flex-wrap gap-4 mb-6">
          <View className="flex-1 min-w-[150px] bg-white rounded-xl p-4 border border-gray-200">
            <View className="flex-row items-center justify-between mb-2">
              <View className="w-10 h-10 bg-purple-50 rounded-lg items-center justify-center">
                <CheckCircle color="#7c3aed" size={20} />
              </View>
              <Text className="text-2xl font-bold text-gray-900">
                {statusStats.total}
              </Text>
            </View>
            <Text className="text-gray-600 text-sm font-medium">
              Total Users
            </Text>
          </View>

          <View className="flex-1 min-w-[150px] bg-white rounded-xl p-4 border border-gray-200">
            <View className="flex-row items-center justify-between mb-2">
              <View className="w-10 h-10 bg-green-50 rounded-lg items-center justify-center">
                <CheckCircle color="#10b981" size={20} />
              </View>
              <Text className="text-2xl font-bold text-gray-900">
                {statusStats.active}
              </Text>
            </View>
            <Text className="text-gray-600 text-sm font-medium">Active</Text>
          </View>

          <View className="flex-1 min-w-[150px] bg-white rounded-xl p-4 border border-gray-200">
            <View className="flex-row items-center justify-between mb-2">
              <View className="w-10 h-10 bg-gray-50 rounded-lg items-center justify-center">
                <XCircle color="#6b7280" size={20} />
              </View>
              <Text className="text-2xl font-bold text-gray-900">
                {statusStats.inactive}
              </Text>
            </View>
            <Text className="text-gray-600 text-sm font-medium">Inactive</Text>
          </View>

          <View className="flex-1 min-w-[150px] bg-white rounded-xl p-4 border border-gray-200">
            <View className="flex-row items-center justify-between mb-2">
              <View className="w-10 h-10 bg-red-50 rounded-lg items-center justify-center">
                <AlertCircle color="#ef4444" size={20} />
              </View>
              <Text className="text-2xl font-bold text-gray-900">
                {statusStats.suspended}
              </Text>
            </View>
            <Text className="text-gray-600 text-sm font-medium">Suspended</Text>
          </View>

          <View className="flex-1 min-w-[150px] bg-white rounded-xl p-4 border border-gray-200">
            <View className="flex-row items-center justify-between mb-2">
              <View className="w-10 h-10 bg-yellow-50 rounded-lg items-center justify-center">
                <Clock color="#f59e0b" size={20} />
              </View>
              <Text className="text-2xl font-bold text-gray-900">
                {statusStats.pendingVerification}
              </Text>
            </View>
            <Text className="text-gray-600 text-sm font-medium">
              Pending Verification
            </Text>
          </View>
        </View>

        <UserTable users={users} onEdit={handleEditUser} />

        <Pagination
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          isLoading={isLoading}
          hasNext={hasNextPage}
          total={total}
        />
      </View>
    </ScrollView>
  );
}
