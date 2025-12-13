import { useState, useMemo, useEffect } from "react";
import { View, Text, TouchableOpacity, Platform, useWindowDimensions } from "react-native";
import { MessageSquare, ThumbsUp } from "lucide-react-native";
import { useAppLayout } from "@/components/layout/AppLayoutContext";
import { usePendingReviewQuery, useRateBatchMuation } from "@/hooks/useProduce";
import { type FarmReviewDto, type ProduceListResponseDto } from "@/api";
import { useReviewHistoryQuery } from "@/hooks/useRetailer";
import FarmerCard from "@/components/retailer/ratings/FarmerCard";
import RatingHistoryCard from "@/components/retailer/ratings/RatingHistoryCard";
import RateBatchModal from "@/components/retailer/ratings/RateBatchModal";

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

  const pageContent = (
    <View className="px-6 py-6">
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
                      <FarmerCard batch={batch} onRate={handleRateBatch} formatDate={formatDate} />
                    </View>
                  ))}
                </View>
              ) : (
                <View>
                  {pendingRatings.map((batch) => (
                    <FarmerCard
                      key={batch.id}
                      batch={batch}
                      onRate={handleRateBatch}
                      formatDate={formatDate}
                    />
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
                <RatingHistoryCard key={rating.id} rating={rating} formatDate={formatDate} />
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

      <RateBatchModal
        visible={showRatingModal}
        batch={selectedBatch}
        rating={rating}
        review={review}
        onClose={() => {
          setShowRatingModal(false);
          setRating(0);
          setReview("");
          setSelectedBatch(null);
        }}
        onSubmit={handleSubmitRating}
        onRatingChange={setRating}
        onReviewChange={setReview}
        getRatingLabel={getRatingLabel}
      />
    </View>
  );
}
