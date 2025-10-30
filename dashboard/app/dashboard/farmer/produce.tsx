import { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react-native";
import { router } from "expo-router";
import { useProduceQuery } from "@/hooks/useProduce";
import { useFarmsQuery } from "@/hooks/useFarm";
import {
  FarmListRespondDto,
  ProduceListResponseDto,
  useAuthControllerProfile,
} from "@/api";
import { isBatchVerified, extractCertifications } from "@/utils/farm";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useFarmerLayout } from "@/components/farmer/layout/FarmerLayoutContext";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { RightHeaderButton } from "@/components/ui/RightHeaderButton";
import { FarmSummary } from "@/components/farmer/produce/FarmOverviewSection";
import { ViewMode } from "@/components/farmer/produce/ProduceViewToggle";
import ProduceManagementContent from "@/components/farmer/produce/ProduceManagementContent";
import type {
  SortOption,
  StatusFilter,
} from "@/components/farmer/farm-produce/types";

export default function ProduceManagementScreen() {
  const { isDesktop, isWeb } = useResponsiveLayout();

  const [activeView, setActiveView] = useState<ViewMode>("farm");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("harvest_desc");
  const [selectedBatch, setSelectedBatch] =
    useState<ProduceListResponseDto | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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

  const farms = useMemo(
    () => (farmsData?.data ?? []) as FarmListRespondDto[],
    [farmsData]
  );
  const produceBatches = useMemo(
    () => produceData?.data || [],
    [produceData?.data]
  );

  const filteredBatches = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let filtered = produceBatches.filter((batch) => {
      if (!query) return true;
      const batchId = batch.batchId?.toLowerCase() ?? "";
      const name = batch.name?.toLowerCase() ?? "";
      return batchId.includes(query) || name.includes(query);
    });

    if (statusFilter !== "all") {
      const normalizedStatus = statusFilter.toLowerCase();
      filtered = filtered.filter((batch) => {
        if (normalizedStatus === "verified") {
          return isBatchVerified(batch);
        }
        const statusValue = (
          (batch as { status?: string }).status ?? ""
        ).toLowerCase();

        if (normalizedStatus === "pending") {
          return ["pending", "processing"].includes(statusValue);
        }

        if (normalizedStatus === "failed") {
          return ["failed", "rejected"].includes(statusValue);
        }

        return true;
      });
    }

    const sortable = [...filtered];
    sortable.sort((a, b) => {
      const aTime = a.harvestDate ? new Date(a.harvestDate).getTime() : 0;
      const bTime = b.harvestDate ? new Date(b.harvestDate).getTime() : 0;
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
  }, [produceBatches, searchQuery, statusFilter, sortOption]);

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
      if (isBatchVerified(batch)) current.verified += 1;

      if (batch.harvestDate) {
        const incoming = new Date(batch.harvestDate);
        const existing = current.latestHarvest
          ? new Date(current.latestHarvest)
          : null;
        if (!existing || incoming > existing) {
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

  const handleAddProduce = useCallback(() => {
    router.push("/dashboard/farmer/add-produce");
  }, []);

  const handleAddFarm = useCallback(() => {
    router.push("/dashboard/farmer/register-farm");
  }, []);

  const handleViewFarmProduce = useCallback((farmId: string) => {
    router.push({
      pathname: "/dashboard/farmer/farm/[farmId]/produce",
      params: { farmId },
    });
  }, []);

  const handleViewQR = (batch: ProduceListResponseDto) => {
    setSelectedBatch(batch);
    setShowQRModal(true);
  };

  const handleCloseQR = () => {
    setSelectedBatch(null);
    setShowQRModal(false);
  };

  const layoutMeta = useMemo(
    () => ({
      title: "My Produce Batches",
      subtitle:
        "Manage your harvest records and blockchain verification status",
      rightHeaderButton: isDesktop ? (
        <RightHeaderButton
          onPress={handleAddProduce}
          label="Add Produce"
          icon={<Plus color="#fff" />}
        />
      ) : undefined,
      mobile: {
        floatingAction: (
          <FloatingActionButton
            onPress={handleAddProduce}
            icon={<Plus color="#fff" size={18} />}
          />
        ),
      },
    }),
    [handleAddProduce, isDesktop]
  );

  useFarmerLayout(layoutMeta);

  const isLoading = isProducing || isFarming;
  const hasError = !!(produceError || farmError);

  const handleViewDetails = (batch: ProduceListResponseDto) => {
    setSelectedBatch(batch);
    setShowDetailsModal(true);
  };

  return (
    <>
      <ProduceManagementContent
        isDesktop={isDesktop}
        isWeb={isWeb}
        isLoading={isLoading}
        hasError={hasError}
        farmSummaries={farmSummaries}
        filteredBatches={filteredBatches}
        activeView={activeView}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        sortOption={sortOption}
        selectedBatch={selectedBatch}
        showQRModal={showQRModal}
        onChangeView={setActiveView}
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
        onSortChange={setSortOption}
        onAddFarm={handleAddFarm}
        onAddProduce={handleAddProduce}
        onViewFarmProduce={handleViewFarmProduce}
        onViewQR={handleViewQR}
        onCloseQR={handleCloseQR}
        onViewDetails={handleViewDetails}
      />
    </>
  );
}
