import { Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Plus, Sprout } from "lucide-react-native";

export interface FarmEmptyStateProps {
  onAddFarm: () => void;
}

export default function FarmEmptyState({ onAddFarm }: FarmEmptyStateProps) {
  return (
    <View className="bg-white rounded-xl border border-dashed border-gray-300 p-10 items-center">
      <View className="w-16 h-16 rounded-full bg-emerald-50 items-center justify-center mb-4">
        <Sprout color="#047857" size={30} />
      </View>
      <Text className="text-gray-900 text-xl font-semibold mb-2">
        No farms registered yet
      </Text>
      <Text className="text-gray-600 text-center text-sm mb-6">
        Add your first farm to start managing produce batches and subsidy requests from one
        place.
      </Text>
      <TouchableOpacity onPress={onAddFarm} className="rounded-lg overflow-hidden">
        <LinearGradient
          colors={["#22c55e", "#059669"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex-row items-center gap-2 px-6 py-3"
        >
          <Plus color="#fff" size={18} />
          <Text className="text-white text-sm font-semibold">Add New Farm</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}
