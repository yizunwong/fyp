import { View, Text } from "react-native";
import { Warehouse, MapPin, Ruler, Leaf, FileText } from "lucide-react-native";
import { FARM_SIZE_UNIT_LABELS, RegisterFarmFormData } from "@/validation/farm";
import { formatFarmLocation } from "@/utils/farm";

const formatFileSize = (size?: number) => {
  if (!size || size <= 0) return "Unknown size";
  const units = ["B", "KB", "MB", "GB"];
  let current = size;
  let index = 0;

  while (current >= 1024 && index < units.length - 1) {
    current /= 1024;
    index += 1;
  }

  return `${current.toFixed(current >= 10 || current % 1 === 0 ? 0 : 1)} ${
    units[index]
  }`;
};

interface FarmPreviewCardProps {
  formData: RegisterFarmFormData;
  compact?: boolean;
}

export default function FarmPreviewCard({
  formData,
  compact = false,
}: FarmPreviewCardProps) {
  const landDocuments = Array.isArray(formData.landDocuments)
    ? formData.landDocuments
    : [];
  const hasLandDocuments = landDocuments.length > 0;
  const locationLabel = formatFarmLocation(formData);

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
            {locationLabel || "Location pending"}
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
              {locationLabel || "Not provided"}
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
              Land Documents
            </Text>
            <Text className="text-gray-900 text-sm font-semibold">
              {hasLandDocuments
                ? `${landDocuments.length} file${landDocuments.length === 1 ? "" : "s"} attached`
                : "No documents uploaded"}
            </Text>
          </View>
        </View>
        {hasLandDocuments ? (
          <View className="gap-2">
            {landDocuments.slice(0, 3).map((doc) => (
              <View
                key={doc.id}
                className="border border-gray-200 rounded-xl bg-white px-3 py-2"
              >
                <Text className="text-gray-800 text-xs font-medium" numberOfLines={1}>
                  {doc.name}
                </Text>
                <Text className="text-gray-500 text-xs mt-1">
                  {formatFileSize(doc.size)}
                </Text>
              </View>
            ))}
            {landDocuments.length > 3 ? (
              <Text className="text-gray-400 text-xs">
                +{landDocuments.length - 3} more document
                {landDocuments.length - 3 === 1 ? "" : "s"}
              </Text>
            ) : null}
          </View>
        ) : (
          <Text className="text-gray-500 text-xs">
            Upload land titles, tenancy agreements or registration proof.
          </Text>
        )}
      </View>
    </View>
  );
}
