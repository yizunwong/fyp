import { View, Text } from "react-native";
import { Warehouse, MapPin, Ruler, Leaf, FileText } from "lucide-react-native";
import { RegisterFarmFormData } from "./types";
import { FARM_SIZE_UNIT_LABELS } from "@/validation/farm";

interface FarmPreviewCardProps {
  formData: RegisterFarmFormData;
  compact?: boolean;
}

export default function FarmPreviewCard({
  formData,
  compact = false,
}: FarmPreviewCardProps) {
  return (
    <View
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${
        compact ? "mt-6" : ""
      } p-6 md:p-8`}
    >
      <Text className="text-gray-900 text-lg font-semibold mb-1">
        Registration Preview
      </Text>
      <Text className="text-gray-500 text-sm mb-6">
        See how this farm will appear in your records
      </Text>

      <View className="flex-row items-center gap-3 mb-6">
        <View className="w-14 h-14 bg-emerald-100 rounded-2xl items-center justify-center">
          <Warehouse color="#047857" size={28} />
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 text-lg font-semibold">
            {formData.name || "New Farm"}
          </Text>
          <Text className="text-gray-500 text-sm">
            {formData.location || "Location pending"}
          </Text>
        </View>
      </View>

      <View className="bg-emerald-50 rounded-2xl p-5 mb-6">
        <View className="flex-row items-center gap-3 mb-4">
          <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
            <MapPin color="#059669" size={18} />
          </View>
          <View className="flex-1">
            <Text className="text-gray-500 text-xs tracking-wide uppercase">
              Location
            </Text>
            <Text className="text-gray-900 text-sm font-semibold">
              {formData.location || "Not provided"}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-3 mb-4">
          <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
            <Ruler color="#059669" size={18} />
          </View>
          <View className="flex-1">
            <Text className="text-gray-500 text-xs tracking-wide uppercase">
              Farm Size
            </Text>
            <Text className="text-gray-900 text-sm font-semibold">
              {formData.size
                ? `${formData.size} ${
                    FARM_SIZE_UNIT_LABELS[
                      formData.sizeUnit as keyof typeof FARM_SIZE_UNIT_LABELS
                    ] ?? formData.sizeUnit
                  }`
                : "Not set"}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
            <Leaf color="#059669" size={18} />
          </View>
          <View className="flex-1">
            <Text className="text-gray-500 text-xs tracking-wide uppercase">
              Primary Crops
            </Text>
            <Text className="text-gray-900 text-sm font-semibold">
              {formData.primaryCrops || "Not listed"}
            </Text>
          </View>
        </View>
      </View>

      <View className="bg-gray-50 rounded-2xl p-5">
        <View className="flex-row items-center gap-3 mb-4">
          <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
            <FileText color="#6b7280" size={18} />
          </View>
          <View className="flex-1">
            <Text className="text-gray-500 text-xs tracking-wide uppercase">
              Farming Practice
            </Text>
            <Text className="text-gray-900 text-sm font-semibold">
              {formData.farmingPractice || "Pending"}
            </Text>
          </View>
        </View>
        <Text className="text-gray-600 text-sm leading-relaxed">
          {formData.description ||
            "Use this space to capture irrigation systems, certifications or other farm highlights."}
        </Text>
        {formData.registrationNumber ? (
          <View className="mt-4">
            <Text className="text-gray-500 text-xs uppercase tracking-wide">
              Registration ID
            </Text>
            <Text className="text-gray-900 text-sm font-semibold mt-1">
              {formData.registrationNumber}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
