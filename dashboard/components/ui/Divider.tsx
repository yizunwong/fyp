import React from "react";
import { View, Text } from "react-native";

export default function Divider({ label }: { label: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="flex-1 h-[1px] bg-gray-200" />
      <Text className="text-gray-500 text-[11px] uppercase">{label}</Text>
      <View className="flex-1 h-[1px] bg-gray-200" />
    </View>
  );
}

