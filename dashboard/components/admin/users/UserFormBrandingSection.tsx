import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Users, Shield, Settings } from "lucide-react-native";

interface UserFormBrandingSectionProps {
  isEditMode: boolean;
  isDesktop: boolean;
}

export default function UserFormBrandingSection({
  isEditMode,
  isDesktop,
}: UserFormBrandingSectionProps) {
  const gradientColors = ["#7c3aed", "#6d28d9"] as const;
  const title = isEditMode ? "Edit User" : "Create User";
  const description = isEditMode
    ? "Update user details and manage account settings"
    : "Add a new user to the system with role-based access";

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className={`p-8 justify-center ${isDesktop ? "min-h-screen" : "py-16"}`}
    >
      <View>
        <View className="items-center mb-12">
          <View className="w-20 h-20 bg-white/20 rounded-2xl items-center justify-center mb-6">
            <Users color="#fff" size={48} />
          </View>
          <Text className="text-white text-3xl font-bold mb-3 text-center">
            {title}
          </Text>
          <Text className="text-white/90 text-base text-center px-4">
            {description}
          </Text>
        </View>

        <View className="gap-6">
          <View className="flex-row gap-3">
            <View className="w-8 h-8 bg-white/20 rounded-lg items-center justify-center mt-1">
              <Shield color="#fff" size={16} />
            </View>
            <View className="flex-1">
              <Text className="text-white text-base font-semibold mb-1">
                Role Management
              </Text>
              <Text className="text-white/90 text-sm leading-[18px]">
                Assign roles and permissions to control system access
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="w-8 h-8 bg-white/20 rounded-lg items-center justify-center mt-1">
              <Settings color="#fff" size={16} />
            </View>
            <View className="flex-1">
              <Text className="text-white text-base font-semibold mb-1">
                User Details
              </Text>
              <Text className="text-white/90 text-sm leading-[18px]">
                Manage user information and account status
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-12 pt-6 border-t border-white/20">
          <Text className="text-white/90 text-sm">
            {isEditMode
              ? "Update user information to keep records current"
              : "Create accounts for farmers, retailers, agencies, and admins"}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}
