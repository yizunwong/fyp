import React, { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import "@walletconnect/react-native-compat";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "react-native-get-random-values";
import "@/styles/global.css";

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

// MOBILE-ONLY AppKit provider (loaded dynamically)
let AppKitProvider: any = null;
let mobileAppKit: any = null;

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useFrameworkReady();

  const paperTheme = colorScheme === "dark" ? MD3DarkTheme : MD3LightTheme;
  const navigationTheme =
    colorScheme === "dark" ? NavigationDarkTheme : NavigationDefaultTheme;

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web") {
      (async () => {
        const kit = await import("@reown/appkit-react-native");
        const mobile = await import("@/components/wallet/config/mobileConfig");
        AppKitProvider = kit.AppKitProvider;
        mobileAppKit = mobile.mobileAppKit;
        setLoaded(true);
      })();
    } else {
      setLoaded(true);
    }
  }, []);

  if (!loaded) return null;

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
      {Platform.OS === "web" || !AppKitProvider ? (
        Providers
      ) : (
        <View
          style={{ position: "absolute", height: "100%", width: "100%" }}
        >
          <AppKitProvider instance={mobileAppKit}>{Providers}</AppKitProvider>
        </View>
      )}
    </QueryClientProvider>
  );
}
