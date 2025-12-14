import { useState } from "react";
import { View } from "react-native";
import type { ProduceListResponseDto } from "@/api";
import ProduceFilters from "@/components/farmer/produce/ProduceFilters";
import type {
  SortOption,
  StatusFilter,
} from "@/components/farmer/farm-produce/types";
import ProduceBatchCard from "./ProduceBatchCard";
import ProduceDetailModal from "../farm-produce/ProduceDetailModal";
import { LoadingState } from "@/components/ui/LoadingState";

type AllProduceSectionProps = {
  isDesktop: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  sortOption: SortOption;
  onSortChange: (value: SortOption) => void;
  isLoading?: boolean;
  showFilters: boolean;
  harvestFrom: string;
  harvestTo: string;
  normalizedHarvestFrom?: string;
  normalizedHarvestTo?: string;
  onToggleFilters: () => void;
  onHarvestFromChange: (value: string) => void;
  onHarvestToChange: (value: string) => void;
  onClearHarvestFrom: () => void;
  onClearHarvestTo: () => void;
  onClearStatusFilter: () => void;
  filteredBatches: ProduceListResponseDto[];
  onViewQR: (batch: ProduceListResponseDto) => void;
  onAddProduce: () => void;
};

export default function AllProduceSection({
  isDesktop,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortOption,
  onSortChange,
  isLoading,
  showFilters,
  harvestFrom,
  harvestTo,
  normalizedHarvestFrom,
  normalizedHarvestTo,
  onToggleFilters,
  onHarvestFromChange,
  onHarvestToChange,
  onClearHarvestFrom,
  onClearHarvestTo,
  onClearStatusFilter,
  filteredBatches,
  onViewQR,
  onAddProduce,
}: AllProduceSectionProps) {
  const [selectedBatch, setSelectedBatch] =
    useState<ProduceListResponseDto | null>(null);

  const handleViewDetails = (batch: ProduceListResponseDto) => {
    setSelectedBatch(batch);
  };

  const handleCloseDetails = () => {
    setSelectedBatch(null);
  };

  return (
    <View className="mt-6 space-y-6">
      <ProduceFilters
        isDesktop={isDesktop}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        statusFilter={statusFilter}
        onStatusChange={onStatusChange}
        sortOption={sortOption}
        onSortChange={onSortChange}
        showFilters={showFilters}
        harvestFrom={harvestFrom}
        harvestTo={harvestTo}
        normalizedHarvestFrom={normalizedHarvestFrom}
        normalizedHarvestTo={normalizedHarvestTo}
        onToggleFilters={onToggleFilters}
        onHarvestFromChange={onHarvestFromChange}
        onHarvestToChange={onHarvestToChange}
        onClearHarvestFrom={onClearHarvestFrom}
        onClearHarvestTo={onClearHarvestTo}
        onClearStatusFilter={onClearStatusFilter}
      />
      {isLoading ? (
        <LoadingState message="Loading your produce batches..." paddingY={40} />
      ) : isDesktop ? (
        <View className="flex-row flex-wrap -mx-2">
          {filteredBatches.map((batch) => (
            <View
              key={batch.id}
              style={{
                width: "33.3333%",
                paddingHorizontal: 8,
                marginBottom: 16,
              }}
            >
              <ProduceBatchCard
                batch={batch}
                onViewDetails={handleViewDetails}
                onViewQR={onViewQR}
              />
            </View>
          ))}
        </View>
      ) : (
        <View className="flex-col gap-4">
          {filteredBatches.map((batch) => (
            <ProduceBatchCard
              key={batch.id}
              batch={batch}
              onViewDetails={handleViewDetails}
              onViewQR={onViewQR}
            />
          ))}
        </View>
      )}

      <ProduceDetailModal batch={selectedBatch} onClose={handleCloseDetails} />
    </View>
  );
}
