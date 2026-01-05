import React from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";

type Props = {
  label: React.ReactNode;
  icon?: React.ReactNode;
} & TextInputProps;

export default function InputField({ label, icon, placeholderTextColor = "#9ca3af", ...props }: Props) {
  return (
    <View className="gap-2">
      {typeof label === "string" ? (
        <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold">{label}</Text>
      ) : (
        label
      )}
      <View className="flex-row items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
        {icon ? <View className="ml-3">{icon}</View> : null}
        <TextInput
          className="flex-1 h-12 px-3 text-gray-900 dark:text-gray-100 text-[15px]"
          placeholderTextColor={placeholderTextColor}
          {...props}
        />
      </View>
    </View>
  );
}

