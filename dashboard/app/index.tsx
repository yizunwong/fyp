import { useEffect, useState } from "react";
import { View, ActivityIndicator, Platform } from "react-native";
import { useRouter, Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        if (Platform.OS === "ios" || Platform.OS === "android") {
          const hasSeenOnboarding = await AsyncStorage.getItem(
            "hasSeenOnboarding"
          );

          if (!hasSeenOnboarding) {
            await AsyncStorage.setItem("hasSeenOnboarding", "true");
            setTimeout(() => router.replace("/onboarding"), 400);
          } else {
            setTimeout(() => router.replace("/welcome"), 400);
          }
        }
      } catch (err) {
        console.error("Error checking first-time launch:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkFirstTime();
  }, [router]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-emerald-600 items-center justify-center">
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (Platform.OS === "web") {
    return <Redirect href="/home" />;
  }

  return (
    <View className="flex-1 bg-emerald-600 items-center justify-center">
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
}
