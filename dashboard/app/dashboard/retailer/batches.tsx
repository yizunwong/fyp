import { useMemo, useState, useEffect } from "react";
import { View, Text, ScrollView, Platform, useWindowDimensions } from "react-native";
import { Package } from "lucide-react-native";
import { useMemo as useReactMemo } from "react";
import { useAppLayout } from "@/components/layout/AppLayoutContext";
import BatchFilters from "@/components/retailer/batches/BatchFilters";
import BatchCard from "@/components/retailer/batches/BatchCard";
import BatchDetailsModal from "@/components/retailer/batches/BatchDetailsModal";
import { BatchStatusFilter } from "@/components/retailer/batches/helpers";
import Pagination from "@/components/common/Pagination";
import { useBatchesQuery } from "@/hooks/useRetailer";
import type {
  ProduceControllerListAllBatchesParams,
  ProduceListResponseDto,
} from "@/api";
import { useAssignRetailerMutation } from "@/hooks/useProduce";
import { useAuthControllerProfile } from "@/api";
import Toast from "react-native-toast-message";

export default function BatchesScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;

  const [searchQuery, setSearchQuery] = useState("");
  const [harvestFrom, setHarvestFrom] = useState("");
  const [harvestTo, setHarvestTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<BatchStatusFilter>("ALL");
  const [showFilters, setShowFilters] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const normalizedHarvestFrom = useMemo(() => {
    const value = harvestFrom.trim();
    if (!value) return undefined;
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date.toISOString();
  }, [harvestFrom]);
  const normalizedHarvestTo = useMemo(() => {
    const value = harvestTo.trim();
    if (!value) return undefined;
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date.toISOString();
  }, [harvestTo]);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, normalizedHarvestFrom, normalizedHarvestTo, statusFilter]);
  const batchQueryParams = useMemo(() => {
    const params: ProduceControllerListAllBatchesParams & {
      search?: string;
      harvestFrom?: string;
      harvestTo?: string;
    } = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (normalizedHarvestFrom) params.harvestFrom = normalizedHarvestFrom;
    if (normalizedHarvestTo) params.harvestTo = normalizedHarvestTo;
    if (statusFilter !== "ALL") params.status = statusFilter;
    params.page = page;
    params.limit = pageSize;
    return Object.keys(params).length ? params : undefined;
  }, [debouncedSearch, normalizedHarvestFrom, normalizedHarvestTo, statusFilter, page]);
  const { batches, isLoading } = useBatchesQuery(batchQueryParams);
  const [selectedBatch, setSelectedBatch] =
    useState<ProduceListResponseDto | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const assignMutation = useAssignRetailerMutation();
  const profileQuery = useAuthControllerProfile();

  const layoutMeta = useReactMemo(
    () => ({
      title: "Browse Batches",
      subtitle: "Search and select produce from farms",
      mobile: {
        disableScroll: false,
      },
    }),
    []
  );

  useAppLayout(layoutMeta);

  const uiBatches = useMemo(() => batches ?? [], [batches]);

  const filteredBatches = uiBatches.filter((batch) => {
    const matchesStatus =
      statusFilter === "ALL" || batch.status === statusFilter;
    return matchesStatus;
  });
  const totalBatches = (filteredBatches?.length ?? 0) + (page - 1) * pageSize;

  const handleSelectBatch = (batch: ProduceListResponseDto) => {
    setSelectedBatch(batch);
    setShowDetails(true);
  };

  const handlePlaceOrder = async () => {
    if (!selectedBatch) return;
    if (selectedBatch.status !== "ONCHAIN_CONFIRMED") {
      return;
    }
    const retailerId = profileQuery.data?.data?.id;
    if (!retailerId) {
      Toast.show({
        type: "error",
        text1: "Missing profile",
        text2: "Unable to place order without user profile",
      });
      return;
    }

    try {
      await assignMutation.assignRetailer(selectedBatch.id, { retailerId });
      Toast.show({
        type: "success",
        text1: "Order placed",
        text2: "Batch has been assigned to you",
      });
      setShowDetails(false);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Order failed",
        text2: assignMutation.error || error?.message || "Could not place order",
      });
    }
  };

  const canPlaceOrder = selectedBatch?.status === "ONCHAIN_CONFIRMED";

  const hasNextPage = (batches?.length ?? 0) === pageSize;

  const pageContent = (
    <View className="px-6 py-6">
      <BatchFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
        harvestFrom={harvestFrom}
        harvestTo={harvestTo}
        onHarvestFromChange={setHarvestFrom}
        onHarvestToChange={setHarvestTo}
        normalizedHarvestFrom={normalizedHarvestFrom}
        normalizedHarvestTo={normalizedHarvestTo}
        onClearHarvestFrom={() => setHarvestFrom("")}
        onClearHarvestTo={() => setHarvestTo("")}
        onClearStatusFilter={() => setStatusFilter("ALL")}
      />

      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-gray-900 text-lg font-bold">
          {filteredBatches.length}{" "}
          {filteredBatches.length === 1 ? "Batch" : "Batches"} Found
        </Text>
      </View>

      {isLoading ? (
        <View className="bg-white rounded-xl p-8 border border-gray-200 items-center">
          <Text className="text-gray-900 text-base font-bold mt-4">
            Loading batches...
          </Text>
        </View>
      ) : isDesktop ? (
        <View className="flex-row flex-wrap gap-4">
          {filteredBatches.map((batch) => (
            <View key={batch.id} style={{ width: "48%" }}>
              <BatchCard batch={batch} onSelect={handleSelectBatch} />
            </View>
          ))}
        </View>
      ) : (
        <View>
          {filteredBatches.map((batch) => (
            <BatchCard key={batch.id} batch={batch} onSelect={handleSelectBatch} />
          ))}
        </View>
      )}

      {filteredBatches.length === 0 && !isLoading && (
        <View className="bg-white rounded-xl p-8 border border-gray-200 items-center">
          <Package color="#9ca3af" size={48} />
          <Text className="text-gray-900 text-base font-bold mt-4">
            No batches found
          </Text>
          <Text className="text-gray-500 text-sm text-center mt-2">
            Try adjusting your search or filters
          </Text>
        </View>
      )}

      <Pagination
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        isLoading={isLoading}
        hasNext={hasNextPage}
        total={totalBatches}
      />
    </View>
  );

  return (
    <>
      <View className="flex-1 bg-gray-50">
        {isDesktop ? (
          pageContent
        ) : (
          <ScrollView className="flex-1">{pageContent}</ScrollView>
        )}
      </View>

      <BatchDetailsModal
        visible={showDetails}
        isDesktop={isDesktop}
        selectedBatch={selectedBatch}
        onClose={() => setShowDetails(false)}
        onPlaceOrder={handlePlaceOrder}
        canPlaceOrder={canPlaceOrder}
        isPlacingOrder={assignMutation.isPending}
      />
    </>
  );
}
