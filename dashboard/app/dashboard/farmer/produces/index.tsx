import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react-native";
import { router } from "expo-router";
import { useProduceQuery } from "@/hooks/useProduce";
import { useFarmsQuery } from "@/hooks/useFarm";
import {
  FarmerControllerFindProducesParams,
  FarmListRespondDto,
  ProduceListResponseDto,
} from "@/api";
import { formatFarmLocation } from "@/utils/farm";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { RightHeaderButton } from "@/components/ui/RightHeaderButton";
import { FarmSummary } from "@/components/farmer/produce/FarmOverviewSection";
import { ViewMode } from "@/components/farmer/produce/ProduceViewToggle";
import ProduceManagementContent from "@/components/farmer/produce/ProduceManagementContent";
import type {
  SortOption,
  StatusFilter,
} from "@/components/farmer/farm-produce/types";
import { useAppLayout } from '@/components/layout';

const formatDocumentTypeLabel = (value?: string) => {
  if (!value) return "";
  return value
    .split(/[_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};

const extractFarmDocumentsSummary = (farm: FarmListRespondDto) => {
  const farmDocs = Array.isArray((farm as any).farmDocuments)
    ? ((farm as any).farmDocuments as unknown[])
    : [];
  const docTypes = new Set<string>();

  farmDocs.forEach((doc) => {
    if (doc && typeof (doc as { type?: unknown }).type === "string") {
      docTypes.add(formatDocumentTypeLabel((doc as { type: string }).type));
    }
  });

  const legacyDocs =
    farm && typeof (farm as any).documents === "object"
      ? Array.isArray((farm as any).documents.landDocuments)
        ? ((farm as any).documents.landDocuments as unknown[])
        : []
      : [];

  legacyDocs.forEach((doc) => {
    if (doc && typeof (doc as { type?: unknown }).type === "string") {
      docTypes.add(formatDocumentTypeLabel((doc as { type: string }).type));
    }
  });

  const documentCount = farmDocs.length || legacyDocs.length || 0;

  return {
    documentTypes: Array.from(docTypes),
    documentCount,
  };
};

export default function ProduceManagementScreen() {
  const { isDesktop, isWeb } = useResponsiveLayout();

  const [activeView, setActiveView] = useState<ViewMode>("farm");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("harvest_desc");
  const [showFilters, setShowFilters] = useState(false);
  const [harvestFrom, setHarvestFrom] = useState("");
  const [harvestTo, setHarvestTo] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedBatch, setSelectedBatch] =
    useState<ProduceListResponseDto | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  const normalizedHarvestFrom = useMemo(() => {
    const value = harvestFrom.trim();
    if (!value) return undefined;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  }, [harvestFrom]);

  const normalizedHarvestTo = useMemo(() => {
    const value = harvestTo.trim();
    if (!value) return undefined;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  }, [harvestTo]);

  const produceQueryParams = useMemo<
    FarmerControllerFindProducesParams & { sort?: SortOption }
  >(() => {
    const params: FarmerControllerFindProducesParams =
      {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (statusFilter !== "all") params.status = statusFilter;
    if (normalizedHarvestFrom) params.harvestFrom = normalizedHarvestFrom;
    if (normalizedHarvestTo) params.harvestTo = normalizedHarvestTo;
    if (sortOption) params.sort = sortOption;
    return params;
  }, [
    debouncedSearch,
    statusFilter,
    normalizedHarvestFrom,
    normalizedHarvestTo,
    sortOption,
  ]);

  const {
    produces,
    isLoading: isProducing,
    error: produceError,
  } = useProduceQuery(produceQueryParams);
  const {
    data: farmsData,
    isLoading: isFarming,
    error: farmError,
  } = useFarmsQuery();

  const farms = useMemo(
    () => (farmsData?.data ?? []) as FarmListRespondDto[],
    [farmsData]
  );
  const produceBatches = useMemo(() => produces, [produces]);

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
      if (batch.status === "RETAILER_VERIFIED") current.verified += 1;

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
          location: formatFarmLocation(farm),
          ...extractFarmDocumentsSummary(farm),
          produceCount,
          verifiedCount,
          lastHarvestDate: stats?.latestHarvest ?? null,
          imageUrl,
        };
      }),
    [farms, produceStatsByFarm]
  );

  const handleAddProduce = useCallback(() => {
    router.push("/dashboard/farmer/produces/create");
  }, []);

  const handleAddFarm = useCallback(() => {
    router.push("/dashboard/farmer/farms/create");
  }, []);

  const handleViewFarmProduce = useCallback((farmId: string) => {
    router.push({
      pathname: "/dashboard/farmer/farms/[farmId]/produce",
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

  useAppLayout(layoutMeta);

  const isLoading = isProducing || isFarming;
  const hasError = !!(produceError || farmError);

  return (
    <>
      <ProduceManagementContent
        isDesktop={isDesktop}
        isWeb={isWeb}
        isLoading={isLoading}
        hasError={hasError}
        farmSummaries={farmSummaries}
        filteredBatches={produceBatches}
        activeView={activeView}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        sortOption={sortOption}
        showFilters={showFilters}
        harvestFrom={harvestFrom}
        harvestTo={harvestTo}
        normalizedHarvestFrom={normalizedHarvestFrom}
        normalizedHarvestTo={normalizedHarvestTo}
        showQRModal={showQRModal}
        selectedBatch={selectedBatch}
        onChangeView={setActiveView}
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
        onSortChange={setSortOption}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
        onHarvestFromChange={setHarvestFrom}
        onHarvestToChange={setHarvestTo}
        onClearHarvestFrom={() => setHarvestFrom("")}
        onClearHarvestTo={() => setHarvestTo("")}
        onClearStatusFilter={() => setStatusFilter("all")}
        onAddFarm={handleAddFarm}
        onAddProduce={handleAddProduce}
        onViewFarmProduce={handleViewFarmProduce}
        onViewQR={handleViewQR}
        onCloseQR={handleCloseQR}
      />
    </>
  );
}
