import { Text, View } from "react-native";
import type { PendingFarmResponseDto } from "@/api";

export function FarmerInfoCard({ farm }: { farm: PendingFarmResponseDto }) {
  return (
    <View className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
      <Text className="text-gray-900 text-base font-bold mb-3">Farmer Information</Text>
      <View className="gap-2">
        <Text className="text-gray-700 text-sm font-semibold">{farm.farmer.username}</Text>
        <Text className="text-gray-600 text-xs">Email: {farm.farmer.email}</Text>
        <Text className="text-gray-600 text-xs">NRIC: {farm.farmer.nric}</Text>
        <Text className="text-gray-600 text-xs">
          Phone: {farm.farmer.phone ? String(farm.farmer.phone) : "Not provided"}
        </Text>
      </View>
    </View>
  );
}
