import { Text, View } from "react-native";
import type { FarmerControllerFindFarms200AllOf } from "@/api";
import FarmActions from "./FarmActions";
import FarmCategoryBadges from "./FarmCategoryBadges";
import { FarmStatusBadge } from "./FarmStatusBadge";
import { formatFarmLocation } from "@/utils/farm";

export interface FarmTableProps {
  farms: FarmerControllerFindFarms200AllOf;
  pendingDeleteId: string | null;
  onEdit: (farmId: string) => void;
  onDelete: (farmId: string, farmName: string) => void;
  formatSize: (value: number | null) => string;
}

export default function FarmTable({
  farms,
  pendingDeleteId,
  onEdit,
  onDelete,
  formatSize,
}: FarmTableProps) {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <View className="flex-row bg-gray-50 dark:bg-gray-700 px-6 py-4">
        <Text className="flex-[2] text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
          Farm Name
        </Text>
        <Text className="flex-[2] text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
          Location
        </Text>
        <Text className="flex-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
          Size
        </Text>
        <Text className="flex-[2] text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
          Produce Categories
        </Text>
        <Text className="flex-[1.6] text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
          Status
        </Text>
        <Text className="flex-[0.55] items-end text-xs font-semibold uppercase tracking-wide text-left text-gray-500 dark:text-gray-300">
          Actions
        </Text>
      </View>

      {farms.data?.map((farm, index) => (
        <View
          key={farm.id}
          className={`flex-row items-center px-6 py-5 ${
            index !== 0 ? "border-t border-gray-100 dark:border-gray-700" : ""
          }`}
        >
          <View className="flex-[2]">
            <Text className="text-gray-900 dark:text-gray-100 text-base font-semibold">
              {farm.name}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">
              {farm.produces.length} produce records
            </Text>
          </View>
          <View className="flex-[2]">
            <View className="flex-row items-center gap-2">
              <Text className="text-gray-700 dark:text-gray-300 text-sm">
                {formatFarmLocation(farm)}
              </Text>
            </View>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-gray-900 dark:text-gray-100 text-sm font-medium">
                {formatSize(farm.size)} {farm.sizeUnit}
              </Text>
            </View>
          </View>
          <View className="flex-[2]">
            <FarmCategoryBadges categories={farm.produceCategories} />
          </View>
          <View className="flex-[1.6]">
            <View className="flex-row items-center gap-2">
              <FarmStatusBadge status={farm.verificationStatus} />
            </View>
          </View>
          <View className="flex-[0.6] items-end text-left">
            <FarmActions
              farm={farm}
              isDeleting={pendingDeleteId === farm.id}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </View>
        </View>
      ))}
    </View>
  );
}
