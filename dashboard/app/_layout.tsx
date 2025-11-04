import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
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

export const unstable_settings = {
  anchor: "home"
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useFrameworkReady();
  const paperTheme = colorScheme === "dark" ? MD3DarkTheme : MD3LightTheme;
  const navigationTheme =
    colorScheme === "dark" ? NavigationDarkTheme : NavigationDefaultTheme;

  return (
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { queries: { refetchOnWindowFocus: false } },
        })
      }
    >
      <PaperProvider theme={paperTheme}>
        <SafeAreaProvider>
          <ThemeProvider value={navigationTheme}>
            <Stack
              screenOptions={{ headerShown: false, headerShadowVisible: false }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen
                name="(auth)/login"
                options={{ headerShown: false, headerShadowVisible: false }}
              />
              <Stack.Screen
                name="(auth)/register"
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
                name="dashboard/farmer"
                options={{ headerShown: false, headerShadowVisible: false }}
              />
              <Stack.Screen
                name="notifications"
                options={{ headerShown: false, headerShadowVisible: false }}
              />

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
    </QueryClientProvider>
  );
}
