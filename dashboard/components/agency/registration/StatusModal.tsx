import { ActivityIndicator, Modal, Text, TouchableOpacity, View } from "react-native";
import { CheckCircle } from "lucide-react-native";

export function StatusModal({
  visible,
  mode,
  message,
  onClose,
}: {
  visible: boolean;
  mode: "loading" | "success";
  message: string;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/60 items-center justify-center px-6">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm items-center">
          {mode === "loading" ? (
            <>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text className="text-gray-900 text-base font-bold mt-4">{message}</Text>
            </>
          ) : (
            <>
              <CheckCircle color="#22c55e" size={32} />
              <Text className="text-gray-900 text-base font-bold mt-3">Success</Text>
              <Text className="text-gray-600 text-sm mt-1 text-center">{message}</Text>
              <TouchableOpacity onPress={onClose} className="mt-4 px-4 py-2 bg-blue-600 rounded-lg">
                <Text className="text-white font-semibold">Close</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
