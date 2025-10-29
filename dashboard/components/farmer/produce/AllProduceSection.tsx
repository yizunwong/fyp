import { View } from "react-native";
import type { ProduceListResponseDto } from "@/api";
import ProduceFilters from "./ProduceFilters";
import ProduceBatchCard from "./ProduceBatchCard";
import { EmptyState } from '@/components/ui/EmptyState';

type FarmOption = {
  id: string;
  name: string;
};

type AllProduceSectionProps = {
  isDesktop: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  farms: FarmOption[];
  selectedFarm: string;
  onSelectFarm: (value: string) => void;
  showVerifiedOnly: boolean;
  onToggleVerified: () => void;
  filteredBatches: ProduceListResponseDto[];
  onViewDetails: (batch: ProduceListResponseDto) => void;
  onViewQR: (batch: ProduceListResponseDto) => void;
  onAddProduce: () => void;
};

export default function AllProduceSection({
  isDesktop,
  searchQuery,
  onSearchChange,
  farms,
  selectedFarm,
  onSelectFarm,
  showVerifiedOnly,
  onToggleVerified,
  filteredBatches,
  onViewDetails,
  onViewQR,
  onAddProduce,
}: AllProduceSectionProps) {
  return (
    <View className="mt-6 space-y-6">
      <ProduceFilters
        isDesktop={isDesktop}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        farms={farms}
        selectedFarm={selectedFarm}
        onSelectFarm={onSelectFarm}
        showVerifiedOnly={showVerifiedOnly}
        onToggleVerified={onToggleVerified}
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
                onViewDetails={onViewDetails}
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
              onViewDetails={onViewDetails}
              onViewQR={onViewQR}
            />
          ))}
        </View>
      )}
    </View>
  );
}
