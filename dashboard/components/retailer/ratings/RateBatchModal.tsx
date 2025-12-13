import { Modal, View, Text, TouchableOpacity, TextInput } from "react-native";
import { Star, Send } from "lucide-react-native";
import type { ProduceListResponseDto } from "@/api";

type RateBatchModalProps = {
  visible: boolean;
  batch: ProduceListResponseDto | null;
  rating: number;
  review: string;
  onClose: () => void;
  onSubmit: () => void;
  onRatingChange: (value: number) => void;
  onReviewChange: (value: string) => void;
  getRatingLabel: (rating: number) => string;
};

const RateBatchModal = ({
  visible,
  batch,
  rating,
  review,
  onClose,
  onSubmit,
  onRatingChange,
  onReviewChange,
  getRatingLabel,
}: RateBatchModalProps) => (
  <Modal visible={visible} transparent animationType="fade">
    <View className="flex-1 bg-black/50 items-center justify-center px-6">
      <View className="bg-white rounded-2xl p-6 max-w-md w-full">
        <Text className="text-gray-900 text-xl font-bold mb-4">Rate Batch</Text>

        {batch && (
          <>
            <View className="bg-orange-50 rounded-lg p-3 mb-4 border border-orange-200">
              <Text className="text-orange-900 text-sm font-bold">
                {batch.farm?.name ?? "Farm"}
              </Text>
              <Text className="text-orange-700 text-xs">
                {batch.name} (Batch {batch.batchId})
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-gray-600 text-sm mb-2">Your Rating*</Text>
              <View className="flex-row items-center justify-center gap-3 py-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => onRatingChange(star)}>
                    <Star
                      color="#f59e0b"
                      size={40}
                      fill={star <= rating ? "#f59e0b" : "transparent"}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              {rating > 0 && (
                <Text className="text-center text-gray-600 text-sm font-medium">
                  {getRatingLabel(rating)}
                </Text>
              )}
            </View>

            <View className="mb-4">
              <Text className="text-gray-600 text-sm mb-2">Review (Optional)</Text>
              <TextInput
                value={review}
                onChangeText={onReviewChange}
                placeholder="Share details about quality, delivery, communication..."
                multiline
                numberOfLines={4}
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                placeholderTextColor="#9ca3af"
                style={{ textAlignVertical: "top" }}
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
              >
                <Text className="text-gray-700 text-sm font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onSubmit}
                disabled={rating === 0}
                className={`flex-1 rounded-lg py-3 items-center flex-row justify-center gap-2 ${
                  rating > 0 ? "bg-orange-500" : "bg-gray-300"
                }`}
              >
                <Send color="#fff" size={16} />
                <Text className="text-white text-sm font-semibold">Submit</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  </Modal>
);

export default RateBatchModal;
