import { Text, View } from "react-native";
import { MapPin, Ruler } from "lucide-react-native";
import type { FarmerControllerFindFarms200AllOf } from "@/api";
import FarmActions from "./FarmActions";
import FarmCategoryBadges from "./FarmCategoryBadges";
import { formatFarmLocation } from "@/utils/farm";

const STATUS_TEXT: Record<string, string> = {
  PENDING: "text-amber-700",
  VERIFIED: "text-emerald-700",
  REJECTED: "text-rose-700",
};

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
    <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <View className="flex-row bg-gray-50 px-6 py-4">
        <Text className="flex-[2] text-gray-500 text-xs font-semibold uppercase tracking-wide">
          Farm Name
        </Text>
        <Text className="flex-[2] text-gray-500 text-xs font-semibold uppercase tracking-wide">
          Location
        </Text>
        <Text className="flex-1 text-gray-500 text-xs font-semibold uppercase tracking-wide">
          Size
        </Text>
        <Text className="flex-[2] text-gray-500 text-xs font-semibold uppercase tracking-wide">
          Produce Categories
        </Text>
        <Text className="flex-[1.6] text-gray-500 text-xs font-semibold uppercase tracking-wide">
          Status
        </Text>
        <Text className="flex-[0.55] items-end text-gray-500 text-xs font-semibold uppercase tracking-wide text-left">
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
              <Text className="text-gray-700 text-sm">
                {formatFarmLocation(farm)}
              </Text>
            </View>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-gray-900 text-sm font-medium">
                {formatSize(farm.size)} {farm.sizeUnit}
              </Text>
            </View>
          </View>
          <View className="flex-[2]">
            <FarmCategoryBadges categories={farm.produceCategories} />
          </View>
          <View className="flex-[1.6]">
            <Text
              className={`text-sm font-semibold ${STATUS_TEXT[farm.verificationStatus] ?? "text-gray-700"
                }`}
            >
              {farm.verificationStatus}
            </Text>
          </View>
          <View className="flex-[0.6] items-end text-left" >
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
