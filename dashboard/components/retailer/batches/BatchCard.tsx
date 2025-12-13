import { View, Text, TouchableOpacity, Image } from "react-native";
import { Eye, Star, MapPin } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { ProduceListResponseDto } from "@/api";
import {
  formatDate,
  getCertificationBadge,
  getStatusColor,
  getStatusLabel,
} from "./helpers";

type BatchCardProps = {
  batch: ProduceListResponseDto;
  onSelect: (batch: ProduceListResponseDto) => void;
};

const BatchCard = ({ batch, onSelect }: BatchCardProps) => {
  const certBadge = getCertificationBadge(batch.certifications?.[0]?.type);
  const farmRating = batch.farm?.rating ?? 0;
  const farmRatingCount = batch.farm?.ratingCount ?? 0;

  return (
    <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
      {batch.imageUrl ? (
        <View className="rounded-lg overflow-hidden mb-3 border border-gray-100 bg-gray-100">
          <Image
            source={{ uri: batch.imageUrl }}
            style={{ width: "100%", height: 160 }}
            resizeMode="cover"
          />
        </View>
      ) : null}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-gray-900 text-base font-bold">
              {batch.name}
            </Text>
            <View className={`px-2 py-0.5 rounded-full ${certBadge.color}`}>
              <Text className="text-xs font-semibold">{certBadge.label}</Text>
            </View>
          </View>
          <Text className="text-gray-600 text-sm">
            {batch.farm?.name ?? "Unknown Farm"}
          </Text>
          <View className="flex-row items-center gap-1 mt-1">
            <Star color="#f59e0b" size={14} fill="#f59e0b" />
            <Text className="text-gray-800 text-xs font-semibold">
              {farmRating.toFixed(1)}
            </Text>
            <Text className="text-gray-500 text-xs">({farmRatingCount})</Text>
          </View>
        </View>
        <View className={`px-3 py-1 rounded-full ${getStatusColor(batch.status)}`}>
          <Text className="text-xs font-semibold capitalize">
            {getStatusLabel(batch.status)}
          </Text>
        </View>
      </View>

      <View className="gap-2 mb-3">
        <View className="flex-row items-center gap-1 mb-1">
          <MapPin color="#9ca3af" size={14} />
          <Text className="text-gray-500 text-xs">
            {batch.farm?.address
              ? `${batch.farm.address}, ${batch.farm.district ?? ""} ${batch.farm.state ?? ""}`.trim()
              : batch.farm?.name ?? "Location pending"}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">Batch Number</Text>
          <Text className="text-gray-900 text-sm font-mono font-medium">
            {batch.batchId}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">Quantity</Text>
          <Text className="text-gray-900 text-sm font-medium">
            {batch.quantity ?? 0} {batch.unit}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">Harvest Date</Text>
          <Text className="text-gray-900 text-sm">
            {formatDate(batch.harvestDate.toString())}
          </Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => onSelect(batch)} className="rounded-lg overflow-hidden">
        <LinearGradient
          colors={["#ea580c", "#c2410c"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex-row items-center justify-center gap-2 py-2.5"
        >
          <Eye color="#fff" size={18} />
          <Text className="text-white text-sm font-semibold">View Details</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default BatchCard;
