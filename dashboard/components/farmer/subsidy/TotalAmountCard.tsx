import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { DollarSign } from "lucide-react-native";
import {
  ethToMyr,
  formatCurrency,
  formatEth,
} from "@/components/farmer/farm-produce/utils";

type Props = {
  totalAmount: number;
  ethToMyrRate?: number;
};

export default function TotalAmountCard({
  totalAmount,
  ethToMyrRate,
}: Props) {
  return (
    <LinearGradient
      colors={["#22c55e", "#059669"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="rounded-xl p-6 mb-6"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-white/90 text-sm font-semibold mb-1">
            Total Subsidies Received
          </Text>
          <View>
            <Text className="text-white text-3xl font-bold">
              {formatEth(totalAmount)}
            </Text>
            {ethToMyrRate && (
              <Text className="text-white/80 text-sm mt-1">
                ({formatCurrency(ethToMyr(totalAmount, ethToMyrRate) ?? 0)})
              </Text>
            )}
          </View>
        </View>
        <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center">
          <DollarSign color="#fff" size={32} />
        </View>
      </View>
    </LinearGradient>
  );
}
