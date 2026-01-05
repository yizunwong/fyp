import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import RegisterForm from "@/components/auth/register/RegisterForm";
import type {
  SelectableRegisterRole,
  RoleConfig,
} from "@/components/auth/register/constants";
import type { RegistrationFormValues } from "@/validation/auth";
import AuthSection from "@/components/auth/AuthSection";

export default function RegisterFormSection({
  role,
  config,
  isDesktop,
  router,
  onSubmit,
  onRoleChange,
}: {
  role: SelectableRegisterRole;
  config: RoleConfig;
  isDesktop: boolean;
  router: any;
  onSubmit: (data: RegistrationFormValues) => void;
  onRoleChange: (role: SelectableRegisterRole) => void;
}) {
  const header = (
    <TouchableOpacity
      onPress={() => router.back()}
      className="flex-row items-center gap-2 mb-8"
    >
      <ArrowLeft color="#6b7280" size={20} />
      <Text className="text-gray-600 dark:text-gray-400 text-sm font-medium">Back</Text>
    </TouchableOpacity>
  );

  const title = "Create Account";
  const subtitle = `Register as a ${config.label.toLowerCase()}`;

  return (
    <AuthSection
      isDesktop={isDesktop}
      header={header}
      title={title}
      subtitle={subtitle}
    >
      <RegisterForm
        role={role}
        onSubmit={onSubmit}
        onRoleChange={onRoleChange}
      />

      <View className="mt-6 flex-row justify-center items-center">
        <Text className="text-gray-600 dark:text-gray-400 text-sm">Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text className="text-emerald-600 dark:text-emerald-500 text-sm font-semibold">
            Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </AuthSection>
  );
}
