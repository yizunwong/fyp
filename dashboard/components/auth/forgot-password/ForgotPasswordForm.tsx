import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Controller, type UseFormReturn } from "react-hook-form";
import { Mail, ArrowLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { ForgotPasswordFormValues } from "@/validation/auth";
import InputField from '@/components/ui/InputField';
import SubmitButton from '@/components/ui/SubmitButton';

interface ForgotPasswordFormProps {
  form: UseFormReturn<ForgotPasswordFormValues>;
  isRequestingReset: boolean;
  onSubmit: (values: ForgotPasswordFormValues) => Promise<void> | void;
  router: any;
}

export default function ForgotPasswordForm({
  form,
  isRequestingReset,
  onSubmit,
  router,
}: ForgotPasswordFormProps) {
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
        name="email"
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
                label="Email Address"
                placeholder="Enter your email"
                icon={<Mail color="#9ca3af" size={20} />}
                value={field.value ?? ""}
                onChangeText={handleChange}
                onBlur={field.onBlur}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
              />
              {fieldState.error ? (
                <Text className="text-red-500 dark:text-red-400 text-xs">
                  {fieldState.error.message}
                </Text>
              ) : null}
            </View>
          );
        }}
      />

      {errors.root && (
        <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <Text className="text-red-700 dark:text-red-400 text-sm">{errors.root.message}</Text>
        </View>
      )}

      <SubmitButton
        onPress={handleSubmit(onSubmit)}
        loading={isRequestingReset}
        title="Send Reset Link"
        loadingTitle="Sending..."
        gradientColors={["#059669", "#10b981"]}
      />

      <TouchableOpacity
        onPress={() => router.replace("/login")}
        className="flex-row items-center justify-center gap-2"
      >
        <ArrowLeft color="#059669" size={18} />
        <Text className="text-emerald-600 dark:text-emerald-500 text-sm font-semibold">
          Back to Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}

