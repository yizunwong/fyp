import React from "react";
import { View, Text, TouchableOpacity, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { ColorValue } from "react-native";

export interface EmptyStateProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onActionPress?: () => void;
  actionColors?: readonly [ColorValue, ColorValue, ...ColorValue[]];
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
  icon,
  actionLabel,
  onActionPress,
  actionColors = ["#22c55e", "#059669"],
  style,
}) => {
  return (
    <View
      className="bg-white rounded-xl border border-dashed border-gray-300 p-10 items-center"
      style={style}
    >
      {icon && (
        <View className="w-16 h-16 rounded-full bg-emerald-50 items-center justify-center mb-4">
          {icon}
        </View>
      )}

      <Text className="text-gray-900 text-xl font-semibold mb-2">{title}</Text>

      {subtitle && (
        <Text className="text-gray-600 text-center text-sm mb-6">
          {subtitle}
        </Text>
      )}

      {actionLabel && onActionPress && (
        <TouchableOpacity
          onPress={onActionPress}
          className="rounded-lg overflow-hidden"
        >
          <LinearGradient
            colors={actionColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-row items-center gap-2 px-6 py-3"
          >
            <Text className="text-white text-sm font-semibold">
              {actionLabel}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};
