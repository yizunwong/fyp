import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Controller, type UseFormReturn } from "react-hook-form";
import { Mail, Lock } from "lucide-react-native";
import InputField from "@/components/ui/InputField";
import SubmitButton from "@/components/ui/SubmitButton";
import Divider from "@/components/ui/Divider";
import GoogleButton from "@/components/auth/login/GoogleButton";
import type { LoginFormValues } from "@/validation/auth";

interface LoginFormProps {
  form: UseFormReturn<LoginFormValues>;
  isLoggingIn: boolean;
  onSubmit: (values: LoginFormValues) => Promise<void> | void;
  handleGoogleLogin: () => Promise<void> | void;
  router: any;
}

export default function LoginForm({
  form,
  isLoggingIn,
  onSubmit,
  handleGoogleLogin,
  router,
}: LoginFormProps) {
  const { control, handleSubmit, formState, clearErrors } = form;
  const rootError = formState.errors.root?.message;

  return (
    <View className="gap-6">
      {rootError ? (
        <View className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <Text className="text-red-600 text-sm">{rootError}</Text>
        </View>
      ) : null}

      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => {
          const handleChange = (value: string) => {
            if (formState.errors.root) {
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
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
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
        name="password"
        render={({ field, fieldState }) => {
          const handleChange = (value: string) => {
            if (formState.errors.root) {
              clearErrors("root");
            }
            field.onChange(value);
          };

          return (
            <View className="gap-1">
              <InputField
                label="Password"
                placeholder="Enter your password"
                icon={<Lock color="#9ca3af" size={20} />}
                value={field.value ?? ""}
                onChangeText={handleChange}
                onBlur={field.onBlur}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
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

      <TouchableOpacity className="self-end -mt-4">
        <Text className="text-emerald-600 text-sm font-medium">
          Forgot password?
        </Text>
      </TouchableOpacity>

      <SubmitButton
        onPress={handleSubmit(onSubmit)}
        loading={isLoggingIn}
        title="Sign In"
        loadingTitle="Signing In..."
        gradientColors={["#059669", "#10b981"]}
      />

      <Divider label="Or continue with" />

      <GoogleButton onPress={handleGoogleLogin} />

      <View className="flex-row justify-center items-center">
        <Text className="text-gray-600 text-sm">
          Don&apos;t have an account?{" "}
        </Text>
        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text className="text-emerald-600 text-sm font-semibold">
            Register here
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
