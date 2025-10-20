import { Modal, View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
  destructive?: boolean;
}

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isProcessing = false,
  destructive = false,
}: ConfirmDialogProps) {
  const confirmColors = destructive
    ? ["#ef4444", "#b91c1c"] as const
    : ["#22c55e", "#059669"] as const;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="bg-white rounded-2xl p-6 w-full max-w-md">
          <Text className="text-lg font-semibold text-gray-900">{title}</Text>
          {message ? (
            <Text className="text-sm text-gray-600 mt-2">{message}</Text>
          ) : null}

          <View className="flex-row gap-3 mt-6">
            <TouchableOpacity
              accessibilityRole="button"
              onPress={onCancel}
              disabled={isProcessing}
              className="flex-1 bg-gray-100 rounded-xl py-3 items-center justify-center"
            >
              <Text className="text-gray-700 text-sm font-semibold">
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              onPress={onConfirm}
              disabled={isProcessing}
              className="flex-1 rounded-xl overflow-hidden opacity-100"
              style={{ opacity: isProcessing ? 0.7 : 1 }}
            >
              <LinearGradient
                colors={confirmColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-3 items-center justify-center"
              >
                {isProcessing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-sm font-semibold">
                    {confirmText}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
