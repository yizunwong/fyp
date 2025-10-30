import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
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
  selectedBatch: ProduceListResponseDto | null;
  showQRModal: boolean;
  onChangeView: (view: "farm" | "all") => void;
  onSearchChange: (q: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onSortChange: (value: SortOption) => void;
  onAddFarm: () => void;
  onAddProduce: () => void;
  onViewFarmProduce: (id: string) => void;
  onViewQR: (batch: ProduceListResponseDto) => void;
  onCloseQR: () => void;
  onViewDetails: (batch: ProduceListResponseDto) => void;
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
  selectedBatch,
  showQRModal,
  onChangeView,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onAddFarm,
  onAddProduce,
  onViewFarmProduce,
  onViewQR,
  onCloseQR,
  onViewDetails,
  onRetry,
}: ProduceManagementContentProps) {
  const hasProduce = filteredBatches && filteredBatches.length > 0;

  const toggleStickyStyle = isWeb
    ? ({
        position: "sticky",
        top: 0,
        zIndex: 30,
      } as const)
    : undefined;

  return (
    <View className="px-6 py-6 flex-1 bg-gray-50">
      {/* ❌ Error */}
      {hasError && (
        <ErrorState
          message="Failed to load produce records. Please try again later."
          onRetry={onRetry}
        />
      )}

      {/* ⏳ Loading */}
      {isLoading && <LoadingState message="Loading your produce batches..." />}

      {/* ✅ Loaded */}
      {!isLoading && !hasError && (
        <>
          {hasProduce ? (
            <>
              {/* Toggle Bar */}
              <View style={toggleStickyStyle} className="pb-4 bg-gray-50">
                <ProduceViewToggle
                  activeView={activeView}
                  onChange={onChangeView}
                />
              </View>

              {/* Main Sections */}
              {activeView === "farm" ? (
                <FarmOverviewSection
                  farmSummaries={farmSummaries}
                  isDesktop={isDesktop}
                  onAddFarm={onAddFarm}
                  onViewFarmProduce={onViewFarmProduce}
                />
              ) : (
                <AllProduceSection
                  isDesktop={isDesktop}
                  searchQuery={searchQuery}
                  onSearchChange={onSearchChange}
                  statusFilter={statusFilter}
                  onStatusChange={onStatusChange}
                  sortOption={sortOption}
                  onSortChange={onSortChange}
                  filteredBatches={filteredBatches}
                  onViewQR={onViewQR}
                  onAddProduce={onAddProduce}
                  onViewDetails={onViewDetails}
                />
              )}
            </>
          ) : (
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

      {/* 🧾 QR Modal */}
      {selectedBatch && (
        <QRModal
          visible={showQRModal}
          onClose={onCloseQR}
          batchId={selectedBatch.id}
          qrCodeUrl={selectedBatch.unit || ""}
          blockchainTxHash={selectedBatch.blockchainTx}
        />
      )}
    </View>
  );
}
