import React from "react";
import { View } from "react-native";
import UserFormSection from "./UserFormSection";
import UserSummary from "./UserSummary";
import type {
  CreateUserFormValues,
  EditUserFormValues,
} from "@/validation/user";
import type { UseFormReturn } from "react-hook-form";

interface UserRegistrationContentProps {
  isDesktop: boolean;
  form: UseFormReturn<CreateUserFormValues | EditUserFormValues>;
  formData: CreateUserFormValues | EditUserFormValues;
  isEditMode: boolean;
  onSubmit: () => void;
  onReset: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  selectedRole: string;
  onRoleChange: (role: string) => void;
  router: any;
}

export function UserRegistrationContent({
  isDesktop,
  form,
  formData,
  isEditMode,
  onSubmit,
  onReset,
  onCancel,
  isSubmitting,
  selectedRole,
  onRoleChange,
  router,
}: UserRegistrationContentProps) {
  return (
    <View className="flex-1 bg-gray-50 dark:bg-dark-bg">
      {isDesktop ? (
        <View className="p-6">
          <View className="flex-row gap-6">
            <View className="flex-1">
              <UserFormSection
                isEditMode={isEditMode}
                isDesktop={isDesktop}
                router={router}
                form={form}
                onSubmit={onSubmit}
                onCancel={onCancel}
                isSubmitting={isSubmitting}
                selectedRole={selectedRole}
                onRoleChange={onRoleChange}
              />
            </View>

            <View className="w-[360px]">
              <UserSummary formData={formData} />
            </View>
          </View>
        </View>
      ) : (
        <View className="gap-6 p-6">
          <UserFormSection
            isEditMode={isEditMode}
            isDesktop={isDesktop}
            router={router}
            form={form}
            onSubmit={onSubmit}
            onCancel={onCancel}
            isSubmitting={isSubmitting}
            selectedRole={selectedRole}
            onRoleChange={onRoleChange}
          />
          <UserSummary formData={formData} compact />
        </View>
      )}
    </View>
  );
}

