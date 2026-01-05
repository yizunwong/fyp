import { Text, View } from "react-native";
import { MapPin, Ruler, Sprout } from "lucide-react-native";
import type { FarmerControllerFindFarms200AllOf } from "@/api";
import FarmActions from "./FarmActions";
import FarmCategoryBadges from "./FarmCategoryBadges";
import FarmStatusBadge from "./FarmStatusBadge";
import { formatFarmLocation } from "@/utils/farm";

export interface FarmCardsProps {
  farms: FarmerControllerFindFarms200AllOf;
  pendingDeleteId: string | null;
  onEdit: (farmId: string) => void;
  onDelete: (farmId: string, farmName: string) => void;
  formatSize: (value: number | null) => string;
}

export default function FarmCards({
  farms,
  pendingDeleteId,
  onEdit,
  onDelete,
  formatSize,
}: FarmCardsProps) {
  return (
    <View className="gap-4">
      {farms.data?.map((farm) => (
        <View
          key={farm.id}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm"
        >
          <View className="flex-row items-start gap-4">
            <View className="w-12 h-12 rounded-xl bg-emerald-50 items-center justify-center">
              <Sprout color="#047857" size={24} />
            </View>
            <View className="flex-1">
              <View className="flex-row items-start justify-between gap-3">
                <Text className="text-gray-900 dark:text-gray-100 text-lg font-semibold flex-1">
                  {farm.name}
                </Text>
                <FarmStatusBadge status={farm.verificationStatus} />
              </View>
              <View className="flex-row items-center gap-2 mt-2">
                <MapPin color="#6b7280" size={16} />
                <Text className="text-gray-600 dark:text-gray-400 text-sm">
                  {formatFarmLocation(farm)}
                </Text>
              </View>
              <View className="flex-row items-center gap-2 mt-2">
                <Ruler color="#6b7280" size={16} />
                <Text className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                  {formatSize(farm.size)} {farm.sizeUnit}
                </Text>
              </View>
              <View className="mt-3">
                <Text className="text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold mb-2">
                  Produce Categories
                </Text>
                <FarmCategoryBadges categories={farm.produceCategories} />
              </View>
              <Text className="text-gray-500 dark:text-gray-400 text-xs mt-3">
                {farm.produces.length} produce records
              </Text>
              <View className="mt-4">
                <FarmActions
                  farm={farm}
                  isDeleting={pendingDeleteId === farm.id}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
