import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight } from "lucide-react-native";
import AuthForm from "@/components/auth/login/AuthForm";
import { roles, UserRole } from "@/components/auth/login/constants";
import AuthSection from "@/components/auth/AuthSection";

export default function LoginFormSection({
  isDesktop,
  selectedRole,
  setSelectedRole,
  email,
  setEmail,
  password,
  setPassword,
  isLoggingIn,
  handleLogin,
  handleGoogleLogin,
  handleBackToRoles,
  router,
}: {
  isDesktop: boolean;
  selectedRole: UserRole;
  setSelectedRole: (r: UserRole) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  isLoggingIn: boolean;
  handleLogin: () => Promise<void> | void;
  handleGoogleLogin: () => Promise<void> | void;
  handleBackToRoles: () => void;
  router: any;
}) {
  const header = selectedRole ? (
    <TouchableOpacity onPress={handleBackToRoles} className="mb-6">
      <LinearGradient
        colors={["#f3f4f6", "#e5e7eb"]}
        className="flex-row items-center p-3 rounded-lg gap-3 border border-gray-200"
      >
        <View
          className="w-8 h-8 rounded-md items-center justify-center"
          style={{
            backgroundColor:
              roles.find((r) => r.id === selectedRole)?.bgColor || "#22c55e",
          }}
        >
          {(() => {
            const Icon = roles.find((r) => r.id === selectedRole)?.icon;
            return Icon ? <Icon color="#fff" size={16} /> : null;
          })()}
        </View>
        <View className="flex-1">
          <Text className="text-gray-500 text-[11px]">Signing in as</Text>
          <Text className="text-gray-900 text-sm font-semibold">
            {roles.find((r) => r.id === selectedRole)?.label}
          </Text>
        </View>
        <ChevronRight
          color="#9ca3af"
          size={16}
          style={{ transform: [{ rotate: "90deg" }] }}
        />
      </LinearGradient>
    </TouchableOpacity>
  ) : undefined;

  const title = "Welcome Back";
  const subtitle = selectedRole
    ? "Enter your credentials to access your account"
    : "Select your role to continue";

  return (
    <AuthSection
      isDesktop={isDesktop}
      header={header}
      title={title}
      subtitle={subtitle}
    >
      {!selectedRole && isDesktop ? (
        <View className="gap-4">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <TouchableOpacity
                key={role.id}
                onPress={() => setSelectedRole(role.id)}
                className="flex-row items-center p-4 rounded-xl border-2 border-gray-200 bg-white gap-4 active:border-emerald-600"
              >
                <View
                  className="w-12 h-12 rounded-lg items-center justify-center"
                  style={{ backgroundColor: role.bgColor }}
                >
                  <Icon color="#fff" size={24} />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 text-base font-semibold mb-0.5">
                    {role.label}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    {role.description}
                  </Text>
                </View>
                <ChevronRight color="#9ca3af" size={20} />
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <AuthForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          isLoggingIn={isLoggingIn}
          handleLogin={handleLogin}
          handleGoogleLogin={handleGoogleLogin}
          router={router}
        />
      )}
    </AuthSection>
  );
}
