import { View, Text, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar, MapPin, Star } from "lucide-react-native";
import type { ProduceListResponseDto } from "@/api";
import { toStatusInfo } from "./helpers";

type OrderCardProps = {
  order: ProduceListResponseDto;
  onViewDetails: (order: ProduceListResponseDto) => void;
};

const OrderCard = ({ order, onViewDetails }: OrderCardProps) => {
  const statusInfo = toStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;
  const farmName = order.farm?.name ?? "Farm";
  const farmLocation = order.farm?.address
    ? `${order.farm.address}${order.farm.district ? `, ${order.farm.district}` : ""}${
        order.farm.state ? `, ${order.farm.state}` : ""
      }`
    : farmName;
  const farmRating = order.farm?.rating ?? 0;
  const farmRatingCount = order.farm?.ratingCount ?? 0;

  return (
    <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
      {order.imageUrl ? (
        <View className="rounded-lg overflow-hidden mb-3 border border-gray-100 bg-gray-100">
          <Image
            source={{ uri: order.imageUrl }}
            style={{ width: "100%", height: 160 }}
            resizeMode="cover"
          />
        </View>
      ) : null}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-gray-900 text-base font-bold mb-1">
            {order.name}
          </Text>
          <Text className="text-gray-600 text-sm">{farmName}</Text>
          <View className="flex-row items-center gap-1 mt-1">
            <Star color="#f59e0b" size={14} fill="#f59e0b" />
            <Text className="text-gray-800 text-xs font-semibold">
              {farmRating.toFixed(1)}
            </Text>
            <Text className="text-gray-500 text-xs">
              ({farmRatingCount})
            </Text>
          </View>
        </View>
        <View className={`px-3 py-1 rounded-full ${statusInfo.color}`}>
          <Text className="text-xs font-semibold">{statusInfo.label}</Text>
        </View>
      </View>

      <View className="bg-gray-50 rounded-lg p-3 mb-3">
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 text-sm">Order ID</Text>
            <Text className="text-gray-900 text-sm font-mono font-medium">
              {order.batchId}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 text-sm">Batch</Text>
            <Text className="text-gray-900 text-sm font-mono font-medium">
              {order.batchId}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 text-sm">Quantity</Text>
            <Text className="text-gray-900 text-sm font-medium">
              {order.quantity ?? 0} {order.unit}
            </Text>
          </View>
        </View>
      </View>

      <View className="gap-2 mb-3">
        <View className="flex-row items-center gap-2">
          <Calendar color="#9ca3af" size={14} />
          <Text className="text-gray-600 text-xs">
            Harvested: {new Date(order.harvestDate).toLocaleDateString()}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <MapPin color="#9ca3af" size={14} />
          <Text className="text-gray-600 text-xs">
            {farmLocation || "Location pending"}
          </Text>
        </View>
      </View>

      <TouchableOpacity className="rounded-lg overflow-hidden">
        <LinearGradient
          colors={["#ea580c", "#c2410c"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex-row items-center justify-center gap-2 py-2.5"
        >
          <StatusIcon color="#fff" size={18} />
          <Text className="text-white text-sm font-semibold">
            View Details
          </Text>
        </LinearGradient>
        <TouchableOpacity
          className="absolute inset-0"
          onPress={() => onViewDetails(order)}
        />
      </TouchableOpacity>
    </View>
  );
};

export default OrderCard;
