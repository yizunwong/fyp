import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Controller, type UseFormReturn } from "react-hook-form";
import { Lock, ArrowLeft } from "lucide-react-native";
import type { ResetPasswordFormValues } from "@/validation/auth";
import InputField from "@/components/ui/InputField";
import SubmitButton from "@/components/ui/SubmitButton";

interface ResetPasswordFormProps {
  form: UseFormReturn<ResetPasswordFormValues>;
  isResettingPassword: boolean;
  onSubmit: (values: ResetPasswordFormValues) => Promise<void> | void;
  router: any;
}

export default function ResetPasswordForm({
  form,
  isResettingPassword,
  onSubmit,
  router,
}: ResetPasswordFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = form;

  return (
    <View className="gap-6">
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => {
          const handleChange = (value: string) => {
            if (errors.root) {
              clearErrors("root");
            }
            field.onChange(value);
          };

          return (
            <View className="gap-1">
              <InputField
                label="New Password"
                placeholder="Enter your new password"
                icon={<Lock color="#9ca3af" size={20} />}
                value={field.value ?? ""}
                onChangeText={handleChange}
                onBlur={field.onBlur}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password-new"
              />
              {fieldState.error ? (
                <Text className="text-red-500 text-xs">
                  {fieldState.error.message}
                </Text>
              ) : null}
            </View>
          );
        }}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field, fieldState }) => {
          const handleChange = (value: string) => {
            if (errors.root) {
              clearErrors("root");
            }
            field.onChange(value);
          };

          return (
            <View className="gap-1">
              <InputField
                label="Confirm New Password"
                placeholder="Confirm your new password"
                icon={<Lock color="#9ca3af" size={20} />}
                value={field.value ?? ""}
                onChangeText={handleChange}
                onBlur={field.onBlur}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password-new"
              />
              {fieldState.error ? (
                <Text className="text-red-500 text-xs">
                  {fieldState.error.message}
                </Text>
              ) : null}
            </View>
          );
        }}
      />

      {errors.root && (
        <View className="bg-red-50 border border-red-200 rounded-lg p-3">
          <Text className="text-red-700 text-sm">{errors.root.message}</Text>
        </View>
      )}

      <SubmitButton
        onPress={handleSubmit(onSubmit)}
        loading={isResettingPassword}
        title="Reset Password"
        loadingTitle="Resetting..."
        gradientColors={["#059669", "#10b981"]}
      />

      <TouchableOpacity
        onPress={() => router.replace("/login")}
        className="flex-row items-center justify-center gap-2"
      >
        <ArrowLeft color="#059669" size={18} />
        <Text className="text-emerald-600 text-sm font-semibold">
          Back to Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}
