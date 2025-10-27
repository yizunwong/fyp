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
import {
  Plus,
  Sprout,
  Package,
  ShieldCheck,
  CalendarDays,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import QRModal from "@/components/ui/QRModel";
import FarmerLayout from "@/components/ui/FarmerLayout";
import FarmEmptyState from "@/components/farmer/farm-management/FarmEmptyState";
import { useProduceQuery } from "@/hooks/useProduce";
import { useFarmsQuery } from "@/hooks/useFarm";
import {
  FarmListRespondDto,
  ProduceListResponseDto,
  useAuthControllerProfile,
} from "@/api";
import ProduceFilters from "./components/ProduceFilters";
import ProduceBatchCard from "./components/ProduceBatchCard";
import ProduceEmptyState from "./components/ProduceEmptyState";

type ViewMode = "farm" | "all";

type FarmSummary = {
  id: string;
  name: string;
  location?: string;
  certifications: string[];
  produceCount: number;
  verifiedCount: number;
  lastHarvestDate: string | null;
};

const normalizeCertificationLabel = (label: string) =>
  label
    .split(/[_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const getCertificationStyles = (label: string) => {
  const normalized = label.toLowerCase();

  if (normalized.includes("organic")) {
    return {
      container: "bg-amber-100 border border-amber-200",
      text: "text-amber-700",
    };
  }

  if (normalized.includes("halal")) {
    return {
      container: "bg-blue-100 border border-blue-200",
      text: "text-blue-700",
    };
  }

  if (normalized.includes("gap")) {
    return {
      container: "bg-emerald-100 border border-emerald-200",
      text: "text-emerald-700",
    };
  }

  return {
    container: "bg-lime-100 border border-lime-200",
    text: "text-lime-700",
  };
};

const extractCertifications = (
  documents: FarmListRespondDto["documents"]
): string[] => {
  if (!documents || typeof documents !== "object") return [];

  const certificationPayload = (
    documents as {
      certifications?: unknown;
    }
  ).certifications;

  const certifications = Array.isArray(certificationPayload)
    ? certificationPayload
    : [];

  const labels = certifications
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as { type?: unknown; otherType?: unknown };
      const type =
        typeof record.type === "string" ? record.type.trim() : undefined;
      const otherType =
        typeof record.otherType === "string"
          ? record.otherType.trim()
          : undefined;

      if (type && type !== "OTHER") {
        return normalizeCertificationLabel(type);
      }

      if (otherType) {
        return normalizeCertificationLabel(otherType);
      }

      return type ? normalizeCertificationLabel(type) : null;
    })
    .filter(
      (value): value is string => typeof value === "string" && value.length > 0
    );

  return Array.from(new Set(labels));
};

const isBatchVerified = (batch: ProduceListResponseDto) => {
  const status = typeof batch.name === "string" ? batch.name.toLowerCase() : "";
  return status === "verified";
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const clampRatio = (value: number) => Math.min(1, Math.max(0, value));

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

  const farms = (farmsData?.data ?? []) as FarmListRespondDto[];
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

        return {
          id: farm.id,
          name: farm.name,
          location: farm.location,
          certifications: extractCertifications(farm.documents),
          produceCount,
          verifiedCount,
          lastHarvestDate: stats?.latestHarvest ?? null,
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

  const renderFarmOverview = () => {
    if (farmSummaries.length === 0) {
      return (
        <View className="mt-6">
          <FarmEmptyState onAddFarm={handleAddFarm} />
        </View>
      );
    }

    return (
      <View
        className={`mt-6 ${
          isDesktop ? "flex-row flex-wrap " : "flex flex-col gap-4"
        }`}
      >
        {farmSummaries.map((farm) => {
          const wrapperStyle: ViewStyle = isDesktop
            ? { width: "50%", paddingHorizontal: 12, marginBottom: 24 }
            : { width: "100%", marginBottom: 16 };

          const verifiedRatio =
            farm.produceCount > 0
              ? clampRatio(farm.verifiedCount / farm.produceCount)
              : 0;

          const progressWidth = `${Math.round(verifiedRatio * 100)}%`;
          const formattedHarvestDate = formatDate(farm.lastHarvestDate);

          return (
            <View key={farm.id} style={wrapperStyle}>
              <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md hover:border-emerald-200">
                <View className="flex-row items-start justify-between gap-4">
                  <View className="flex-row items-start gap-3">
                    <View className="w-12 h-12 rounded-xl bg-emerald-50 items-center justify-center">
                      <Sprout color="#047857" size={24} />
                    </View>
                    <View>
                      <Text className="text-gray-900 text-xl font-semibold">
                        {farm.name}
                      </Text>
                      <Text className="text-gray-500 text-xs mt-1">
                        ID: {farm.id}
                      </Text>
                      {farm.location ? (
                        <Text className="text-gray-500 text-xs mt-1">
                          {farm.location}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  <View className="flex-row flex-wrap justify-end gap-2 max-w-[180px]">
                    {farm.certifications.length > 0 ? (
                      farm.certifications.map((certification) => {
                        const styles = getCertificationStyles(certification);
                        return (
                          <View
                            key={certification}
                            className={`px-3 py-1 rounded-full ${styles.container}`}
                          >
                            <Text
                              className={`text-xs font-semibold ${styles.text}`}
                            >
                              {certification}
                            </Text>
                          </View>
                        );
                      })
                    ) : (
                      <View className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200">
                        <Text className="text-xs font-semibold text-gray-500">
                          No Certifications
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View className="mt-5 flex-row flex-wrap gap-4">
                  <View className="flex-row items-center gap-3 flex-1 min-w-[140px]">
                    <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center">
                      <Package color="#047857" size={18} />
                    </View>
                    <View>
                      <Text className="text-xs font-semibold uppercase text-gray-500">
                        Total Produce
                      </Text>
                      <Text className="text-gray-900 text-lg font-bold mt-1">
                        {farm.produceCount}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-3 flex-1 min-w-[140px]">
                    <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center">
                      <ShieldCheck color="#047857" size={18} />
                    </View>
                    <View>
                      <Text className="text-xs font-semibold uppercase text-gray-500">
                        Verified
                      </Text>
                      <Text className="text-gray-900 text-lg font-bold mt-1">
                        {farm.verifiedCount}
                      </Text>
                    </View>
                  </View>
                  {formattedHarvestDate ? (
                    <View className="flex-row items-center gap-3 flex-shrink-0">
                      <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center">
                        <CalendarDays color="#047857" size={18} />
                      </View>
                      <View>
                        <Text className="text-xs font-semibold uppercase text-gray-500">
                          Last Harvest
                        </Text>
                        <Text className="text-gray-900 text-sm font-medium mt-1">
                          {formattedHarvestDate}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                </View>

                <View className="mt-4">
                  <View className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                    <View
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: progressWidth }}
                    />
                  </View>
                  <Text className="text-[11px] text-gray-500 mt-2">
                    {farm.verifiedCount} of {farm.produceCount} batches verified
                  </Text>
                </View>

                <View className="mt-5 flex-row justify-end">
                  <TouchableOpacity
                    onPress={() => handleViewFarmProduce(farm.id)}
                    className="rounded-full overflow-hidden"
                  >
                    <LinearGradient
                      colors={["#22c55e", "#059669"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="flex-row items-center gap-2 px-4 py-2"
                    >
                      <Text className="text-white text-base">
                        {"\uD83C\uDF3E"}
                      </Text>
                      <Text className="text-white text-sm font-semibold">
                        View Produce
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderAllProduce = () => (
    <View className="mt-6 space-y-4">
      <ProduceFilters
        isDesktop={isDesktop}
        searchQuery={searchQuery}
        onSearchChange={(value) => setSearchQuery(value)}
        farms={farmOptions}
        selectedFarm={selectedFarm}
        onSelectFarm={(value) => setSelectedFarm(value)}
        showVerifiedOnly={showVerifiedOnly}
        onToggleVerified={() => setShowVerifiedOnly((prev) => !prev)}
      />
      {filteredBatches.length === 0 ? (
        <ProduceEmptyState
          onAddProduce={() => router.push("/dashboard/farmer/add-produce")}
        />
      ) : (
        filteredBatches.map((batch) => (
          <ProduceBatchCard
            key={batch.id}
            batch={batch}
            onViewDetails={handleViewDetails}
            onViewQR={handleViewQR}
          />
        ))
      )}
    </View>
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
            <View className="bg-white border border-emerald-100 rounded-full p-1 flex-row gap-2 shadow-sm">
              <TouchableOpacity
                onPress={() => setActiveView("farm")}
                className="flex-1 rounded-full"
                activeOpacity={0.9}
              >
                {activeView === "farm" ? (
                  <LinearGradient
                    colors={["#22c55e", "#059669"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="flex-row items-center justify-center gap-2 rounded-full px-4 py-2 shadow"
                  >
                    <Text className="text-white text-base">
                      {"\uD83C\uDF3E"}
                    </Text>
                    <Text className="text-white text-sm font-semibold">
                      By Farm
                    </Text>
                  </LinearGradient>
                ) : (
                  <View className="flex-row items-center justify-center gap-2 rounded-full px-4 py-2 bg-white border border-emerald-100 shadow-sm">
                    <Text className="text-base">{"\uD83C\uDF3E"}</Text>
                    <Text className="text-gray-600 text-sm font-semibold">
                      By Farm
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveView("all")}
                className="flex-1 rounded-full"
                activeOpacity={0.9}
              >
                {activeView === "all" ? (
                  <LinearGradient
                    colors={["#22c55e", "#059669"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="flex-row items-center justify-center gap-2 rounded-full px-4 py-2 shadow"
                  >
                    <Text className="text-white text-base">
                      {"\uD83C\uDF45"}
                    </Text>
                    <Text className="text-white text-sm font-semibold">
                      All Produce
                    </Text>
                  </LinearGradient>
                ) : (
                  <View className="flex-row items-center justify-center gap-2 rounded-full px-4 py-2 bg-white border border-emerald-100 shadow-sm">
                    <Text className="text-base">{"\uD83C\uDF45"}</Text>
                    <Text className="text-gray-600 text-sm font-semibold">
                      All Produce
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
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
