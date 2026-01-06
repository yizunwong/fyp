import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Edit2, Mail, User } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { UserResponseDto } from "@/api";

export interface UserCardProps {
  user: UserResponseDto;
  onEdit: (user: UserResponseDto) => void;
}

const ROLE_COLORS: Record<string, { bg: string; text: string; gradient: [string, string] }> = {
  FARMER: {
    bg: "bg-green-50",
    text: "text-green-700",
    gradient: ["#10b981", "#059669"],
  },
  RETAILER: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    gradient: ["#3b82f6", "#2563eb"],
  },
  GOVERNMENT_AGENCY: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    gradient: ["#7c3aed", "#6d28d9"],
  },
  ADMIN: {
    bg: "bg-red-50",
    text: "text-red-700",
    gradient: ["#ef4444", "#dc2626"],
  },
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  ACTIVE: { bg: "bg-emerald-100", text: "text-emerald-700" },
  INACTIVE: { bg: "bg-gray-100", text: "text-gray-700" },
  SUSPENDED: { bg: "bg-red-100", text: "text-red-700" },
  PENDING_VERIFICATION: { bg: "bg-yellow-100", text: "text-yellow-700" },
};

function RoleBadge({ role }: { role: string }) {
  const colorClass = ROLE_COLORS[role] || { bg: "bg-gray-100", text: "text-gray-700" };
  return (
    <View className={`px-2.5 py-1 rounded-full ${colorClass.bg} self-start`}>
      <Text className={`text-xs font-semibold ${colorClass.text}`}>
        {role.replace(/_/g, " ")}
      </Text>
    </View>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorClass = STATUS_COLORS[status] || { bg: "bg-gray-100", text: "text-gray-700" };
  return (
    <View className={`px-2.5 py-1 rounded-full ${colorClass.bg} self-start`}>
      <Text className={`text-xs font-semibold ${colorClass.text}`}>
        {status.replace(/_/g, " ")}
      </Text>
    </View>
  );
}

export default function UserCard({ user, onEdit }: UserCardProps) {
  const roleColors = ROLE_COLORS[user.role] || ROLE_COLORS.ADMIN;

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-3">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1 mr-3">
          <View className="flex-row items-center gap-2 mb-1">
            <View className={`w-10 h-10 ${roleColors.bg} rounded-lg items-center justify-center`}>
              <User color={roleColors.gradient[0]} size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 dark:text-gray-100 text-base font-bold">
                {user.username}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                ID: {user.id.slice(0, 8)}...
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="gap-2 mb-4">
        <View className="flex-row items-center gap-2">
          <Mail color="#6b7280" size={16} />
          <Text className="text-gray-700 dark:text-gray-300 text-sm flex-1" numberOfLines={1}>
            {user.email}
          </Text>
        </View>

        <View className="flex-row items-center gap-2 flex-wrap">
          <Text className="text-gray-600 dark:text-gray-400 text-xs">Role:</Text>
          <RoleBadge role={user.role} />
        </View>

        <View className="flex-row items-center gap-2 flex-wrap">
          <Text className="text-gray-600 dark:text-gray-400 text-xs">Status:</Text>
          {/* Note: Status field needs to be added to UserResponseDto in backend */}
          <StatusBadge status="ACTIVE" />
        </View>
      </View>

      <TouchableOpacity
        onPress={() => onEdit(user)}
        className="rounded-lg overflow-hidden"
      >
        <LinearGradient
          colors={roleColors.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex-row items-center justify-center gap-2 py-2.5"
        >
          <Edit2 color="#fff" size={16} />
          <Text className="text-white text-sm font-semibold">Edit User</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

