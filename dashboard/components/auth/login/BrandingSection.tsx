import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Sprout, Lock } from "lucide-react-native";

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <View className="flex-row gap-3">
      <View className="w-8 h-8 bg-white/20 rounded-lg items-center justify-center mt-1">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-white text-base font-semibold mb-1">{title}</Text>
        <Text className="text-emerald-100 text-sm leading-[18px]">
          {description}
        </Text>
      </View>
    </View>
  );
}

export default function BrandingSection({
  isDesktop = true,
}: {
  isDesktop?: boolean;
}) {
  return (
    <LinearGradient
      colors={["#059669", "#10b981", "#14b8a6"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className={`p-8 justify-center ${isDesktop ? "min-h-screen" : "py-16"}`}
    >
      <View>
        <View className="items-center mb-12">
          <View className="w-20 h-20 bg-white/20 rounded-2xl items-center justify-center mb-6">
            <Sprout color="#fff" size={48} />
          </View>
          <Text className="text-white text-3xl font-bold mb-3 text-center">
            HarvestChain
          </Text>
          <Text className="text-white/90 text-base text-center px-4">
            Blockchain Agriculture Platform
          </Text>
        </View>

        <View className="gap-6">
          <Feature
            icon={<Lock color="#fff" size={16} />}
            title="Secure & Transparent"
            description="Blockchain-powered traceability for the entire agricultural supply chain"
          />
          <Feature
            icon={<Sprout color="#fff" size={16} />}
            title="Real-time Tracking"
            description="Monitor your products from farm to table with complete transparency"
          />
        </View>
      </View>

      <View className="mt-12 pt-6 border-t border-white/20">
        <Text className="text-white/90 text-sm">
          Empowering sustainable agriculture through blockchain technology
        </Text>
      </View>
    </LinearGradient>
  );
}
