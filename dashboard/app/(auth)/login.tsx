import { View, ScrollView, Platform, useWindowDimensions } from "react-native";
import { RelativePathString, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import Toast from "react-native-toast-message";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useAuth from "@/hooks/useAuth";
import { useSession } from "@/contexts/SessionContext";
import BrandingSection from "@/components/auth/login/BrandingSection";
import { ThemedView } from "@/components/ThemedView";
import LoginFormSection from "@/components/auth/login/LoginFormSection";
import { parseError } from "@/utils/format-error";
import { loginSchema, type LoginFormValues } from "@/validation/auth";
import { jwtDecode } from "jwt-decode";
import { saveToken } from "@/lib/auth";

export default function LoginScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { login, isLoggingIn } = useAuth();
  const { signIn } = useSession();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && (width === 0 ? true : width >= 768);

  const handleLogin = async (values: LoginFormValues) => {
    try {
      const res = await login(values);

      const accessToken = res.data?.access_token;

      // Decode role from token
      const role = (() => {
        if (!accessToken) return undefined;
        try {
          return jwtDecode<{ role?: string }>(accessToken)?.role;
        } catch {
          return undefined;
        }
      })();

      if (accessToken && !isWeb) {
        await saveToken(accessToken);
      }

      await signIn(accessToken);

      const roleRedirect: Record<string, string> = {
        FARMER: "/dashboard/farmer",
        RETAILER: "/dashboard/retailer",
        GOVERNMENT_AGENCY: "/dashboard/agency",
        ADMIN: "/dashboard/admin",
      };

      const nextRoute = role ? roleRedirect[role] : "/dashboard/farmer";

      form.reset();
      router.replace(nextRoute as RelativePathString);
      Toast.show({
        type: "success",
        text1: "Login successful",
        text2: "Welcome back!",
      });
    } catch (err) {
      const message = parseError(err);
      form.setError("root", { message });
      Toast.show({
        type: "error",
        text1: "Login failed",
        text2: message,
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
    form,
    isLoggingIn,
    handleLogin,
    handleGoogleLogin,
    router,
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
        <LoginFormSection {...formProps} />
      </ScrollView>
    </ThemedView>
  );
}
