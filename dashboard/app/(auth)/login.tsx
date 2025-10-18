import { useState } from "react";
import { View, ScrollView, Platform, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import Toast from "react-native-toast-message";
import useAuth from "@/hooks/useAuth";
import BrandingSection from "@/components/auth/login/BrandingSection";
import { ThemedView } from "@/components/ThemedView";
import LoginFormSection from "@/components/auth/login/LoginFormSection";
import { parse } from 'react-native-svg';
import { parseError } from '@/utils/format-error';

// ✅ Main Login Screen
export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { login, isLoggingIn } = useAuth();

  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && (width === 0 ? true : width >= 768);

  const handleLogin = async () => {
    try {
      await login({ email, password });
      router.push(isWeb ? "/home" : "/dashboard/farmer");
      Toast.show({
        type: "success",
        text1: "Login successful",
        text2: "Welcome back!",
      });
    } catch (err){
      Toast.show({
        type: "error",
        text1: "Login failed",
        text2: parseError(err),
      });
    }
  };

  const handleGoogleLogin = async () => {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    const redirect = AuthSession.makeRedirectUri({ scheme: "dashboard" });
    const state = JSON.stringify({
      redirect,
      platform: isWeb ? "web" : "expo",
    });
    const url = `${apiUrl}/auth/google?state=${encodeURIComponent(state)}`;

    if (isWeb) {
      window.location.href = url;
    } else {
      const result = await WebBrowser.openAuthSessionAsync(url, redirect);
      if (result.type === "success" && result.url) {
        const token = new URL(result.url).searchParams.get("token");
        console.log("Google login success, token:", token);
      }
    }
  };

  const formProps = {
    isDesktop,
    email,
    setEmail,
    password,
    setPassword,
    isLoggingIn,
    handleLogin,
    handleGoogleLogin,
    router,
  };

  return (
    <ThemedView className="flex-1 flex-row bg-gray-50">
      {isDesktop && (
        <View className="w-1/2">
          <BrandingSection />
        </View>
      )}
      <ScrollView className="flex-1 bg-gray-50">
        <LoginFormSection {...formProps} />
      </ScrollView>
    </ThemedView>
  );
}
