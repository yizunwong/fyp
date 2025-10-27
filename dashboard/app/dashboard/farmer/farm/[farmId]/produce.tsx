import { JSX, useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import FarmerLayout from "@/components/ui/FarmerLayout";
import QRModal from "@/components/ui/QRModel";
import {
  FarmProduceBatchList,
  FarmProduceDetailModal,
  FarmProduceErrorState,
  FarmProduceFilters,
  FarmProduceLoadingState,
  FarmProduceMissingFarmState,
  FarmProduceSummaryCard,
  getQrCodeUrl,
  type FarmProduceStats,
  type SortOption,
  type StatusFilter,
} from "@/components/farmer/farm-produce";
import {
  useAuthControllerProfile,
  type FarmDetailResponseDto,
  type ProduceListResponseDto,
} from "@/api";
import { useFarmQuery } from "@/hooks/useFarm";
import { extractCertifications } from "@/utils/farm";
import { parseError } from "@/utils/format-error";

export default function FarmProducePage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;
  const params = useLocalSearchParams<{ farmId?: string }>();
  const rawFarmId = Array.isArray(params.farmId)
    ? params.farmId[0]
    : params.farmId;
  const farmId = rawFarmId ?? "";

  const {
    data: profileData,
    isLoading: isProfileLoading,
  } = useAuthControllerProfile();
  const farmerId = profileData?.data?.id ?? "";

  const {
    data: farmResponse,
    isLoading: isFarmLoading,
    error: farmError,
    refetch: refetchFarm,
  } = useFarmQuery(farmerId, farmId);

  const farm = farmResponse?.data as FarmDetailResponseDto | undefined;
  const farmProduces = farm?.produces ?? [];

  const isFarmerReady = Boolean(farmerId);
  const shouldFetchFarm = Boolean(farmId && isFarmerReady);
  const isLoading =
    isProfileLoading || (shouldFetchFarm && isFarmLoading && !farm);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("harvest_desc");
  const [qrBatch, setQrBatch] = useState<ProduceListResponseDto | null>(null);
  const [detailBatch, setDetailBatch] =
    useState<ProduceListResponseDto | null>(null);

  const certifications = useMemo(
    () => (farm ? extractCertifications(farm.documents) : []),
    [farm]
  );

  const derivedStats = useMemo<FarmProduceStats>(() => {
    if (!farmProduces.length) {
      return {
        total: 0,
        verified: 0,
        verifiedPercentage: 0,
        lastHarvestDate: null,
      };
    }

    let verified = 0;
    let latest: Date | null = null;

    for (const batch of farmProduces) {
      if (batch.harvestDate) {
        const current = new Date(batch.harvestDate);
        if (!Number.isNaN(current.getTime())) {
          if (!latest || current > latest) {
            latest = current;
          }
        }
      }
    }

    const total = farmProduces.length;
    const verifiedPercentage =
      total > 0 ? Math.round((verified / total) * 100) : 0;

    return {
      total,
      verified,
      verifiedPercentage,
      lastHarvestDate: latest ? latest.toISOString() : null,
    };
  }, [farmProduces]);

  const filteredBatches = useMemo(() => {
    const searchValue = searchQuery.trim().toLowerCase();

    let batches = farmProduces.filter((batch) => {
      if (!searchValue) return true;
      const nameMatch = batch.name?.toLowerCase().includes(searchValue);
      const batchIdMatch = batch.batchId
        ?.toLowerCase()
        .includes(searchValue);
      return nameMatch || batchIdMatch;
    });

    const sortable = [...batches];

    sortable.sort((a, b) => {
      switch (sortOption) {
        case "harvest_asc": {
          const aTime = new Date(a.harvestDate).getTime();
          const bTime = new Date(b.harvestDate).getTime();
          return aTime - bTime;
        }
        case "harvest_desc": {
          const aTime = new Date(a.harvestDate).getTime();
          const bTime = new Date(b.harvestDate).getTime();
          return bTime - aTime;
        }
        case "quantity_desc": {
          const aQuantity = a.quantity ?? 0;
          const bQuantity = b.quantity ?? 0;
          return bQuantity - aQuantity;
        }
        case "quantity_asc":
        default: {
          const aQuantity = a.quantity ?? 0;
          const bQuantity = b.quantity ?? 0;
          return aQuantity - bQuantity;
        }
      }
    });

    return sortable;
  }, [farmProduces, searchQuery, statusFilter, sortOption]);

  const handleViewQR = (batch: ProduceListResponseDto) => {
    setQrBatch(batch);
  };

  const handleViewDetails = (batch: ProduceListResponseDto) => {
    setDetailBatch(batch);
  };

  const handleCloseQR = () => setQrBatch(null);
  const handleCloseDetails = () => setDetailBatch(null);

  const handleBack = () => {
    router.push("/dashboard/farmer/produce");
  };

  const handleAddProduce = () => {
    router.push({
      pathname: "/dashboard/farmer/add-produce",
      params: { farmId },
    });
  };

  const renderContent = (): JSX.Element => {
    const layoutChildren = (
      <View className="gap-6">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={handleBack}
            className="flex-row items-center gap-2"
          >
            <ArrowLeft color="#059669" size={18} />
            <Text className="text-emerald-700 text-sm font-semibold">
              Back to Produce Overview
            </Text>
          </TouchableOpacity>
        </View>

        <FarmProduceSummaryCard
          farm={farm}
          farmId={farmId}
          isDesktop={isDesktop}
          certifications={certifications}
          stats={derivedStats}
        />

        <FarmProduceFilters
          isDesktop={isDesktop}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sortOption={sortOption}
          onSortChange={setSortOption}
        />

        <FarmProduceBatchList
          batches={filteredBatches}
          isDesktop={isDesktop}
          onViewDetails={handleViewDetails}
          onViewQR={handleViewQR}
          onAddProduce={handleAddProduce}
        />
      </View>
    );

    if (isDesktop) {
      return (
        <View className="flex-1 bg-gray-50">
          <View className="w-full px-6 lg:px-8 py-6">{layoutChildren}</View>
        </View>
      );
    }

    return (
      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 24,
        }}
      >
        {layoutChildren}
      </ScrollView>
    );
  };

  let content: JSX.Element;

  if (!farmId) {
    content = <FarmProduceMissingFarmState onBack={handleBack} />;
  } else if (isLoading) {
    content = <FarmProduceLoadingState />;
  } else if (farmError) {
    content = (
      <FarmProduceErrorState
        message={
          parseError(farmError) ??
          "An unexpected error occurred while loading farm data."
        }
        onRetry={() => refetchFarm()}
        onBack={handleBack}
      />
    );
  } else if (!farm) {
    content = (
      <FarmProduceErrorState
        message="No farm details were returned. The farm may have been removed."
        onBack={handleBack}
      />
    );
  } else {
    content = renderContent();
  }

  return (
    <FarmerLayout
      headerTitle="Farm Produce Batches"
      headerSubtitle="Monitor harvest records and blockchain verification for this farm"
    >
      {content}

      <QRModal
        visible={Boolean(qrBatch)}
        onClose={handleCloseQR}
        batchId={qrBatch?.batchId ?? ""}
        qrCodeUrl={qrBatch ? getQrCodeUrl(qrBatch) : ""}
        blockchainTxHash={qrBatch?.blockchainTx}
      />

      <FarmProduceDetailModal batch={detailBatch} onClose={handleCloseDetails} />
    </FarmerLayout>
  );
}
