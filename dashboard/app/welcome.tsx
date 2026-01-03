import { useEffect } from "react";
import { View, Text } from "react-native";
import { Sprout } from "lucide-react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function WelcomeScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <LinearGradient
      colors={["#059669", "#10b981", "#14b8a6"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1 items-center justify-center"
    >
      <View className="items-center">
        <View className="w-28 h-28 bg-white/20 rounded-3xl items-center justify-center mb-6">
          <Sprout color="#fff" size={64} />
        </View>
        <Text className="text-white text-4xl font-bold mb-2">HarvestChain</Text>
        <Text className="text-emerald-100 text-sm">
          Blockchain Agriculture Platform
        </Text>
      </View>
    </LinearGradient>
  );
}
