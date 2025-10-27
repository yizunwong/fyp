import { FC } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Plus, Package } from "lucide-react-native";

interface ProduceEmptyStateProps {
  onAddProduce: () => void;
}

const ProduceEmptyState: FC<ProduceEmptyStateProps> = ({ onAddProduce }) => (
  <View className="bg-white rounded-xl p-8 border border-gray-200 items-center">
    <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
      <Package color="#9ca3af" size={40} />
    </View>
    <Text className="text-gray-900 text-lg font-bold mb-2">
      No Produce Batches Found
    </Text>
    <Text className="text-gray-600 text-sm text-center mb-6">
      Try adjusting your search or filter criteria
    </Text>
    <TouchableOpacity onPress={onAddProduce} className="rounded-lg overflow-hidden">
      <LinearGradient
        colors={["#22c55e", "#059669"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="flex-row items-center gap-2 px-6 py-3"
      >
        <Plus color="#fff" size={20} />
        <Text className="text-white text-[15px] font-semibold">
          Add Produce Batch
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  </View>
);

export default ProduceEmptyState;
