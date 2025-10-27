import { FC } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Eye, QrCode, CheckCircle, Clock, XCircle } from "lucide-react-native";
import { ProduceListResponseDto } from "@/api";

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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const ProduceBatchCard: FC<ProduceBatchCardProps> = ({
  batch,
  onViewDetails,
  onViewQR,
}) => {
  const { containerClasses, icon } = getStatusAppearance(batch.name);

  return (
    <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-gray-900 text-lg font-bold mb-1">
            {batch.name}
          </Text>
          <Text className="text-gray-600 text-sm">Batch ID: {batch.id}</Text>
        </View>
        <View
          className={`flex-row items-center gap-1 px-3 py-1 rounded-full ${containerClasses}`}
        >
          {icon}
          <Text className="text-xs font-semibold capitalize">{batch.name}</Text>
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
        {batch.farmId && (
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 text-sm">Farm</Text>
            <Text className="text-gray-900 text-sm font-medium">
              {batch.farmId}
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
          <Text className="text-blue-700 text-sm font-semibold">View QR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProduceBatchCard;
