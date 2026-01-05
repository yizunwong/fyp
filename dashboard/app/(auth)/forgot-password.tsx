import React from "react";
import { View, ScrollView, Platform, useWindowDimensions } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from "@/hooks/useAuth";
import BrandingSection from "@/components/auth/login/BrandingSection";
import { ThemedView } from "@/components/ThemedView";
import AuthSection from "@/components/auth/AuthSection";
import { parseError } from "@/utils/format-error";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordFormValues,
  type ResetPasswordFormValues,
} from "@/validation/auth";
import ForgotPasswordForm from "@/components/auth/forgot-password/ForgotPasswordForm";
import ResetPasswordForm from "@/components/auth/forgot-password/ResetPasswordForm";

// Main Forgot Password Screen
export default function ForgotPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const { width } = useWindowDimensions();
  const { forgotPassword, isPending: isRequestingReset } =
    useForgotPasswordMutation();
  const { resetPassword, isPending: isResettingPassword } =
    useResetPasswordMutation();

  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && (width === 0 ? true : width >= 768);
  const hasToken = Boolean(params.token);

  const forgotPasswordForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onSubmit",
  });

  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: params.token || "",
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  });

  // Update token when params change
  React.useEffect(() => {
    if (params.token) {
      resetPasswordForm.setValue("token", params.token);
    }
  }, [params.token, resetPasswordForm]);

  const handleForgotPassword = async (values: ForgotPasswordFormValues) => {
    try {
      await forgotPassword({ email: values.email });
      forgotPasswordForm.reset();
      Toast.show({
        type: "success",
        text1: "Reset link sent",
        text2: "Please check your email for password reset instructions",
      });
    } catch (err) {
      const message = parseError(err);
      forgotPasswordForm.setError("root", { message });
      Toast.show({
        type: "error",
        text1: "Request failed",
        text2: message,
      });
    }
  };

  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    try {
      await resetPassword({
        token: values.token,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      resetPasswordForm.reset();
      Toast.show({
        type: "success",
        text1: "Password reset successful",
        text2: "You can now login with your new password",
      });
      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch (err) {
      const message = parseError(err);
      resetPasswordForm.setError("root", { message });
      Toast.show({
        type: "error",
        text1: "Reset failed",
        text2: message,
      });
    }
  };

  const scrollContentStyle = { flexGrow: 1 };

  return (
    <ThemedView className="flex-1 flex-row bg-gray-50 dark:bg-dark-bg">
      {isDesktop && (
        <View className="w-1/2">
          <BrandingSection />
        </View>
      )}
      <ScrollView
        className="flex-1 bg-gray-50 dark:bg-dark-bg"
        contentContainerStyle={scrollContentStyle}
      >
        {hasToken ? (
          <AuthSection
            isDesktop={isDesktop}
            title="Reset Password"
            subtitle="Enter your new password"
            desktopAlignment="center"
          >
            <ResetPasswordForm
              form={resetPasswordForm}
              isResettingPassword={isResettingPassword}
              onSubmit={handleResetPassword}
              router={router}
            />
          </AuthSection>
        ) : (
          <AuthSection
            isDesktop={isDesktop}
            title="Forgot Password"
            subtitle="Enter your email to receive a password reset link"
            desktopAlignment="center"
          >
            <ForgotPasswordForm
              form={forgotPasswordForm}
              isRequestingReset={isRequestingReset}
              onSubmit={handleForgotPassword}
              router={router}
            />
          </AuthSection>
        )}
      </ScrollView>
    </ThemedView>
  );
}

