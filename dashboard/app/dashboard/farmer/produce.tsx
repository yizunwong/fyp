import { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
  type ViewStyle,
} from "react-native";
import { Plus } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import QRModal from "@/components/ui/QRModel";
import FarmerLayout from "@/components/ui/FarmerLayout";
import { useProduceQuery } from "@/hooks/useProduce";
import { useFarmsQuery } from "@/hooks/useFarm";
import {
  FarmListRespondDto,
  ProduceListResponseDto,
  useAuthControllerProfile,
} from "@/api";
import { isBatchVerified, extractCertifications } from "@/utils/farm";
import { FarmOverviewSection, AllProduceSection, ProduceViewToggle } from '@/components/farmer/produce';
import { FarmSummary } from '@/components/farmer/produce/FarmOverviewSection';
import { ViewMode } from '@/components/farmer/produce/ProduceViewToggle';

export default function ProduceManagementScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;

  const [activeView, setActiveView] = useState<ViewMode>("farm");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFarm, setSelectedFarm] = useState<string>("all");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [selectedBatch, setSelectedBatch] =
    useState<ProduceListResponseDto | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [, setShowDetailsModal] = useState(false);
  const { data: profileData } = useAuthControllerProfile();
  const farmerId = profileData?.data?.id;

  const {
    data: produceData,
    isLoading: isProducing,
    error: produceError,
  } = useProduceQuery(farmerId || "");

  const {
    data: farmsData,
    isLoading: isFarming,
    error: farmError,
  } = useFarmsQuery(farmerId || "");

  const farms = useMemo(() => {
    return (farmsData?.data ?? []) as FarmListRespondDto[];
  }, [farmsData]);
  const produceBatches = useMemo<ProduceListResponseDto[]>(
    () => produceData?.data || [],
    [produceData?.data]
  );

  const farmOptions = useMemo(
    () => farms.map((farm) => ({ id: farm.id, name: farm.name })),
    [farms]
  );

  const filteredBatches = useMemo(() => {
    if (!produceBatches) return [];

    let filtered = [...produceBatches];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (batch) =>
          batch.batchId.toLowerCase().includes(query) ||
          batch.name.toLowerCase().includes(query)
      );
    }

    if (selectedFarm !== "all") {
      filtered = filtered.filter((batch) => batch.farmId === selectedFarm);
    }

    if (showVerifiedOnly) {
      filtered = filtered.filter(isBatchVerified);
    }

    return filtered;
  }, [produceBatches, searchQuery, selectedFarm, showVerifiedOnly]);

  const produceStatsByFarm = useMemo(() => {
    const stats = new Map<
      string,
      { total: number; verified: number; latestHarvest: string | null }
    >();

    produceBatches.forEach((batch) => {
      if (!batch.farmId) return;

      const current = stats.get(batch.farmId) ?? {
        total: 0,
        verified: 0,
        latestHarvest: null,
      };

      current.total += 1;
      if (isBatchVerified(batch)) {
        current.verified += 1;
      }

      if (batch.harvestDate) {
        const currentDate = current.latestHarvest
          ? new Date(current.latestHarvest)
          : null;
        const incomingDate = new Date(batch.harvestDate);
        if (!currentDate || incomingDate > currentDate) {
          current.latestHarvest = batch.harvestDate;
        }
      }

      stats.set(batch.farmId, current);
    });

    return stats;
  }, [produceBatches]);

  const farmSummaries = useMemo<FarmSummary[]>(
    () =>
      farms.map((farm) => {
        const stats = produceStatsByFarm.get(farm.id);

        const produceCount =
          stats?.total ??
          (Array.isArray(farm.produces) ? farm.produces.length : 0);
        const verifiedCount = stats?.verified ?? 0;

        const imageUrl =
          (farm as { imageUrl?: string | null }).imageUrl ??
          (farm as { image_url?: string | null }).image_url ??
          null;

        return {
          id: farm.id,
          name: farm.name,
          location: farm.location,
          certifications: extractCertifications(farm.documents),
          produceCount,
          verifiedCount,
          lastHarvestDate: stats?.latestHarvest ?? null,
          imageUrl,
        };
      }),
    [farms, produceStatsByFarm]
  );

  const handleViewQR = (batch: ProduceListResponseDto) => {
    setSelectedBatch(batch);
    setShowQRModal(true);
  };

  const handleViewDetails = (batch: ProduceListResponseDto) => {
    setSelectedBatch(batch);
    setShowDetailsModal(true);
  };

  // ==============================
  // MAIN RENDER
  // ==============================
  const isLoading = isProducing || isFarming;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#059669" />
        <Text className="mt-3 text-gray-600">Loading your produce...</Text>
      </View>
    );
  }

  if (produceError || farmError) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-8">
        <Text className="text-red-600 font-semibold mb-2">
          Error loading data
        </Text>
        <Text className="text-gray-600 text-center mb-4">
          Please check your network connection or try again later.
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/dashboard/farmer")}
          className="bg-emerald-600 px-5 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleAddFarm = () => {
    router.push("/dashboard/farmer/register-farm");
  };

  const handleViewFarmProduce = (farmId: string) => {
    router.push({
      pathname: "/dashboard/farmer/farm/[farmId]/produce",
      params: { farmId },
    });
  };

  const renderFarmOverview = () => (
    <FarmOverviewSection
      farmSummaries={farmSummaries}
      isDesktop={isDesktop}
      onAddFarm={handleAddFarm}
      onViewFarmProduce={handleViewFarmProduce}
    />
  );

  const renderAllProduce = () => (
    <AllProduceSection
      isDesktop={isDesktop}
      searchQuery={searchQuery}
      onSearchChange={(value) => setSearchQuery(value)}
      farms={farmOptions}
      selectedFarm={selectedFarm}
      onSelectFarm={(value) => setSelectedFarm(value)}
      showVerifiedOnly={showVerifiedOnly}
      onToggleVerified={() => setShowVerifiedOnly((prev) => !prev)}
      filteredBatches={filteredBatches}
      onViewDetails={handleViewDetails}
      onViewQR={handleViewQR}
      onAddProduce={() => router.push("/dashboard/farmer/add-produce")}
    />
  );
  const containerStyle: ViewStyle | undefined = isDesktop
    ? { width: "100%", alignSelf: "center" }
    : undefined;

  const toggleStickyStyle: ViewStyle | undefined = isWeb
    ? ({
        position: "sticky",
        top: 0,
        zIndex: 30,
      } as unknown as ViewStyle)
    : undefined;

  return (
    <FarmerLayout
      headerTitle="My Produce Batches"
      headerSubtitle="Manage your harvest records and blockchain verification status"
      rightHeaderButton={
        <TouchableOpacity
          onPress={() => router.push("/dashboard/farmer/add-produce")}
          className="rounded-lg overflow-hidden"
        >
          <LinearGradient
            colors={["#22c55e", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-row items-center gap-2 px-5 py-3"
          >
            <Plus color="#fff" size={20} />
            <Text className="text-white text-[15px] font-semibold">
              Add Produce
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      }
    >
      <View className="flex-1 bg-gray-50">
        <View
          style={containerStyle}
          className="w-full px-4 sm:px-6 lg:px-8 py-6"
        >
          <View style={toggleStickyStyle} className="pb-4 bg-gray-50">
            <ProduceViewToggle
              activeView={activeView}
              onChange={(view) => setActiveView(view)}
            />
          </View>

          {activeView === "farm" ? renderFarmOverview() : renderAllProduce()}
        </View>
      </View>
      {selectedBatch && (
        <QRModal
          visible={showQRModal}
          onClose={() => {
            setShowQRModal(false);
            setSelectedBatch(null);
          }}
          batchId={selectedBatch.id}
          qrCodeUrl={selectedBatch.unit || ""}
          blockchainTxHash={selectedBatch.blockchainTx}
        />
      )}
    </FarmerLayout>
  );
}
