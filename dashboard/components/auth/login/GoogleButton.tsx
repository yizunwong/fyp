import React from "react";
import { TouchableOpacity, View, Text } from "react-native";

export default function GoogleButton({ onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-center h-12 rounded-lg border border-gray-300 bg-white gap-2"
    >
      <View className="w-5 h-5 items-center justify-center">
        <Text className="text-[#4285F4] text-base font-bold">G</Text>
      </View>
      <Text className="text-gray-900 text-[15px] font-medium">Sign in with Google</Text>
    </TouchableOpacity>
  );
}

