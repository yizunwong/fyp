import React from "react";
import { View, Text } from "react-native";

type AuthSectionProps = {
  isDesktop: boolean;
  header?: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  desktopAlignment?: "top" | "center";
};

export default function AuthSection({
  isDesktop,
  header,
  title,
  subtitle,
  children,
  desktopAlignment = "top",
}: AuthSectionProps) {
  const desktopAlignmentClass =
    desktopAlignment === "center"
      ? "min-h-screen items-center justify-center"
      : "min-h-screen items-center justify-start";

  return (
    <View
      className={`flex-1 p-8 ${
        isDesktop ? desktopAlignmentClass : "items-center"
      }`}
    >
      <View className="w-full max-w-xl">
        {header}

        <View className="mb-8">
          <Text className="text-gray-900 text-3xl font-bold mb-2">{title}</Text>
          <Text className="text-gray-600 text-sm">{subtitle}</Text>
        </View>

        {children}
      </View>
    </View>
  );
}
