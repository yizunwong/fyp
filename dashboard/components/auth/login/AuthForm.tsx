import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Mail, Lock } from "lucide-react-native";
import InputField from "@/components/ui/InputField";
import SubmitButton from "@/components/ui/SubmitButton";
import Divider from "@/components/ui/Divider";
import GoogleButton from "@/components/auth/login/GoogleButton";

export default function AuthForm({
  email,
  setEmail,
  password,
  setPassword,
  isLoggingIn,
  handleLogin,
  handleGoogleLogin,
  router,
}: any) {
  return (
    <View className="gap-6">
      <InputField
        label="Email Address"
        placeholder="Enter your email"
        icon={<Mail color="#9ca3af" size={20} />}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <InputField
        label="Password"
        placeholder="Enter your password"
        icon={<Lock color="#9ca3af" size={20} />}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity className="self-end -mt-4">
        <Text className="text-emerald-600 text-sm font-medium">Forgot password?</Text>
      </TouchableOpacity>

      <SubmitButton
        onPress={handleLogin}
        loading={isLoggingIn}
        title="Sign In"
        loadingTitle="Signing In..."
        gradientColors={["#059669", "#10b981"]}
      />

      <Divider label="Or continue with" />

      <GoogleButton onPress={handleGoogleLogin} />

      <View className="flex-row justify-center items-center">
        <Text className="text-gray-600 text-sm">Don&apos;t have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/role-select")}>
          <Text className="text-emerald-600 text-sm font-semibold">Register here</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
