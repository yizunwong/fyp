import { ScrollView, View } from "react-native";
import type { PendingFarmResponseDto } from "@/api";
import { FarmRegistrationRow } from "./FarmRegistrationRow";
import { FarmRegistrationTableHeader } from "./FarmRegistrationTableHeader";

export function FarmRegistrationTable({ farms }: { farms: PendingFarmResponseDto[] }) {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <FarmRegistrationTableHeader />
      <ScrollView className="max-h-[600px]">
        {farms.map((farm) => (
          <FarmRegistrationRow key={farm.id} farm={farm} />
        ))}
      </ScrollView>
    </View>
  );
}
