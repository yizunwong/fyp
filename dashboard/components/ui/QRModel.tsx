import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  Linking,
} from "react-native";
import { X, ExternalLink } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/hooks/useTheme";

interface QRModalProps {
  visible: boolean;
  onClose: () => void;
  batchId: string;
  qrCodeUrl: string;
  blockchainTxHash?: string | null;
}

export default function QRModal({
  visible,
  onClose,
  batchId,
  qrCodeUrl,
  blockchainTxHash,
}: QRModalProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleVerifyOnBlockchain = () => {
    if (blockchainTxHash) {
      const explorerUrl = `https://sepolia.etherscan.io/tx/${blockchainTxHash}`;
      Linking.openURL(explorerUrl);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View
          className={`${
            isDark ? "bg-gray-800" : "bg-white"
          } rounded-2xl w-full max-w-md overflow-hidden`}
        >
          <View
            className={`flex-row items-center justify-between px-6 py-4 border-b ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <Text
              className={`${
                isDark ? "text-gray-100" : "text-gray-900"
              } text-lg font-bold`}
            >
              Batch QR Code
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className={`w-8 h-8 ${
                isDark ? "bg-gray-700" : "bg-gray-100"
              } rounded-full items-center justify-center`}
            >
              <X color={isDark ? "#9ca3af" : "#6b7280"} size={20} />
            </TouchableOpacity>
          </View>

          <View className="p-6">
            <View
              className={`${
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              } border-2 rounded-2xl p-6 items-center mb-4`}
            >
              {qrCodeUrl ? (
                <Image
                  source={{ uri: qrCodeUrl }}
                  style={{ width: 200, height: 200 }}
                  resizeMode="contain"
                />
              ) : (
                <View
                  className={`w-52 h-52 ${
                    isDark ? "bg-gray-700" : "bg-gray-100"
                  } rounded-xl items-center justify-center`}
                >
                  <Text
                    className={`${
                      isDark ? "text-gray-400" : "text-gray-400"
                    } text-sm`}
                  >
                    QR Code Not Available
                  </Text>
                </View>
              )}
            </View>

            <View
              className={`${
                isDark ? "bg-gray-700/50" : "bg-gray-50"
              } rounded-xl p-4 mb-4`}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text
                  className={`${
                    isDark ? "text-gray-300" : "text-gray-600"
                  } text-sm`}
                >
                  Batch ID
                </Text>
                <Text
                  className={`${
                    isDark ? "text-gray-100" : "text-gray-900"
                  } text-sm font-semibold`}
                >
                  {batchId}
                </Text>
              </View>
              {blockchainTxHash && (
                <View className="flex-row items-center justify-between">
                  <Text
                    className={`${
                      isDark ? "text-gray-300" : "text-gray-600"
                    } text-sm`}
                  >
                    Blockchain Tx
                  </Text>
                  <Text
                    className={`${
                      isDark ? "text-gray-100" : "text-gray-900"
                    } text-xs font-mono`}
                    numberOfLines={1}
                  >
                    {blockchainTxHash.substring(0, 10)}...
                    {blockchainTxHash.substring(blockchainTxHash.length - 8)}
                  </Text>
                </View>
              )}
            </View>

            {blockchainTxHash && (
              <TouchableOpacity
                onPress={handleVerifyOnBlockchain}
                className="rounded-lg overflow-hidden"
              >
                <LinearGradient
                  colors={["#22c55e", "#059669"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="flex-row items-center justify-center gap-2 py-3"
                >
                  <ExternalLink color="#fff" size={20} />
                  <Text className="text-white text-[15px] font-semibold">
                    Verify on Blockchain
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {!blockchainTxHash && (
              <View
                className={`${
                  isDark
                    ? "bg-amber-900/30 border-amber-700"
                    : "bg-amber-50 border-amber-200"
                } border rounded-lg p-4`}
              >
                <Text
                  className={`${
                    isDark ? "text-amber-300" : "text-amber-800"
                  } text-sm text-center`}
                >
                  Blockchain verification pending
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
