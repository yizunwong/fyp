import { Text, TouchableOpacity, View } from "react-native";
import { Eye } from "lucide-react-native";
import { router } from "expo-router";
import type { PendingFarmResponseDto } from "@/api";
import { formatSizeUnit, STATUS_STYLES } from "./RegistrationTypes";
import { formatFarmLocation } from "@/utils/farm";

export function FarmRegistrationRow({ farm }: { farm: PendingFarmResponseDto }) {
  const statusStyle = STATUS_STYLES[farm.verificationStatus];
  const locationLabel = formatFarmLocation(farm);
  return (
    <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
      <View className="flex-1">
        <Text className="text-gray-900 text-sm font-semibold">{farm.name}</Text>
        <Text className="text-gray-500 text-xs mt-0.5">#{farm.id}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 text-sm font-medium">{farm.farmer.username}</Text>
        <Text className="text-gray-500 text-xs mt-0.5">{farm.farmer.email}</Text>
      </View>
      <Text className="w-40 text-gray-700 text-sm">{locationLabel}</Text>
      <Text className="w-24 text-gray-900 text-sm font-medium">
        {farm.size} {formatSizeUnit(farm.sizeUnit)}
      </Text>
      <View className="w-40">
        <Text className="text-gray-700 text-xs" numberOfLines={2}>
          {farm.produceCategories.join(", ")}
        </Text>
      </View>
      <View className="w-28 items-start">
        <View className={`px-2 py-0.5 rounded-full ${statusStyle.badge}`}>
          <Text className={`text-xs font-semibold ${statusStyle.text}`}>{statusStyle.label}</Text>
        </View>
      </View>
      <View className="w-24">
        <TouchableOpacity
          onPress={() => router.push(`/dashboard/agency/registrations/${farm.id}` as never)}
          className="flex-row items-center justify-center gap-1 bg-blue-50 border border-blue-200 rounded-lg py-1.5 px-2"
        >
          <Eye color="#2563eb" size={14} />
          <Text className="text-blue-700 text-xs font-semibold">Review</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
