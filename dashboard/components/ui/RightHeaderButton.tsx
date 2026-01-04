import React from "react";
import { TouchableOpacity, Text, ViewStyle, TextStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { ColorValue } from "react-native";

interface RightHeaderButtonProps {
  onPress: () => void;
  label: string;
  icon?: React.ReactNode;
  colors?: readonly [ColorValue, ColorValue, ...ColorValue[]];
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: "sm" | "md" | "lg";
}

export const RightHeaderButton: React.FC<RightHeaderButtonProps> = ({
  onPress,
  label,
  icon,
  colors = ["#22c55e", "#059669"],
  style,
  textStyle,
  size = "sm",
}) => {
  return (
    <TouchableOpacity onPress={onPress} className="rounded-lg overflow-hidden">
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="flex-row items-center gap-2 px-5 py-3"
      >
        {icon && <Text className="text-white">{icon}</Text>}
        <Text className="text-white text-sm font-semibold">{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};
