import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AlertTriangle } from "lucide-react-native";

export interface ErrorStateProps {
  message: string;
  actionLabel?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  actionLabel = "Retry",
  onRetry,
}) => {
  return (
    <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 mb-4">
      <View className="flex-row items-center gap-2">
        <AlertTriangle color="#dc2626" size={18} />
        <Text className="text-red-600 dark:text-red-400 text-sm font-medium flex-1">
          {message}
        </Text>
      </View>

      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          className="self-start mt-2 px-3 py-1.5 rounded-md bg-red-600"
        >
          <Text className="text-black text-xs font-semibold">
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
