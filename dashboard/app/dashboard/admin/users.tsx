import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from "react-native";
import {
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
} from "lucide-react-native";
import { router } from "expo-router";
import {
  useUsersQuery,
  useUserStats,
  type UserControllerFindAllParams,
} from "@/hooks/useUserManagement";
import UserTable from "@/components/admin/users/UserTable";
import UserCard from "@/components/admin/users/UserCard";
import type { UserResponseDto } from "@/api";
import { useAppLayout } from "@/components/layout/AppLayoutContext";
import Pagination from "@/components/common/Pagination";
import { RightHeaderButton } from "@/components/ui/RightHeaderButton";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import UserFilters, {
  type RoleFilter,
} from "@/components/admin/users/UserFilters";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [showFilters, setShowFilters] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter]);

  const queryParams = useMemo<UserControllerFindAllParams>(() => {
    const params: UserControllerFindAllParams = {
      page,
      limit: pageSize,
    };
    if (debouncedSearch) params.search = debouncedSearch;
    if (roleFilter !== "ALL") params.role = roleFilter;
    return params;
  }, [page, pageSize, debouncedSearch, roleFilter]);

  const { users, total, isLoading, error, refetch } =
    useUsersQuery(queryParams);
  const { stats: userStats } = useUserStats();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;

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

  const handleClearRoleFilter = useCallback(() => {
    setRoleFilter("ALL");
  }, []);

  const statusStats = {
    total: userStats?.totalUsers ?? 0,
    active: userStats?.active ?? 0,
    inactive: userStats?.inactive ?? 0,
    suspended: userStats?.suspended ?? 0,
    pendingVerification: userStats?.pendingVerification ?? 0,
  };

  const pageContent = (
    <View className="px-6 py-6">
      {/* User Status Stats Cards */}
      <View className="flex-row flex-wrap gap-4 mb-6">
        <View className="flex-1 min-w-[150px] bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center justify-between mb-2">
            <View className="w-10 h-10 bg-purple-50 rounded-lg items-center justify-center">
              <CheckCircle color="#7c3aed" size={20} />
            </View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {statusStats.total}
            </Text>
          </View>
          <Text className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Users</Text>
        </View>

        <View className="flex-1 min-w-[150px] bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center justify-between mb-2">
            <View className="w-10 h-10 bg-green-50 rounded-lg items-center justify-center">
              <CheckCircle color="#10b981" size={20} />
            </View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {statusStats.active}
            </Text>
          </View>
          <Text className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active</Text>
        </View>

        <View className="flex-1 min-w-[150px] bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center justify-between mb-2">
            <View className="w-10 h-10 bg-gray-50 dark:bg-gray-700 rounded-lg items-center justify-center">
              <XCircle color="#6b7280" size={20} />
            </View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {statusStats.inactive}
            </Text>
          </View>
          <Text className="text-gray-600 dark:text-gray-400 text-sm font-medium">Inactive</Text>
        </View>

        <View className="flex-1 min-w-[150px] bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center justify-between mb-2">
            <View className="w-10 h-10 bg-red-50 rounded-lg items-center justify-center">
              <AlertCircle color="#ef4444" size={20} />
            </View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {statusStats.suspended}
            </Text>
          </View>
          <Text className="text-gray-600 dark:text-gray-400 text-sm font-medium">Suspended</Text>
        </View>

        <View className="flex-1 min-w-[150px] bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center justify-between mb-2">
            <View className="w-10 h-10 bg-yellow-50 rounded-lg items-center justify-center">
              <Clock color="#f59e0b" size={20} />
            </View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {statusStats.pendingVerification}
            </Text>
          </View>
          <Text className="text-gray-600 dark:text-gray-400 text-sm font-medium">
            Pending Verification
          </Text>
        </View>
      </View>

      <UserFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        roleFilter={roleFilter}
        onRoleChange={setRoleFilter}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
        onClearRoleFilter={handleClearRoleFilter}
      />

      <View className="mb-4">
        <Text className="text-gray-900 dark:text-gray-100 text-sm font-bold mb-3">
          {users.length} {users.length === 1 ? "User" : "Users"}
        </Text>
      </View>

      {isLoading ? (
        <View className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 items-center">
          <Text className="text-gray-900 dark:text-gray-100 text-base font-bold mt-4">
            Loading users...
          </Text>
        </View>
      ) : error ? (
        <View className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 items-center">
          <Text className="text-gray-900 dark:text-gray-100 text-base font-bold mt-4">
            {error || "Failed to load users"}
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="mt-4 px-4 py-2 bg-purple-600 rounded-lg"
          >
            <Text className="text-white text-sm font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : isDesktop ? (
        <UserTable users={users} onEdit={handleEditUser} />
      ) : (
        <View>
          {users.map((user) => (
            <UserCard key={user.id} user={user} onEdit={handleEditUser} />
          ))}
        </View>
      )}

      {users.length === 0 && !isLoading && !error && (
        <View className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 items-center">
          <Text className="text-gray-900 dark:text-gray-100 text-base font-bold mt-4">
            No users found
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm text-center mt-2">
            Try adjusting your search or filters
          </Text>
        </View>
      )}

      <Pagination
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        isLoading={isLoading}
        hasNext={hasNextPage}
        total={total}
      />
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-dark-bg">
      {isDesktop ? (
        pageContent
      ) : (
        <ScrollView className="flex-1">{pageContent}</ScrollView>
      )}
    </View>
  );
}
