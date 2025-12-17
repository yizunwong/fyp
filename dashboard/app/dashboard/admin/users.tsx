import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Plus } from "lucide-react-native";
import { router } from "expo-router";
import { useUsers } from "@/hooks/useUserManagement";
import UserTable from "@/components/admin/users/UserTable";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { parseError } from "@/utils/format-error";
import type { UserResponseDto } from "@/api";
import { useAppLayout } from "@/components/layout/AppLayoutContext";

export default function AdminUsersPage() {
  const { users, isLoading, error, refetch } = useUsers();

  useAppLayout({
    title: "User Management",
    subtitle: "Manage users, roles, and account status",
  });

  const handleEditUser = (user: UserResponseDto) => {
    router.push(`/dashboard/admin/users/${user.id}` as never);
  };

  const handleCreateUser = () => {
    router.push("/dashboard/admin/users/create" as never);
  };

  if (isLoading) {
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
          message={parseError(error) || "Failed to load users"}
          onRetry={refetch}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-6 py-6">
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-1" />
          <TouchableOpacity
            onPress={handleCreateUser}
            className="flex-row items-center gap-2 px-4 py-2.5 bg-purple-600 rounded-xl"
          >
            <Plus color="#ffffff" size={20} />
            <Text className="text-white text-base font-semibold">
              Create User
            </Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-gray-900 text-lg font-semibold">
                Total Users
              </Text>
              <Text className="text-gray-600 text-sm mt-1">
                {users.length} registered users
              </Text>
            </View>
            <View className="flex-row gap-4">
              <View className="items-end">
                <Text className="text-gray-900 text-2xl font-bold">
                  {users.filter((u) => u.role === "FARMER").length}
                </Text>
                <Text className="text-gray-600 text-xs">Farmers</Text>
              </View>
              <View className="items-end">
                <Text className="text-gray-900 text-2xl font-bold">
                  {users.filter((u) => u.role === "RETAILER").length}
                </Text>
                <Text className="text-gray-600 text-xs">Retailers</Text>
              </View>
              <View className="items-end">
                <Text className="text-gray-900 text-2xl font-bold">
                  {users.filter((u) => u.role === "GOVERNMENT_AGENCY").length}
                </Text>
                <Text className="text-gray-600 text-xs">Agencies</Text>
              </View>
            </View>
          </View>
        </View>

        <UserTable users={users} onEdit={handleEditUser} />
      </View>
    </View>
  );
}
