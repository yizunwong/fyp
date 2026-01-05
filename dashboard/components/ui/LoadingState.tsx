import React from "react";
import { View, ActivityIndicator, Text } from "react-native";

export interface LoadingStateProps {
  message?: string;
  color?: string;
  paddingY?: number;
}


export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
  color = "#059669",
  paddingY = 80,
}) => {
  return (
    <View
      className="items-center justify-center"
      style={{ paddingVertical: paddingY }}
    >
      <ActivityIndicator size="large" color={color} />
      {message && <Text className="text-gray-500 dark:text-gray-400 text-sm mt-3">{message}</Text>}
    </View>
  );
};
