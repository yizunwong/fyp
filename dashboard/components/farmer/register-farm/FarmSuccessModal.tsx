import { Modal, View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CheckCircle, Home as HomeIcon } from "lucide-react-native";
import { RegisterFarmSuccessData } from "./types";

interface FarmSuccessModalProps {
  visible: boolean;
  successData: RegisterFarmSuccessData | null;
  onBackToDashboard: () => void;
  onRegisterAnother: () => void;
  onClose: () => void;
}

export default function FarmSuccessModal({
  visible,
  successData,
  onBackToDashboard,
  onRegisterAnother,
  onClose,
}: FarmSuccessModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="bg-white rounded-2xl p-8 max-w-md w-full">
          <View className="items-center mb-6">
            <View className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-4">
              <CheckCircle color="#059669" size={40} />
            </View>
            <Text className="text-gray-900 text-2xl font-bold mb-2 text-center">
              Farm Registered Successfully!
            </Text>
            <Text className="text-gray-600 text-sm text-center">
              {successData?.name || "Your farm"} is now part of your farm
              portfolio.
            </Text>
          </View>

          <View className="bg-gray-50 rounded-xl p-4 mb-6">
            <Text className="text-gray-600 text-xs font-semibold mb-1">
              Farm Identifier
            </Text>
            <Text className="text-gray-900 text-sm font-mono">
              {successData?.farmId}
            </Text>
            <Text className="text-gray-500 text-xs mt-2">
              Location: {successData?.location || "Not provided"}
            </Text>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onBackToDashboard}
              className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
            >
              <HomeIcon color="#374151" size={18} />
              <Text className="text-gray-700 text-sm font-semibold mt-1">
                Back to Dashboard
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onRegisterAnother}
              className="flex-1 rounded-xl overflow-hidden"
            >
              <LinearGradient
                colors={["#22c55e", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-3 items-center justify-center"
              >
                <Text className="text-white text-sm font-semibold">
                  Register Another
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={onClose}
            className="mt-6 items-center"
            accessibilityLabel="Close success modal"
          >
            <Text className="text-emerald-700 text-sm font-semibold">
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
