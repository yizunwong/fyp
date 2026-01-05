import React from "react";
import { View, Text } from "react-native";
import { User } from "lucide-react-native";
import UserForm from "./UserForm";
import type {
  CreateUserFormValues,
  EditUserFormValues,
} from "@/validation/user";
import type { UseFormReturn } from "react-hook-form";

interface UserFormSectionProps {
  isEditMode: boolean;
  isDesktop: boolean;
  router: any;
  form: UseFormReturn<CreateUserFormValues | EditUserFormValues>;
  onSubmit: (data: CreateUserFormValues | EditUserFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  selectedRole: string;
  onRoleChange: (role: string) => void;
}

export default function UserFormSection({
  isEditMode,
  router,
  form,
  onSubmit,
  onCancel,
  isSubmitting,
  selectedRole,
  onRoleChange,
}: UserFormSectionProps) {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 md:p-8">
      <View className="flex-row items-center gap-3 mb-6">
        <View className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-xl items-center justify-center">
          <User color="#9333ea" size={24} />
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 dark:text-gray-100 text-xl font-semibold">
            {isEditMode ? "Edit User" : "Create User"}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            {isEditMode
              ? "Update user details and permissions"
              : "Add a new user to the system"}
          </Text>
        </View>
      </View>

      <UserForm
        form={form}
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        isEditMode={isEditMode}
        selectedRole={selectedRole}
        onRoleChange={onRoleChange}
      />
    </View>
  );
}
