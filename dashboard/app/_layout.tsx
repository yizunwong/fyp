import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "@/styles/global.css";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Platform } from "react-native";
import { useFrameworkReady } from "@/hooks/use-framework";
import { SafeAreaProvider } from "react-native-safe-area-context";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useFrameworkReady();

  return (
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { queries: { refetchOnWindowFocus: false } },
        })
      }
    >
      <SafeAreaProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack
            screenOptions={{ headerShown: false, headerShadowVisible: false }}
          >
            <Stack.Screen
              name="(auth)/login"
              options={{ headerShown: false, headerShadowVisible: false }}
            />
            <Stack.Screen
              name="(auth)/register/[role]"
              options={{ headerShown: false, headerShadowVisible: false }}
            />
            <Stack.Screen
              name="role-select"
              options={{ headerShown: false, headerShadowVisible: false }}
            />

            <Stack.Screen
              name="onboarding"
              options={{ headerShown: false, headerShadowVisible: false }}
            />
            <Stack.Screen
              name="welcome"
              options={{ headerShown: false, headerShadowVisible: false }}
            />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
          </Stack>

          {/* ✅ Place Toaster here — available globally */}
          {Platform.OS === "web" && <Toaster />}

          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        </ThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
