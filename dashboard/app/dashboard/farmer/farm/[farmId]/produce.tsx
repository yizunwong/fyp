import { useCallback, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import QRModal from "@/components/ui/QRModel";
import {
  FarmProduceBatchList,
  ProduceDetailModal,
  ProduceFilters,
  FarmProduceSummaryCard,
  getQrCodeUrl,
  type FarmProduceStats,
  type SortOption,
  type StatusFilter,
} from "@/components/farmer/farm-produce";
import {
  useAuthControllerProfile,
  type ProduceListResponseDto,
} from "@/api";
import { useFarmQuery } from "@/hooks/useFarm";
import { extractCertifications } from "@/utils/farm";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useFarmerLayout } from "@/components/farmer/layout/FarmerLayoutContext";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { View } from "react-native";

export default function FarmProducePage() {
  const router = useRouter();
  const { isDesktop } = useResponsiveLayout();
  const params = useLocalSearchParams<{ farmId?: string }>();
  const farmId = params?.farmId ?? "";

  const {
    data: farmResponse,
    isLoading: isFarmLoading,
    error: farmError,
    refetch: refetchFarm,
  } = useFarmQuery(farmId);

  const farm = farmResponse?.data;
  const farmProduces = useMemo(() => farm?.produces ?? [], [farm?.produces]);
  const farmName = farm?.name ?? null;

  const shouldFetchFarm = Boolean(farmId);
  const isLoading = (shouldFetchFarm && isFarmLoading && !farm);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("harvest_desc");
  const [qrBatch, setQrBatch] = useState<ProduceListResponseDto | null>(null);
  const [detailBatch, setDetailBatch] = useState<ProduceListResponseDto | null>(
    null
  );

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
        if (!Number.isNaN(current.getTime()) && (!latest || current > latest)) {
          latest = current;
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
      lastHarvestDate: latest?.toISOString() ?? null,
    };
  }, [farmProduces]);

  const filteredBatches = useMemo(() => {
    const searchValue = searchQuery.trim().toLowerCase();
    let batches = farmProduces.filter((batch) => {
      if (!searchValue) return true;
      const nameMatch = batch.name?.toLowerCase().includes(searchValue);
      const batchIdMatch = batch.batchId?.toLowerCase().includes(searchValue);
      return nameMatch || batchIdMatch;
    });

    if (statusFilter !== "all") {
      const normalizedStatus = statusFilter.toLowerCase();
      batches = batches.filter((batch) => {
        const statusValue = (
          (batch as { status?: string }).status ??
          batch.name ??
          ""
        ).toLowerCase();
        if (normalizedStatus === "verified") return statusValue === "verified";
        if (normalizedStatus === "pending")
          return ["pending", "processing"].includes(statusValue);
        if (normalizedStatus === "failed")
          return ["failed", "rejected"].includes(statusValue);
        return true;
      });
    }

    const sortable = [...batches];
    sortable.sort((a, b) => {
      const aTime = new Date(a.harvestDate).getTime();
      const bTime = new Date(b.harvestDate).getTime();
      const aQuantity = a.quantity ?? 0;
      const bQuantity = b.quantity ?? 0;
      switch (sortOption) {
        case "harvest_asc":
          return aTime - bTime;
        case "harvest_desc":
          return bTime - aTime;
        case "quantity_desc":
          return bQuantity - aQuantity;
        case "quantity_asc":
        default:
          return aQuantity - bQuantity;
      }
    });

    return sortable;
  }, [farmProduces, searchQuery, statusFilter, sortOption]);

  const handleViewQR = (batch: ProduceListResponseDto) => setQrBatch(batch);
  const handleViewDetails = (batch: ProduceListResponseDto) =>
    setDetailBatch(batch);
  const handleCloseQR = () => setQrBatch(null);
  const handleCloseDetails = () => setDetailBatch(null);
  const handleAddProduce = useCallback(
    () =>
      router.push({
        pathname: "/dashboard/farmer/add-produce",
        params: { farmId },
      }),
    [farmId, router]
  );

  const layoutMeta = useMemo(
    () => ({
      title: farmName ? `${farmName} Produce` : "Farm Produce Batches",
      subtitle:
        "Monitor harvest records and blockchain verification for this farm",
    }),
    [farmName]
  );

  useFarmerLayout(layoutMeta);

  return (
    <>
      {!farmId ? (
        <ErrorState
          message="Failed to load farm details. Please try again later."
          onRetry={() => refetchFarm()}
        />
      ) : isLoading ? (
        <LoadingState message="Loading " />
      ) : farmError ? (
        <ErrorState
          message="Failed to load farm details. Please try again later."
          onRetry={() => refetchFarm()}
        />
      ) : !farm ? (
        <ErrorState
          message="Failed to load farm details. Please try again later."
          onRetry={() => refetchFarm()}
        />
      ) : (
        <View className={isDesktop ? "flex-1 bg-gray-50" : ""}>
          <View className={isDesktop ? "w-full px-6 lg:px-8 py-6" : "gap-6"}>
            <FarmProduceSummaryCard
              farm={farm}
              farmId={farmId}
              isDesktop={isDesktop}
              certifications={certifications}
              stats={derivedStats}
            />

            <View className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <ProduceFilters
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
          </View>
        </View>
      )}

      <QRModal
        visible={Boolean(qrBatch)}
        onClose={handleCloseQR}
        batchId={qrBatch?.batchId ?? ""}
        qrCodeUrl={qrBatch?.qrCode?.imageUrl ?? ""}
        blockchainTxHash={qrBatch?.blockchainTx}
      />

      <ProduceDetailModal
        batch={detailBatch}
        onClose={handleCloseDetails}
      />
    </>
  );
}
