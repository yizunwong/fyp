import { useMemo } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useAgencyLayout } from "@/components/agency/layout/AgencyLayoutContext";
import {
  FarmRegistrationCardList,
  FarmRegistrationPageHeader,
  FarmRegistrationSummaryCards,
  FarmRegistrationTable,
  type FarmRegistrationStats,
} from "@/components/agency/registration";
import { usePendingFarmsQuery } from "@/hooks/useFarmReview";

export default function FarmRegistrationReviewScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;

  useAgencyLayout({
    title: "Farm Registration Review",
    subtitle: "Validate and approve farm registrations",
  });

  const { data, error, isLoading, isFetching, refetch } =
    usePendingFarmsQuery();
  const farms = useMemo(() => data?.data ?? [], [data]);

  const stats = useMemo<FarmRegistrationStats>(
    () => ({
      pending: farms.filter((farm) => farm.verificationStatus === "PENDING")
        .length,
      verified: farms.filter((farm) => farm.verificationStatus === "VERIFIED")
        .length,
      rejected: farms.filter((farm) => farm.verificationStatus === "REJECTED")
        .length,
      documents: farms.reduce(
        (total, farm) => total + farm.farmDocuments.length,
        0
      ),
    }),
    [farms]
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-700 mt-3">Loading registrations...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-gray-900 text-xl font-bold mb-2">
          Failed to load registrations
        </Text>
        <Text className="text-gray-600 text-sm mb-4">{error as string}</Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="px-4 py-2 bg-blue-600 rounded-lg"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const pageContent = (
    <View className="px-6 py-6">
      <FarmRegistrationPageHeader isFetching={isFetching} onRefresh={refetch} />
      <FarmRegistrationSummaryCards stats={stats} />
      {isDesktop ? (
        <FarmRegistrationTable farms={farms} />
      ) : (
        <FarmRegistrationCardList farms={farms} />
      )}
    </View>
  );

  return isDesktop ? (
    pageContent
  ) : (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">{pageContent}</ScrollView>
    </View>
  );
}
