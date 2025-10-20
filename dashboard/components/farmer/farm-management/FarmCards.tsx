import { Text, View } from "react-native";
import { MapPin, Ruler, Sprout } from "lucide-react-native";
import type { FarmerControllerFindFarms200AllOf } from "@/api";
import FarmActions from "./FarmActions";
import FarmCategoryBadges from "./FarmCategoryBadges";

export interface FarmCardsProps {
  farms: FarmerControllerFindFarms200AllOf;
  pendingDeleteId: string | null;
  onManageProduce: (farmId: string) => void;
  onEdit: (farmId: string) => void;
  onDelete: (farmId: string, farmName: string) => void;
  formatSize: (value: number | null) => string;
}

export default function FarmCards({
  farms,
  pendingDeleteId,
  onManageProduce,
  onEdit,
  onDelete,
  formatSize,
}: FarmCardsProps) {
  return (
    <View className="gap-4">
      {farms.data?.map((farm) => (
        <View
          key={farm.id}
          className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
        >
          <View className="flex-row items-start gap-4">
            <View className="w-12 h-12 rounded-xl bg-emerald-50 items-center justify-center">
              <Sprout color="#047857" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-lg font-semibold">{farm.name}</Text>
              <View className="flex-row items-center gap-2 mt-2">
                <MapPin color="#6b7280" size={16} />
                <Text className="text-gray-600 text-sm">{farm.location}</Text>
              </View>
              <View className="flex-row items-center gap-2 mt-2">
                <Ruler color="#6b7280" size={16} />
                <Text className="text-gray-700 text-sm font-medium">
                  {formatSize(farm.size)} ha
                </Text>
              </View>
              <View className="mt-3">
                <Text className="text-gray-500 text-xs uppercase font-semibold mb-2">
                  Produce Categories
                </Text>
                <FarmCategoryBadges categories={farm.produceCategories} />
              </View>
              <Text className="text-gray-500 text-xs mt-3">
                {farm.produces.length} produce records
              </Text>
              <View className="mt-4">
                <FarmActions
                  farm={farm}
                  isDeleting={pendingDeleteId === farm.id}
                  onManageProduce={onManageProduce}
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
