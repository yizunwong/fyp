import { Text, View } from "react-native";
import { MapPin, Ruler } from "lucide-react-native";
import type { FarmerControllerFindFarms200AllOf } from "@/api";
import FarmActions from "./FarmActions";
import FarmCategoryBadges from "./FarmCategoryBadges";

export interface FarmTableProps {
  farms: FarmerControllerFindFarms200AllOf;
  pendingDeleteId: string | null;
  onManageProduce: (farmId: string) => void;
  onEdit: (farmId: string) => void;
  onDelete: (farmId: string, farmName: string) => void;
  formatSize: (value: number | null) => string;
}

export default function FarmTable({
  farms,
  pendingDeleteId,
  onManageProduce,
  onEdit,
  onDelete,
  formatSize,
}: FarmTableProps) {
  return (
    <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <View className="flex-row bg-gray-50 px-6 py-4">
        <Text className="flex-[2] text-gray-500 text-xs font-semibold uppercase tracking-wide">
          Farm Name
        </Text>
        <Text className="flex-[2] text-gray-500 text-xs font-semibold uppercase tracking-wide">
          Location
        </Text>
        <Text className="flex-1 text-gray-500 text-xs font-semibold uppercase tracking-wide">
          Size (ha)
        </Text>
        <Text className="flex-[2] text-gray-500 text-xs font-semibold uppercase tracking-wide">
          Produce Categories
        </Text>
        <Text className="flex-[2] text-gray-500 text-xs font-semibold uppercase tracking-wide text-right">
          Actions
        </Text>
      </View>

      {farms.data?.map((farm, index) => (
        <View
          key={farm.id}
          className={`flex-row items-center px-6 py-5 ${
            index !== 0 ? "border-t border-gray-100" : ""
          }`}
        >
          <View className="flex-[2]">
            <Text className="text-gray-900 text-base font-semibold">{farm.name}</Text>
            <Text className="text-gray-500 text-xs mt-1">
              {farm.produces.length} produce records
            </Text>
          </View>
          <View className="flex-[2]">
            <View className="flex-row items-center gap-2">
              <MapPin color="#6b7280" size={16} />
              <Text className="text-gray-700 text-sm">{farm.location}</Text>
            </View>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Ruler color="#6b7280" size={16} />
              <Text className="text-gray-900 text-sm font-medium">
                {formatSize(farm.size)}
              </Text>
            </View>
          </View>
          <View className="flex-[2]">
            <FarmCategoryBadges categories={farm.produceCategories} />
          </View>
          <View className="flex-[2] items-end">
            <FarmActions
              farm={farm}
              isDeleting={pendingDeleteId === farm.id}
              onManageProduce={onManageProduce}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </View>
        </View>
      ))}
    </View>
  );
}
