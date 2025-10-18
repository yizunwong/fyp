import React from "react";
import LoginForm from "@/components/auth/login/LoginForm";
import AuthSection from "@/components/auth/AuthSection";

export default function LoginFormSection({
  isDesktop,
  email,
  setEmail,
  password,
  setPassword,
  isLoggingIn,
  handleLogin,
  handleGoogleLogin,
  router,
}: {
  isDesktop: boolean;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  isLoggingIn: boolean;
  handleLogin: () => Promise<void> | void;
  handleGoogleLogin: () => Promise<void> | void;
  router: any;
}) {
  const title = "Welcome Back";
  const subtitle = "Enter your credentials to access your account";

  return (
    <AuthSection isDesktop={isDesktop} title={title} subtitle={subtitle}>
      <LoginForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        isLoggingIn={isLoggingIn}
        handleLogin={handleLogin}
        handleGoogleLogin={handleGoogleLogin}
        router={router}
      />
    </AuthSection>
  );
}
