import { Slot } from "expo-router";
import { Platform, View } from "react-native";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout() {
  if (Platform.OS === "web") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background relative">
        <ThemeToggle className="absolute top-4 right-4" />
        <Slot />
      </div>
    );
  }

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
      <Slot />
    </View>
  );
}

