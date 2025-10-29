import React from "react";
import { ColorValue, TouchableOpacity, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface FloatingActionButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  position?: { right?: number; bottom?: number };
  style?: ViewStyle;
  colors?: readonly [ColorValue, ColorValue, ...ColorValue[]];
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon,
  position = { right: 24, bottom: 96 },
  style,
  colors = ["#22c55e", "#059669"],
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="absolute rounded-full overflow-hidden shadow-lg"
      style={[
        { right: position.right, bottom: position.bottom, elevation: 6 },
        style,
      ]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="w-14 h-14 items-center justify-center"
      >
        {icon}
      </LinearGradient>
    </TouchableOpacity>
  );
};
