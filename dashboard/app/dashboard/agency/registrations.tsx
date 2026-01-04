import { useMemo, useState } from "react";
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
import { useFarmVerificationStats } from "@/hooks/useDashboard";
import FarmFiltersComponent, {
  FarmStatusFilter,
  FarmSizeUnitFilter,
} from "@/components/farmer/farm-management/FarmFilters";
import type { FarmControllerListPendingFarmsParams } from "@/api";

export default function FarmRegistrationReviewScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;

  useAgencyLayout({
    title: "Farm Registration Verification",
    subtitle: "Validate and approve farm registrations",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FarmStatusFilter>("all");
  const [category, setCategory] = useState("");
  const [minSize, setMinSize] = useState("");
  const [maxSize, setMaxSize] = useState("");
  const [sizeUnit, setSizeUnit] = useState<FarmSizeUnitFilter>("ALL");
  const [showFilters, setShowFilters] = useState(false);

  const pendingFarmQueryParams =
    useMemo<FarmControllerListPendingFarmsParams>(() => {
      const params: FarmControllerListPendingFarmsParams = {};

      const trimmedSearch = searchQuery.trim();
      if (trimmedSearch) {
        params.name = trimmedSearch;
        params.location = trimmedSearch;
      }

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const trimmedCategory = category.trim();
      if (trimmedCategory) {
        params.category = trimmedCategory;
      }

      const parsedMin = parseFloat(minSize);
      if (!Number.isNaN(parsedMin)) {
        params.minSize = parsedMin;
      }

      const parsedMax = parseFloat(maxSize);
      if (!Number.isNaN(parsedMax)) {
        params.maxSize = parsedMax;
      }

      if (sizeUnit !== "ALL") {
        params.sizeUnit = sizeUnit;
      }

      return params;
    }, [category, maxSize, minSize, searchQuery, sizeUnit, statusFilter]);

  const { error, isLoading, isFetching, refetch, farms } = usePendingFarmsQuery(
    pendingFarmQueryParams
  );

  const {
    stats: verificationStats,
    error: statsError,
    isLoading: isStatsLoading,
  } = useFarmVerificationStats();

  const stats = useMemo<FarmRegistrationStats>(
    () =>
      verificationStats ?? {
        pending: 0,
        verified: 0,
        rejected: 0,
        documents: 0,
      },
    [verificationStats]
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-700 mt-3">Loading registrations...</Text>
      </View>
    );
  }

  if (error || statsError) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-gray-900 text-xl font-bold mb-2">
          Failed to load registrations
        </Text>
        <Text className="text-gray-600 text-sm mb-4">
          {(error || statsError) as string}
        </Text>
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
      <FarmRegistrationPageHeader
        isFetching={isFetching || isStatsLoading}
        onRefresh={refetch}
      />
      <FarmRegistrationSummaryCards stats={stats} />
      <FarmFiltersComponent
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
        category={category}
        onCategoryChange={setCategory}
        sizeUnit={sizeUnit}
        onSizeUnitChange={setSizeUnit}
        minSize={minSize}
        maxSize={maxSize}
        onMinSizeChange={setMinSize}
        onMaxSizeChange={setMaxSize}
        onClearStatusFilter={() => setStatusFilter("all")}
        onClearCategory={() => setCategory("")}
        onClearSizeRange={() => {
          setMinSize("");
          setMaxSize("");
        }}
        onClearSizeUnit={() => setSizeUnit("ALL")}
      />
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
