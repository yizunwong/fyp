import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

interface ClearButtonProps {
  onPress: () => void;
  disabled?: boolean;
  label?: string;
  isLoading?: boolean;
}

export const ClearButton: React.FC<ClearButtonProps> = ({
  onPress,
  disabled = false,
  label = "Clear Form",
  isLoading = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 border border-emerald-200 rounded-xl py-3 items-center justify-center"
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color="#059669" />
      ) : (
        <Text className="text-emerald-700 text-sm font-semibold">{label}</Text>
      )}
    </TouchableOpacity>
  );
};
