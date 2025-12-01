import React from "react";
import type { UseFormReturn } from "react-hook-form";
import LoginForm from "@/components/auth/login/LoginForm";
import AuthSection from "@/components/auth/AuthSection";
import type { LoginFormValues } from "@/validation/auth";

export default function LoginFormSection({
  isDesktop,
  form,
  isLoggingIn,
  handleLogin,
  handleGoogleLogin,
  router,
}: {
  isDesktop: boolean;
  form: UseFormReturn<LoginFormValues>;
  isLoggingIn: boolean;
  handleLogin: (values: LoginFormValues) => Promise<void> | void;
  handleGoogleLogin: () => Promise<void> | void;
  router: any;
}) {
  const title = "Welcome Back";
  const subtitle = "Enter your credentials to access your account";

  return (
    <AuthSection
      isDesktop={isDesktop}
      title={title}
      subtitle={subtitle}
      desktopAlignment="center"
    >
      <LoginForm
        form={form}
        isLoggingIn={isLoggingIn}
        onSubmit={handleLogin}
        handleGoogleLogin={handleGoogleLogin}
        router={router}
      />
    </AuthSection>
  );
}
