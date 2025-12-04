import { Text, TouchableOpacity, View } from "react-native";
import { MapPin } from "lucide-react-native";
import type { PendingFarmResponseDto } from "@/api";
import { formatDate, formatSizeUnit, type StatusStyle } from "./RegistrationTypes";

export function RegistrationHeader({
  farm,
  statusStyle,
  onBack,
}: {
  farm: PendingFarmResponseDto;
  statusStyle: StatusStyle;
  onBack: () => void;
}) {
  return (
    <View className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-1">
          <Text className="text-gray-900 text-xl font-bold">{farm.name}</Text>
          <Text className="text-gray-600 text-sm">
            {farm.farmer.username} - #{farm.id}
          </Text>
          <View className="flex-row items-center gap-2 mt-2">
            <View className={`px-2 py-0.5 rounded-full ${statusStyle.badge}`}>
              <Text className={`text-xs font-semibold ${statusStyle.text}`}>{statusStyle.label}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={onBack} className="px-3 py-2 rounded-lg bg-white border border-gray-200">
          <Text className="text-gray-700 text-xs font-semibold">Back to list</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center gap-3 mt-2">
        <MapPin color="#6b7280" size={16} />
        <Text className="text-gray-700 text-sm flex-1">{farm.location}</Text>
      </View>

      <View className="flex-row flex-wrap gap-4 mt-4">
        <View className="flex-row items-center gap-2">
          <Text className="text-gray-500 text-xs">Size</Text>
          <Text className="text-gray-900 text-sm font-semibold">
            {farm.size} {formatSizeUnit(farm.sizeUnit)}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-gray-500 text-xs">Crops</Text>
          <Text className="text-gray-900 text-sm font-semibold">{farm.produceCategories.join(", ")}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-gray-500 text-xs">Submitted</Text>
          <Text className="text-gray-900 text-sm font-semibold">{formatDate(farm.createdAt)}</Text>
        </View>
      </View>
    </View>
  );
}
