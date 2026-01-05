import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Star } from "lucide-react-native";
import type { ProduceListResponseDto } from "@/api";

type FarmerCardProps = {
  batch: ProduceListResponseDto;
  onRate: (batch: ProduceListResponseDto) => void;
  formatDate: (dateString: string) => string;
  isDesktop?: boolean;
};

const FarmerCard = ({ batch, onRate, formatDate }: FarmerCardProps) => (
  <View className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-3">
    <View className="flex-row items-start justify-between mb-3">
      <View className="flex-1">
        <Text className="text-gray-900 dark:text-gray-100 text-base font-bold mb-1">
          {batch.farm?.name ?? "Farm"}
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 text-sm">{batch.name}</Text>
      </View>
      <View className="flex-row items-center gap-1">
        <Text className="text-gray-500 dark:text-gray-400 text-xs">Batch {batch.batchId}</Text>
      </View>
    </View>

    <View className="gap-2 mb-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-gray-600 dark:text-gray-400 text-sm">Harvest Date</Text>
        <Text className="text-gray-900 dark:text-gray-100 text-sm">{formatDate(batch.harvestDate)}</Text>
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-gray-600 dark:text-gray-400 text-sm">Quantity</Text>
        <Text className="text-gray-900 dark:text-gray-100 text-sm font-medium">
          {batch.quantity} {batch.unit}
        </Text>
      </View>
    </View>

    <TouchableOpacity onPress={() => onRate(batch)} className="rounded-lg overflow-hidden">
      <LinearGradient
        colors={["#ea580c", "#c2410c"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="flex-row items-center justify-center gap-2 py-2.5"
      >
        <Star color="#fff" size={18} fill="transparent" />
        <Text className="text-white text-sm font-semibold">Rate Batch</Text>
      </LinearGradient>
    </TouchableOpacity>
  </View>
);

export default FarmerCard;
