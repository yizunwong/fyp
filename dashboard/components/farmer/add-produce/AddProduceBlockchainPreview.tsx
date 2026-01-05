import { FileText } from "lucide-react-native";
import { Text, View } from "react-native";

const AddProduceBlockchainPreview = () => (
  <View className="w-full">
    <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
      <View className="flex-row items-center gap-3 mb-4">
        <View className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full items-center justify-center">
          <FileText color="#059669" size={20} />
        </View>
        <Text className="text-gray-900 dark:text-gray-100 text-lg font-semibold">
          Blockchain Preview
        </Text>
      </View>
      <View className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
        <Text className="text-gray-600 dark:text-gray-400 text-sm text-center leading-relaxed">
          Once submitted, your produce will be recorded on the blockchain with a
          unique transaction hash and QR code for traceability.
        </Text>
      </View>
      <View className="mt-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-8 items-center justify-center border border-dashed border-gray-300 dark:border-gray-600">
        <View className="w-32 h-32 bg-white dark:bg-gray-600 rounded-lg items-center justify-center mb-3">
          <Text className="text-gray-400 dark:text-gray-500 text-xs text-center">
            QR Code{"\n"}Preview
          </Text>
        </View>
        <Text className="text-gray-500 dark:text-gray-400 text-xs text-center">
          QR code will appear here after submission
        </Text>
      </View>
    </View>
  </View>
);

export default AddProduceBlockchainPreview;
