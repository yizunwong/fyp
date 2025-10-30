import { useState } from "react";
import { View } from "react-native";
import type { ProduceListResponseDto } from "@/api";
import ProduceFilters from "@/components/farmer/produce/ProduceFilters";
import type {
  SortOption,
  StatusFilter,
} from "@/components/farmer/farm-produce/types";
import ProduceBatchCard from "./ProduceBatchCard";
import { EmptyState } from "@/components/ui/EmptyState";
import ProduceDetailModal from "../farm-produce/ProduceDetailModal";

type AllProduceSectionProps = {
  isDesktop: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  sortOption: SortOption;
  onSortChange: (value: SortOption) => void;
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
      />
      {filteredBatches.length === 0 ? (
        <EmptyState
          title="No Produce Found"
          subtitle="Try adjusting your search or filter criteria"
          onActionPress={onAddProduce}
        />
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
