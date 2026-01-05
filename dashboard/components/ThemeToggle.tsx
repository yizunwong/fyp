import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Sun, Moon } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";

type Props = {
  className?: string;
};

export function ThemeToggle({ className }: Props) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <TouchableOpacity
      onPress={toggle}
      accessibilityLabel="Toggle theme"
      activeOpacity={0.8}
      className={`items-center justify-center rounded-full border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 p-2 ${className ?? ""}`}
    >
      <View>
        {isDark ? (
          <Sun size={20} color="#facc15" />
        ) : (
          <Moon size={20} color="#1f2937" />
        )}
      </View>
    </TouchableOpacity>
  );
}
