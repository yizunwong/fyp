import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Users, Shield, Settings, BarChart3 } from "lucide-react-native";
import { router } from "expo-router";
import { useUserStats } from "@/hooks/useUserManagement";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { parseError } from "@/utils/format-error";

const quickActions = [
  {
    id: "users",
    label: "User Management",
    description: "Manage users, roles, and permissions",
    icon: Users,
    route: "/dashboard/admin/users",
    color: "#7c3aed",
    bgColor: "bg-purple-50",
  },
  {
    id: "settings",
    label: "System Settings",
    description: "Configure system preferences",
    icon: Settings,
    route: "/dashboard/admin/settings",
    color: "#6b7280",
    bgColor: "bg-gray-50",
  },
];

export default function AdminDashboardScreen() {
  const { stats, isLoading, error, refetch } = useUserStats();

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50">
        <LoadingState message="Loading dashboard..." />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50">
        <ErrorState
          message={parseError(error) || "Failed to load dashboard stats"}
          onRetry={refetch}
        />
      </View>
    );
  }

  const userStats = {
    total: stats?.totalUsers ?? 0,
    farmers: stats?.farmers ?? 0,
    retailers: stats?.retailers ?? 0,
    agencies: stats?.agencies ?? 0,
    admins: stats?.admins ?? 0,
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-6 py-6">
        <View className="mb-6">
          <Text className="text-gray-900 text-3xl font-bold">
            Admin Dashboard
          </Text>
          <Text className="text-gray-600 text-base mt-2">
            System administration and user management
          </Text>
        </View>

        {/* Stats Cards */}
        <View className="flex-row flex-wrap gap-4 mb-6">
          <View className="flex-1 min-w-[150px] bg-white rounded-xl p-4 border border-gray-200">
            <View className="flex-row items-center justify-between mb-2">
              <View className="w-10 h-10 bg-purple-50 rounded-lg items-center justify-center">
                <Users color="#7c3aed" size={20} />
              </View>
              <Text className="text-2xl font-bold text-gray-900">
                {userStats.total}
              </Text>
            </View>
            <Text className="text-gray-600 text-sm font-medium">
              Total Users
            </Text>
          </View>

          <View className="flex-1 min-w-[150px] bg-white rounded-xl p-4 border border-gray-200">
            <View className="flex-row items-center justify-between mb-2">
              <View className="w-10 h-10 bg-green-50 rounded-lg items-center justify-center">
                <Shield color="#10b981" size={20} />
              </View>
              <Text className="text-2xl font-bold text-gray-900">
                {userStats.farmers}
              </Text>
            </View>
            <Text className="text-gray-600 text-sm font-medium">Farmers</Text>
          </View>

          <View className="flex-1 min-w-[150px] bg-white rounded-xl p-4 border border-gray-200">
            <View className="flex-row items-center justify-between mb-2">
              <View className="w-10 h-10 bg-blue-50 rounded-lg items-center justify-center">
                <BarChart3 color="#3b82f6" size={20} />
              </View>
              <Text className="text-2xl font-bold text-gray-900">
                {userStats.retailers}
              </Text>
            </View>
            <Text className="text-gray-600 text-sm font-medium">Retailers</Text>
          </View>

          <View className="flex-1 min-w-[150px] bg-white rounded-xl p-4 border border-gray-200">
            <View className="flex-row items-center justify-between mb-2">
              <View className="w-10 h-10 bg-indigo-50 rounded-lg items-center justify-center">
                <Shield color="#6366f1" size={20} />
              </View>
              <Text className="text-2xl font-bold text-gray-900">
                {userStats.agencies}
              </Text>
            </View>
            <Text className="text-gray-600 text-sm font-medium">Agencies</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-gray-900 text-xl font-bold mb-4">
            Quick Actions
          </Text>
          <View className="gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <TouchableOpacity
                  key={action.id}
                  onPress={() => router.push(action.route as never)}
                  className="flex-row items-center p-4 bg-white rounded-xl border border-gray-200"
                >
                  <View
                    className={`w-12 h-12 ${action.bgColor} rounded-lg items-center justify-center mr-4`}
                  >
                    <Icon color={action.color} size={24} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 text-base font-semibold">
                      {action.label}
                    </Text>
                    <Text className="text-gray-600 text-sm mt-1">
                      {action.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Recent Activity Placeholder */}
        <View className="bg-white rounded-xl p-4 border border-gray-200">
          <Text className="text-gray-900 text-lg font-semibold mb-2">
            System Overview
          </Text>
          <Text className="text-gray-600 text-sm">
            Monitor system health, user activity, and manage platform settings
            from this dashboard.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
