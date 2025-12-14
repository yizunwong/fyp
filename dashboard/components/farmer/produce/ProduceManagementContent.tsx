import React from "react";
import { View } from "react-native";
import QRModal from "@/components/ui/QRModel";
import {
  FarmOverviewSection,
  AllProduceSection,
  ProduceViewToggle,
} from "@/components/farmer/produce";
import { ProduceListResponseDto } from "@/api";
import { FarmSummary } from "@/components/farmer/produce/FarmOverviewSection";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Sprout } from "lucide-react-native";
import type { SortOption, StatusFilter } from "@/components/farmer/farm-produce/types";

export interface ProduceManagementContentProps {
  isDesktop: boolean;
  isWeb: boolean;
  isLoading: boolean;
  hasError: boolean;
  farmSummaries: FarmSummary[];
  filteredBatches: ProduceListResponseDto[];
  activeView: "farm" | "all";
  searchQuery: string;
  statusFilter: StatusFilter;
  sortOption: SortOption;
  showFilters: boolean;
  harvestFrom: string;
  harvestTo: string;
  normalizedHarvestFrom?: string;
  normalizedHarvestTo?: string;
  showQRModal: boolean;
  selectedBatch: ProduceListResponseDto | null;
  onChangeView: (view: "farm" | "all") => void;
  onSearchChange: (q: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onSortChange: (value: SortOption) => void;
  onToggleFilters: () => void;
  onHarvestFromChange: (value: string) => void;
  onHarvestToChange: (value: string) => void;
  onClearHarvestFrom: () => void;
  onClearHarvestTo: () => void;
  onClearStatusFilter: () => void;
  onAddFarm: () => void;
  onAddProduce: () => void;
  onViewFarmProduce: (id: string) => void;
  onViewQR: (batch: ProduceListResponseDto) => void;
  onCloseQR: () => void;
  onRetry?: () => void;
}

export default function ProduceManagementContent({
  isDesktop,
  isWeb,
  isLoading,
  hasError,
  farmSummaries,
  filteredBatches,
  activeView,
  searchQuery,
  statusFilter,
  sortOption,
  showFilters,
  harvestFrom,
  harvestTo,
  normalizedHarvestFrom,
  normalizedHarvestTo,
  showQRModal,
  selectedBatch,
  onChangeView,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onToggleFilters,
  onHarvestFromChange,
  onHarvestToChange,
  onClearHarvestFrom,
  onClearHarvestTo,
  onClearStatusFilter,
  onAddFarm,
  onAddProduce,
  onViewFarmProduce,
  onViewQR,
  onCloseQR,
  onRetry,
}: ProduceManagementContentProps) {
  const toggleStickyStyle = isWeb
    ? ({
        position: "sticky",
        top: 0,
        zIndex: 30,
      } as const)
    : undefined;

  return (
    <View className="px-6 py-6 flex-1 bg-gray-50">
      {hasError && (
        <ErrorState
          message="Failed to load produce records. Please try again later."
          onRetry={onRetry}
        />
      )}

      {!hasError && (
        <>
          <View style={toggleStickyStyle} className="pb-4 bg-gray-50">
            <ProduceViewToggle activeView={activeView} onChange={onChangeView} />
          </View>

          {activeView === "farm" ? (
            <>
              {isLoading ? (
                <LoadingState message="Loading your produce batches..." />
              ) : (
                <FarmOverviewSection
                  farmSummaries={farmSummaries}
                  isDesktop={isDesktop}
                  onAddFarm={onAddFarm}
                  onViewFarmProduce={onViewFarmProduce}
                />
              )}
            </>
          ) : (
            <AllProduceSection
              isDesktop={isDesktop}
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              statusFilter={statusFilter}
              onStatusChange={onStatusChange}
              sortOption={sortOption}
              onSortChange={onSortChange}
              isLoading={isLoading}
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
              filteredBatches={filteredBatches}
              onViewQR={onViewQR}
              onAddProduce={onAddProduce}
            />
          )}

          {!isLoading && filteredBatches.length === 0 && activeView === "all" && (
            <EmptyState
              title="No Produce Records"
              subtitle="Start recording your first harvest to enable blockchain verification and supply tracking."
              icon={<Sprout color="#047857" size={28} />}
              actionLabel="Add Produce"
              onActionPress={onAddProduce}
            />
          )}
        </>
      )}

      {selectedBatch && (
        <QRModal
          visible={showQRModal}
          onClose={onCloseQR}
          batchId={selectedBatch.id}
          qrCodeUrl={selectedBatch.qrCode?.imageUrl || ""}
          blockchainTxHash={selectedBatch.blockchainTx}
        />
      )}
    </View>
  );
}
