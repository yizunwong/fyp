import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Lock } from "lucide-react-native";
import type { RoleConfig } from "@/components/auth/register/constants";

export default function BrandingSection({
  config,
  isDesktop,
}: {
  config: RoleConfig;
  isDesktop: boolean;
}) {
  const Icon = config.icon;
  return (
    <LinearGradient
      colors={config.gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className={`p-8 justify-center ${isDesktop ? "min-h-screen" : "py-16"}`}
    >
      <View>
        <View className="items-center mb-12">
          <View className="w-20 h-20 bg-white/20 rounded-2xl items-center justify-center mb-6">
            <Icon color="#fff" size={48} />
          </View>
          <Text className="text-white text-3xl font-bold mb-3 text-center">
            {config.label}
          </Text>
          <Text className="text-white/90 text-base text-center px-4">
            {config.description}
          </Text>
        </View>

        <View className="gap-6">
          <View className="flex-row gap-3">
            <View className="w-8 h-8 bg-white/20 rounded-lg items-center justify-center mt-1">
              <Lock color="#fff" size={16} />
            </View>
            <View className="flex-1">
              <Text className="text-white text-base font-semibold mb-1">
                Secure Registration
              </Text>
              <Text className="text-white/90 text-sm leading-[18px]">
                Your data is protected with blockchain technology
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="w-8 h-8 bg-white/20 rounded-lg items-center justify-center mt-1">
              <Icon color="#fff" size={16} />
            </View>
            <View className="flex-1">
              <Text className="text-white text-base font-semibold mb-1">
                Role-Based Access
              </Text>
              <Text className="text-white/90 text-sm leading-[18px]">
                Get features tailored to your specific needs
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="mt-12 pt-6 border-t border-white/20">
        <Text className="text-white/90 text-sm">
          Join thousands of {config.label.toLowerCase()}s using HarvestChain
        </Text>
      </View>
    </LinearGradient>
  );
}
