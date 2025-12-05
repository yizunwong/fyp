import { Text, TouchableOpacity, View } from "react-native";
import { Eye, MapPin } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import type { PendingFarmResponseDto } from "@/api";
import { formatSizeUnit, STATUS_STYLES } from "./RegistrationTypes";
import { formatFarmLocation } from "@/utils/farm";

export function FarmRegistrationCard({ farm }: { farm: PendingFarmResponseDto }) {
  const statusStyle = STATUS_STYLES[farm.verificationStatus];
  const locationLabel = formatFarmLocation(farm);
  return (
    <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-gray-900 text-base font-bold">{farm.name}</Text>
            <View className={`px-2 py-0.5 rounded-full ${statusStyle.badge}`}>
              <Text className={`text-xs font-semibold ${statusStyle.text}`}>{statusStyle.label}</Text>
            </View>
          </View>
          <Text className="text-gray-600 text-sm">{farm.farmer.username}</Text>
          <Text className="text-gray-500 text-xs mt-1">#{farm.id}</Text>
        </View>
      </View>

      <View className="gap-2 mb-4">
        <View className="flex-row items-center gap-2">
          <MapPin color="#6b7280" size={16} />
          <Text className="text-gray-700 text-sm flex-1">{locationLabel}</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">Size</Text>
          <Text className="text-gray-900 text-sm font-medium">
            {farm.size} {formatSizeUnit(farm.sizeUnit)}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">Crops</Text>
          <Text className="text-gray-900 text-sm font-medium" numberOfLines={1}>
            {farm.produceCategories.join(", ")}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">Documents</Text>
          <Text className="text-gray-900 text-sm font-medium">{farm.farmDocuments.length}</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => router.push(`/dashboard/agency/registrations/${farm.id}` as never)}
        className="rounded-lg overflow-hidden"
      >
        <LinearGradient
          colors={["#2563eb", "#1d4ed8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex-row items-center justify-center gap-2 py-2.5"
        >
          <Eye color="#fff" size={18} />
          <Text className="text-white text-sm font-semibold">Review Registration</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}
