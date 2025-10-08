import { useEffect, useState } from "react";
import { View, ActivityIndicator, Platform } from "react-native";
import { useRouter, Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);

  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        // Only check for mobile (iOS/Android)
        if (Platform.OS === "ios" || Platform.OS === "android") {
          const hasSeenOnboarding = await AsyncStorage.getItem(
            "hasSeenOnboarding"
          );

          if (!hasSeenOnboarding) {
            // Mark onboarding as seen after first open
            await AsyncStorage.setItem("hasSeenOnboarding", "true");
            setIsFirstTime(true);
            setTimeout(() => router.replace("/onboarding"), 400);
          } else {
            setIsFirstTime(false);
            setTimeout(() => router.replace("/welcome"), 400);
          }
        } else {
          // For web — skip onboarding
          setIsFirstTime(false);
        }
      } catch (err) {
        console.error("Error checking first-time launch:", err);
        setIsFirstTime(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkFirstTime();
  }, []);

  // While checking
  if (isLoading) {
    return (
      <View className="flex-1 bg-emerald-600 items-center justify-center">
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // For web: redirect directly
  if (Platform.OS === "web") {
    return <Redirect href="/home" />;
  }

  // Prevent flicker on redirect
  return (
    <View className="flex-1 bg-emerald-600 items-center justify-center">
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
}
