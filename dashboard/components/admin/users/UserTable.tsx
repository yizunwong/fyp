import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Edit2, MoreVertical } from "lucide-react-native";
import type { UserResponseDto } from "@/api";

export interface UserTableProps {
  users: UserResponseDto[];
  onEdit: (user: UserResponseDto) => void;
  onStatusChange?: (user: UserResponseDto, status: string) => void;
}

const ROLE_COLORS: Record<string, string> = {
  FARMER: "bg-green-100 text-green-700",
  RETAILER: "bg-blue-100 text-blue-700",
  GOVERNMENT_AGENCY: "bg-purple-100 text-purple-700",
  ADMIN: "bg-red-100 text-red-700",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-gray-100 text-gray-700",
  SUSPENDED: "bg-red-100 text-red-700",
  PENDING_VERIFICATION: "bg-yellow-100 text-yellow-700",
};

function RoleBadge({ role }: { role: string }) {
  const colorClass = ROLE_COLORS[role] || "bg-gray-100 text-gray-700";
  return (
    <View className={`px-2 py-1 rounded-full ${colorClass} self-start`}>
      <Text className="text-xs font-semibold">{role.replace("_", " ")}</Text>
    </View>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorClass = STATUS_COLORS[status] || "bg-gray-100 text-gray-700";
  return (
    <View className={`px-2 py-1 rounded-full ${colorClass} self-start`}>
      <Text className="text-xs font-semibold">{status.replace("_", " ")}</Text>
    </View>
  );
}

export default function UserTable({
  users,
  onEdit,
  onStatusChange,
}: UserTableProps) {
  if (users.length === 0) {
    return (
      <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <Text className="text-gray-500 dark:text-gray-400 text-center text-base">
          No users found
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <View className="flex-row bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
        <Text className="flex-[1.2] text-gray-600 dark:text-gray-300 text-xs font-semibold uppercase tracking-wide">
          User
        </Text>
        <Text className="flex-[1.5] text-gray-600 text-xs font-semibold uppercase tracking-wide">
          Email
        </Text>
        <Text className="flex-[0.7] text-gray-600 text-xs font-semibold uppercase tracking-wide">
          Role
        </Text>
        <Text className="flex-[0.7] text-gray-600 text-xs font-semibold uppercase tracking-wide">
          Status
        </Text>
        <Text className="flex-[0.5] text-gray-600 text-xs font-semibold uppercase tracking-wide text-right">
          Actions
        </Text>
      </View>

      <ScrollView className="max-h-[600px]">
        {users.map((user, index) => (
          <View
            key={user.id}
            className={`flex-row items-center px-6 py-4 ${
              index !== users.length - 1 ? "border-b border-gray-100 dark:border-gray-700" : ""
            }`}
          >
            <View className="flex-[1.2]">
              <Text className="text-gray-900 dark:text-gray-100 text-base font-semibold">
                {user.username}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">ID: {user.id.slice(0, 8)}...</Text>
            </View>
            <View className="flex-[1.5]">
              <Text className="text-gray-700 dark:text-gray-300 text-sm">{user.email}</Text>
            </View>
            <View className="flex-[0.7]">
              <RoleBadge role={user.role} />
            </View>
            <View className="flex-[0.7]">
              {/* Note: Status field needs to be added to UserResponseDto in backend */}
              <StatusBadge status="ACTIVE" />
            </View>
            <View className="flex-[0.5] items-end">
              <TouchableOpacity
                onPress={() => onEdit(user)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Edit2 color="#6b7280" size={18} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

