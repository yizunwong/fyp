import { FC, useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Eye, QrCode, CheckCircle, Clock, XCircle } from "lucide-react-native";
import { ProduceListResponseDto } from "@/api";
import ImagePlaceholder from "./ImagePlaceholder";
import { formatDate } from '../farm-produce/utils';

interface ProduceBatchCardProps {
  batch: ProduceListResponseDto;
  onViewDetails: (batch: ProduceListResponseDto) => void;
  onViewQR: (batch: ProduceListResponseDto) => void;
}

const getStatusAppearance = (status: string) => {
  switch (status) {
    case "verified":
      return {
        containerClasses: "bg-green-100 text-green-700",
        icon: <CheckCircle color="#15803d" size={16} />,
      };
    case "pending":
      return {
        containerClasses: "bg-amber-100 text-amber-700",
        icon: <Clock color="#b45309" size={16} />,
      };
    case "failed":
      return {
        containerClasses: "bg-red-100 text-red-700",
        icon: <XCircle color="#dc2626" size={16} />,
      };
    default:
      return {
        containerClasses: "bg-gray-100 text-gray-700",
        icon: null,
      };
  }
};

const getPlaceholderIcon = (batch: ProduceListResponseDto) => {
  const normalized = batch.category?.toLowerCase() ?? "";

  if (normalized.includes("grain") || normalized.includes("rice")) {
    return "🌾";
  }

  if (normalized.includes("carrot") || normalized.includes("root")) {
    return "🥕";
  }

  return "🍅";
};

const ProduceBatchCard: FC<ProduceBatchCardProps> = ({
  batch,
  onViewDetails,
  onViewQR,
}) => {
  const { containerClasses, icon } = getStatusAppearance(batch.name);
  const imageUrl = batch.imageUrl ?? null;
  const placeholderIcon = useMemo(() => getPlaceholderIcon(batch), [batch]);

  return (
    <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md hover:border-emerald-200">
      <View className="flex-row items-start gap-4">
        <ImagePlaceholder
          size={88}
          rounded="lg"
          border
          imageUrl={imageUrl}
          icon={placeholderIcon}
          accessibilityLabel="Produce image placeholder"
          alt={`Photo of ${batch.name}`}
        />
        <View className="flex-1">
          <View className="flex-row items-start justify-between gap-3 mb-3">
            <View className="flex-1">
              <Text className="text-gray-900 text-lg font-bold">
                {batch.name}
              </Text>
              <Text className="text-gray-600 text-sm mt-1">
                Batch ID: {batch.batchId}
              </Text>
            </View>
            <View
              className={`flex-row items-center gap-1 px-3 py-1 rounded-full ${containerClasses}`}
            >
              {icon}
              <Text className="text-xs font-semibold capitalize">
                {batch.category}
              </Text>
            </View>
          </View>

          <View className="gap-2 mb-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-600 text-sm">Harvest Date</Text>
              <Text className="text-gray-900 text-sm font-medium">
                {formatDate(batch.harvestDate)}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-600 text-sm">Quantity</Text>
              <Text className="text-gray-900 text-sm font-medium">
                {batch.quantity} {batch.unit}
              </Text>
            </View>
            {batch.farm?.name && (
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-600 text-sm">Farm</Text>
                <Text className="text-gray-900 text-sm font-medium">
                  {batch.farm?.name}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => onViewDetails(batch)}
              className="flex-1 flex-row items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg py-2"
            >
              <Eye color="#059669" size={18} />
              <Text className="text-emerald-700 text-sm font-semibold">
                View Details
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onViewQR(batch)}
              className="flex-1 flex-row items-center justify-center gap-2 bg-blue-50 border border-blue-200 rounded-lg py-2"
            >
              <QrCode color="#2563eb" size={18} />
              <Text className="text-blue-700 text-sm font-semibold">
                View QR
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ProduceBatchCard;
