import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { saveToken } from "../lib/auth";

export default function OAuthCallback() {
  const params = useLocalSearchParams<{ token?: string }>();
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const token = params.token;
      if (typeof token === "string" && token.length > 0) {
        await saveToken(token);
        Alert.alert("Logged in with Google");
        router.replace("/home");
      }
    };
    void run();
  }, [params.token, router]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <ActivityIndicator />
      <Text>Completing Google sign-in...</Text>
    </View>
  );
}
