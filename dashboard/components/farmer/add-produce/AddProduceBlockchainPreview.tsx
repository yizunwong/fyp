import { FileText } from "lucide-react-native";
import { Text, View } from "react-native";

const AddProduceBlockchainPreview = () => (
  <View className="w-96">
    <View className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border-2 border-emerald-200">
      <View className="flex-row items-center gap-3 mb-4">
        <View className="w-10 h-10 bg-emerald-500 rounded-full items-center justify-center">
          <FileText color="#fff" size={20} />
        </View>
        <Text className="text-gray-900 text-lg font-bold">
          Blockchain Preview
        </Text>
      </View>
      <View className="bg-white rounded-lg p-4 border border-emerald-200">
        <Text className="text-gray-600 text-sm text-center leading-relaxed">
          Once submitted, your produce will be recorded on the blockchain with a
          unique transaction hash and QR code for traceability.
        </Text>
      </View>
      <View className="mt-4 bg-white rounded-lg p-8 items-center justify-center border border-dashed border-emerald-300">
        <View className="w-32 h-32 bg-gray-100 rounded-lg items-center justify-center mb-3">
          <Text className="text-gray-400 text-xs text-center">
            QR Code{"\n"}Preview
          </Text>
        </View>
        <Text className="text-gray-500 text-xs text-center">
          QR code will appear here after submission
        </Text>
      </View>
    </View>
  </View>
);

export default AddProduceBlockchainPreview;
