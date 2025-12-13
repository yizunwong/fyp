import { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  Modal,
  TextInput,
} from "react-native";
import { Star, MessageSquare, ThumbsUp, Send } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppLayout } from "@/components/layout/AppLayoutContext";
import { usePendingReviewQuery, useRateBatchMuation } from "@/hooks/useProduce";
import {
  type FarmReviewDto,
  type ProduceListResponseDto,
} from "@/api";
import { useReviewHistoryQuery } from "@/hooks/useRetailer";

export default function RatingsScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;

  const { batches, isLoading } = usePendingReviewQuery();
  const [selectedBatch, setSelectedBatch] =
    useState<ProduceListResponseDto | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [historyFarmId, setHistoryFarmId] = useState<string | null>(null);
  const rateBatchMutation = useRateBatchMuation();
  const historyQuery = useReviewHistoryQuery();
  const historyRatings = historyQuery.reviews as FarmReviewDto[];

  const layoutMeta = useMemo(
    () => ({
      title: "Rate Suppliers",
      subtitle: "Share your feedback with farmers",
      mobile: {
        disableScroll: false,
      },
    }),
    []
  );

  useAppLayout(layoutMeta);

  const pendingRatings = useMemo(() => batches ?? [], [batches]);

  const farmOptions = useMemo(() => {
    const seen = new Set<string>();
    const options: { id: string; name: string }[] = [];
    (historyRatings ?? []).forEach((review) => {
      if (review.farmId && !seen.has(review.farmId)) {
        seen.add(review.farmId);
        options.push({
          id: review.farmId,
          name: review.produceName ?? "Farm",
        });
      }
    });
    return options;
  }, [historyRatings]);

  useEffect(() => {
    if (!historyFarmId && farmOptions.length > 0) {
      setHistoryFarmId(farmOptions[0].id);
    }
  }, [farmOptions, historyFarmId]);

  const handleRateBatch = (batch: ProduceListResponseDto) => {
    rateBatchMutation.reset?.();
    setSelectedBatch(batch);
    if (batch.farmId) {
      setHistoryFarmId(batch.farmId);
    }
    setRating(0);
    setReview("");
    setShowRatingModal(true);
  };

  const handleSubmitRating = () => {
    if (!selectedBatch) return;
    rateBatchMutation
      .rateBatch(selectedBatch.batchId, {
        rating,
        comment: review || undefined,
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setShowRatingModal(false);
        setRating(0);
        setReview("");
        setSelectedBatch(null);
      });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 5:
        return "Excellent!";
      case 4:
        return "Very Good!";
      case 3:
        return "Good";
      case 2:
        return "Fair";
      case 1:
        return "Needs Improvement";
      default:
        return "";
    }
  };

  const FarmerCard = ({ batch }: { batch: ProduceListResponseDto }) => (
    <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-gray-900 text-base font-bold mb-1">
            {batch.farm?.name ?? "Farm"}
          </Text>
          <Text className="text-gray-600 text-sm">{batch.name}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Text className="text-gray-500 text-xs">Batch {batch.batchId}</Text>
        </View>
      </View>

      <View className="gap-2 mb-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">Harvest Date</Text>
          <Text className="text-gray-900 text-sm">
            {formatDate(batch.harvestDate)}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">Quantity</Text>
          <Text className="text-gray-900 text-sm font-medium">
            {batch.quantity} {batch.unit}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => handleRateBatch(batch)}
        className="rounded-lg overflow-hidden"
      >
        <LinearGradient
          colors={["#ea580c", "#c2410c"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex-row items-center justify-center gap-2 py-2.5"
        >
          <Star color="#fff" size={18} fill="transparent" />
          <Text className="text-white text-sm font-semibold">Rate Batch</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const RatingHistoryCard = ({ rating }: { rating: FarmReviewDto }) => (
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
        <Text className="text-gray-500 text-xs">
          {formatDate(rating.createdAt)}
        </Text>
      </View>
    </View>
  );

  const pageContent = (
    <View className="px-6 py-6">
      <View className="mb-6">
        <Text className="text-gray-900 text-xl font-bold mb-2">
          Rate Suppliers
        </Text>
        <Text className="text-gray-600 text-sm">
          Share your feedback and help improve the agricultural supply chain
        </Text>
      </View>

      <View className="flex-row bg-white rounded-xl p-1 border border-gray-200 mb-6">
        <TouchableOpacity
          onPress={() => setActiveTab("pending")}
          className={`flex-1 py-2 rounded-lg ${
            activeTab === "pending" ? "bg-orange-50" : ""
          }`}
        >
          <Text
            className={`text-center text-sm font-semibold ${
              activeTab === "pending" ? "text-orange-700" : "text-gray-600"
            }`}
          >
            Pending ({pendingRatings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("history")}
          className={`flex-1 py-2 rounded-lg ${
            activeTab === "history" ? "bg-orange-50" : ""
          }`}
        >
          <Text
            className={`text-center text-sm font-semibold ${
              activeTab === "history" ? "text-orange-700" : "text-gray-600"
            }`}
          >
            History ({historyRatings.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "pending" && (
        <>
          {isLoading ? (
            <View className="bg-white rounded-xl p-8 border border-gray-200 items-center">
              <Text className="text-gray-900 text-base font-bold mt-4">
                Loading batches...
              </Text>
            </View>
          ) : pendingRatings.length > 0 ? (
            <View>
              {isDesktop ? (
                <View className="flex-row flex-wrap gap-4">
                  {pendingRatings.map((batch) => (
                    <View key={batch.id} style={{ width: "48%" }}>
                      <FarmerCard batch={batch} />
                    </View>
                  ))}
                </View>
              ) : (
                <View>
                  {pendingRatings.map((batch) => (
                    <FarmerCard key={batch.id} batch={batch} />
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View className="bg-white rounded-xl p-8 border border-gray-200 items-center">
              <ThumbsUp color="#9ca3af" size={48} />
              <Text className="text-gray-900 text-base font-bold mt-4">
                All caught up!
              </Text>
              <Text className="text-gray-500 text-sm text-center mt-2">
                You have rated all your recent suppliers
              </Text>
            </View>
          )}
        </>
      )}

      {activeTab === "history" && (
        <>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-900 text-sm font-bold">
              Your Past Ratings
            </Text>
            {farmOptions.length > 1 && (
              <View className="flex-row gap-2">
                {farmOptions.map((farm) => (
                  <TouchableOpacity
                    key={farm.id}
                    onPress={() => setHistoryFarmId(farm.id)}
                    className={`px-3 py-1.5 rounded-full border ${
                      historyFarmId === farm.id
                        ? "bg-orange-50 border-orange-500"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        historyFarmId === farm.id
                          ? "text-orange-700"
                          : "text-gray-700"
                      }`}
                    >
                      {farm.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {historyQuery.isLoading ? (
            <View className="bg-white rounded-xl p-8 border border-gray-200 items-center">
              <Text className="text-gray-900 text-base font-bold mt-2">
                Loading your reviews...
              </Text>
            </View>
          ) : historyFarmId && historyRatings.length > 0 ? (
            <View>
              {historyRatings.map((rating) => (
                <RatingHistoryCard key={rating.id} rating={rating} />
              ))}
            </View>
          ) : (
            <View className="bg-white rounded-xl p-8 border border-gray-200 items-center">
              <MessageSquare color="#9ca3af" size={48} />
              <Text className="text-gray-900 text-base font-bold mt-4">
                No ratings yet
              </Text>
              <Text className="text-gray-500 text-sm text-center mt-2">
                {historyFarmId
                  ? "Start rating your suppliers to see history here"
                  : "No farm selected for review history yet"}
              </Text>
            </View>
          )}
        </>
      )}

      <View className="bg-blue-50 rounded-lg p-4 border border-blue-200 mt-6">
        <Text className="text-blue-700 text-sm font-bold mb-2">
          Why Rate Suppliers?
        </Text>
        <View className="gap-1">
          <Text className="text-blue-600 text-xs">
            - Help farmers improve their service quality
          </Text>
          <Text className="text-blue-600 text-xs">
            - Guide other retailers in their decisions
          </Text>
          <Text className="text-blue-600 text-xs">
            - Build stronger supplier relationships
          </Text>
          <Text className="text-blue-600 text-xs">
            - Support transparency in the supply chain
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {pageContent}

      <Modal visible={showRatingModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-white rounded-2xl p-6 max-w-md w-full">
            <Text className="text-gray-900 text-xl font-bold mb-4">
              Rate Batch
            </Text>

            {selectedBatch && (
              <>
                <View className="bg-orange-50 rounded-lg p-3 mb-4 border border-orange-200">
                  <Text className="text-orange-900 text-sm font-bold">
                    {selectedBatch.farm?.name ?? "Farm"}
                  </Text>
                  <Text className="text-orange-700 text-xs">
                    {selectedBatch.name} (Batch {selectedBatch.batchId})
                  </Text>
                </View>

                <View className="mb-4">
                  <Text className="text-gray-600 text-sm mb-2">
                    Your Rating*
                  </Text>
                  <View className="flex-row items-center justify-center gap-3 py-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setRating(star)}
                      >
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
                  <Text className="text-gray-600 text-sm mb-2">
                    Review (Optional)
                  </Text>
                  <TextInput
                    value={review}
                    onChangeText={setReview}
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
                    onPress={() => {
                      setShowRatingModal(false);
                      setRating(0);
                      setReview("");
                      setSelectedBatch(null);
                    }}
                    className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
                  >
                    <Text className="text-gray-700 text-sm font-semibold">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSubmitRating}
                    disabled={rating === 0}
                    className={`flex-1 rounded-lg py-3 items-center flex-row justify-center gap-2 ${
                      rating > 0 ? "bg-orange-500" : "bg-gray-300"
                    }`}
                  >
                    <Send color="#fff" size={16} />
                    <Text className="text-white text-sm font-semibold">
                      Submit
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
