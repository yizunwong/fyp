import React from "react";
import { TouchableOpacity, Text, GestureResponderEvent } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type SubmitButtonProps = {
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  title?: string;
  loadingTitle?: string;
  gradientColors?: readonly [string, string];
  className?: string;
};

export default function SubmitButton({
  onPress,
  disabled,
  loading,
  title = "Submit",
  loadingTitle,
  gradientColors = ["#059669", "#10b981"],
  className = "rounded-lg overflow-hidden",
}: SubmitButtonProps) {
  const text = loading ? loadingTitle ?? title : title;
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled ?? loading} className={className}>
      <LinearGradient
        colors={[gradientColors[0], gradientColors[1]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="h-12 items-center justify-center"
      >
        <Text className="text-white text-[15px] font-semibold">{text}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

