import { LinearGradient } from "expo-linear-gradient";
import { CheckCircle, Copy, Eye, Home as HomeIcon } from "lucide-react-native";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface AddProduceSuccessModalProps {
  visible: boolean;
  txHash?: string;
  batchId?: string;
  onCopyTxHash: (hash: string) => void;
  onGoToDashboard: () => void;
  onClose: () => void;
}

const AddProduceSuccessModal = ({
  visible,
  txHash,
  batchId,
  onCopyTxHash,
  onGoToDashboard,
  onClose,
}: AddProduceSuccessModalProps) => (
  <Modal visible={visible} transparent animationType="fade">
    <View className="flex-1 bg-black/50 items-center justify-center px-6">
      <View className="bg-white rounded-2xl p-8 max-w-lg w-full">
        <View className="items-center mb-6">
          <View className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-4">
            <CheckCircle color="#059669" size={40} />
          </View>
          <Text className="text-gray-900 text-2xl font-bold mb-2 text-center">
            Produce Successfully Recorded!
          </Text>
          <Text className="text-gray-600 text-sm text-center">
            Your produce has been added to the blockchain
          </Text>
        </View>

        <View className="bg-gray-50 rounded-xl p-4 mb-6">
          <View className="mb-4">
            <Text className="text-gray-600 text-xs font-semibold mb-1">
              Transaction Hash
            </Text>
            <View className="flex-row items-center gap-2">
              <Text className="flex-1 text-gray-900 text-sm font-mono">
                {txHash ? `${txHash.substring(0, 20)}...` : "--"}
              </Text>
              <TouchableOpacity onPress={() => txHash && onCopyTxHash(txHash)}>
                <Copy color="#6b7280" size={16} />
              </TouchableOpacity>
            </View>
          </View>

          <View className="items-center py-4">
            <View className="w-40 h-40 bg-white rounded-lg border border-gray-200 items-center justify-center">
              <Text className="text-gray-400 text-xs">QR Code</Text>
            </View>
            <Text className="text-gray-600 text-xs mt-2">
              Batch ID: {batchId || "--"}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={onGoToDashboard}
            className="flex-1 bg-gray-100 rounded-lg py-3 items-center"
          >
            <HomeIcon color="#374151" size={18} />
            <Text className="text-gray-700 text-sm font-semibold mt-1">
              Back to Dashboard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onClose}
            className="flex-1 rounded-lg py-3 items-center overflow-hidden"
          >
            <LinearGradient
              colors={["#22c55e", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="w-full h-full items-center justify-center"
            >
              <Eye color="#fff" size={18} />
              <Text className="text-white text-sm font-semibold mt-1">
                View Details
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export default AddProduceSuccessModal;
