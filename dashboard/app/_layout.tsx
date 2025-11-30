import React from "react";
import { Platform, View } from "react-native";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import "@walletconnect/react-native-compat";
import "react-native-reanimated";
import "react-native-get-random-values";
import "@/styles/global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { useColorScheme } from "@/hooks/useColorSheme";
import ToastProvider from "@/components/ui/ToastProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFrameworkReady } from "@/hooks/useFreamework";

import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  MD3DarkTheme,
  MD3LightTheme,
  Provider as PaperProvider,
} from "react-native-paper";

import { AppKitProvider, AppKit } from "@reown/appkit-react-native";
import { createMobileAppKit } from "@/components/wallet/config/mobileConfig";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useFrameworkReady();

  const paperTheme = colorScheme === "dark" ? MD3DarkTheme : MD3LightTheme;
  const navigationTheme =
    colorScheme === "dark" ? NavigationDarkTheme : NavigationDefaultTheme;

  // Create AppKit ONLY on mobile runtime
  const mobileAppKit = Platform.OS !== "web" ? createMobileAppKit() : null;

  const queryClient = new QueryClient({
    defaultOptions: { queries: { refetchOnWindowFocus: false } },
  });

  const Providers = (
    <PaperProvider theme={paperTheme}>
      <SafeAreaProvider>
        <ThemeProvider value={navigationTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)/login" />
            <Stack.Screen name="(auth)/register" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="welcome" />
            <Stack.Screen name="dashboard/farmer" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="dashboard/agency" />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
          </Stack>

          <ToastProvider />
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        </ThemeProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );

  return (
    <QueryClientProvider client={queryClient}>
      {!mobileAppKit ? (
        Providers
      ) : (
        <View style={{ position: "absolute", height: "100%", width: "100%" }}>
          <AppKitProvider instance={mobileAppKit}>
            {Providers}
            <AppKit />
          </AppKitProvider>
        </View>
      )}
    </QueryClientProvider>
  );
}
