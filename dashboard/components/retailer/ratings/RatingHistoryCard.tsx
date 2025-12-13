import { View, Text } from "react-native";
import { Star } from "lucide-react-native";
import type { FarmReviewDto } from "@/api";

type RatingHistoryCardProps = {
  rating: FarmReviewDto;
  formatDate: (dateString: string) => string;
};

const RatingHistoryCard = ({ rating, formatDate }: RatingHistoryCardProps) => (
  <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
    <View className="flex-row items-start justify-between mb-2">
      <View className="flex-1">
        <Text className="text-gray-900 text-sm font-bold mb-1">
          {rating.produceName}
        </Text>
        <Text className="text-gray-600 text-xs">{rating.retailerName}</Text>
      </View>
      <View className="flex-row items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            color="#f59e0b"
            size={14}
            fill={i < rating.rating ? "#f59e0b" : "transparent"}
          />
        ))}
      </View>
    </View>

    <View className="bg-gray-50 rounded-lg p-3 mb-2">
      <Text className="text-gray-700 text-sm">{rating.comment}</Text>
    </View>

    <View className="flex-row items-center justify-between">
      <Text className="text-gray-500 text-xs">Batch: {rating.batchId}</Text>
      <Text className="text-gray-500 text-xs">{formatDate(rating.createdAt)}</Text>
    </View>
  </View>
);

export default RatingHistoryCard;
