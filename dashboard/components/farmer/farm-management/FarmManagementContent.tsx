import { useMemo, useState } from "react";
import { View, TextInput } from "react-native";
import { Search } from "lucide-react-native";
import { Dropdown } from "react-native-paper-dropdown";
import type {
  FarmerControllerFindFarms200AllOf,
  FarmListRespondDtoVerificationStatus,
} from "@/api";
import FarmCards from "./FarmCards";
import FarmTable from "./FarmTable";
import { Sprout } from 'lucide-react-native';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import {
  DropDownInput,
  DropdownItem,
  dropdownMenuContentStyle,
} from "@/components/ui/DropDownInput";
import { formatFarmLocation } from "@/utils/farm";

type FarmStatusFilter = "all" | FarmListRespondDtoVerificationStatus;

const STATUS_OPTIONS: { label: string; value: FarmStatusFilter }[] = [
  { label: "All statuses", value: "all" },
  { label: "Verified", value: "VERIFIED" },
  { label: "Pending", value: "PENDING" },
  { label: "Rejected", value: "REJECTED" },
];

export interface FarmManagementContentProps {
  isDesktop: boolean;
  farms?: FarmerControllerFindFarms200AllOf;
  isLoading: boolean;
  errorMessage?: string | null;
  pendingDeleteId: string | null;
  onEdit: (farmId: string) => void;
  onDelete: (farmId: string, farmName: string) => void;
  onAddFarm: () => void;
  formatSize: (value: number | null) => string;
  onRetry: () => void;
}

export default function FarmManagementContent({
  isDesktop,
  farms,
  isLoading,
  errorMessage,
  pendingDeleteId,
  onEdit,
  onDelete,
  onAddFarm,
  formatSize,
  onRetry,
}: FarmManagementContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FarmStatusFilter>("all");

  const hasAnyFarms = (farms?.data?.length ?? 0) > 0;

  const filteredFarms = useMemo(() => {
    if (!farms?.data) return farms;

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filtered = farms.data.filter((farm) => {
      const matchesStatus =
        statusFilter === "all" || farm.verificationStatus === statusFilter;
      const locationLabel = formatFarmLocation(farm);
      const matchesSearch =
        !normalizedQuery ||
        [farm.name, locationLabel, farm.produceCategories.join(" "), farm.verificationStatus]
          .filter(Boolean)
          .some((field) =>
            String(field).toLowerCase().includes(normalizedQuery)
          );

      return matchesStatus && matchesSearch;
    });

    return {
      ...farms,
      data: filtered,
      count: filtered.length,
    };
  }, [farms, searchQuery, statusFilter]);

  const showFilters = !isLoading && !!farms;
  const hasFilteredFarms = (filteredFarms?.data?.length ?? 0) > 0;

  return (
    <View className="px-6 py-6">
      {errorMessage ? (
        <ErrorState
          message={
            errorMessage || "Failed to load farms. Please try again later."
          }
          onRetry={onRetry}
        />
      ) : null}

      {showFilters ? (
        <View
          className={`gap-3 ${
            isDesktop ? "flex-row items-center mb-4" : "flex-col mb-4"
          }`}
        >
          <View className="flex-row items-center bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 flex-1">
            <Search color="#9ca3af" size={20} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search farms by name, location, or category"
              className="flex-1 ml-3 text-gray-900 text-[15px]"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View
            className={`flex-row ${
              isDesktop ? "gap-3 flex-none" : "gap-3 flex-wrap"
            }`}
          >
            <View className="relative min-w-[180px] flex-1">
              <Dropdown
                mode="outlined"
                placeholder="Filter by status"
                value={statusFilter === "all" ? "" : statusFilter}
                options={STATUS_OPTIONS.map((option) => ({
                  label: option.label,
                  value: option.value,
                }))}
                onSelect={(value) =>
                  setStatusFilter((value as FarmStatusFilter | null) ?? "all")
                }
                CustomDropdownInput={DropDownInput}
                CustomDropdownItem={DropdownItem}
                menuContentStyle={dropdownMenuContentStyle}
                hideMenuHeader
              />
            </View>
          </View>
        </View>
      ) : null}

      {isLoading ? (
        <LoadingState message="Loading your farms..." />
      ) : hasAnyFarms ? (
        hasFilteredFarms ? (
          isDesktop ? (
            <FarmTable
              farms={filteredFarms!}
              pendingDeleteId={pendingDeleteId}
              onEdit={onEdit}
              onDelete={onDelete}
              formatSize={formatSize}
            />
          ) : (
            <FarmCards
              farms={filteredFarms!}
              pendingDeleteId={pendingDeleteId}
              onEdit={onEdit}
              onDelete={onDelete}
              formatSize={formatSize}
            />
          )
        ) : (
          <EmptyState
            title="No Farms Match Your Filters"
            subtitle="Try adjusting the search or status filter to see your farms."
            icon={<Sprout color="#047857" size={28} />}
            actionLabel="Reset Filters"
            onActionPress={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
          />
        )
      ) : (
        <EmptyState
          title="No Farms Found"
          subtitle="Add your first farm to start managing produce batches and subsidy requests from one place."
          icon={<Sprout color="#047857" size={28} />}
          actionLabel="Add Farm"
          onActionPress={onAddFarm}
        />
      )}
    </View>
  );
}
