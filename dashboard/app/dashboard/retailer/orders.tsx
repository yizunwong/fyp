import { useMemo, useState, useEffect } from "react";
import { View, Text, ScrollView, Platform, useWindowDimensions } from "react-native";
import { Package } from "lucide-react-native";
import { useAppLayout } from "@/components/layout/AppLayoutContext";
import { useAssignedBatchesQuery } from "@/hooks/useRetailer";
import { useMarkArrivedMutation } from "@/hooks/useProduce";
import Toast from "react-native-toast-message";
import { parseError } from "@/utils/format-error";
import { useRetailerOrderStats } from "@/hooks/useDashboard";
import Pagination from "@/components/common/Pagination";
import BatchFilters from "@/components/retailer/batches/BatchFilters";
import { BatchStatusFilter } from "@/components/retailer/batches/helpers";
import type { ProduceListResponseDto, RetailerControllerListAssignedBatchesParams } from "@/api";
import OrderCard from "@/components/retailer/orders/OrderCard";
import OrderDetailsModal from "@/components/retailer/orders/OrderDetailsModal";

export default function OrdersScreen() {
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

  const assignedParams = useMemo(() => {
    const params: RetailerControllerListAssignedBatchesParams = {
      page,
      limit: pageSize,
    };
    if (debouncedSearch) params.search = debouncedSearch;
    if (normalizedHarvestFrom) params.harvestFrom = normalizedHarvestFrom;
    if (normalizedHarvestTo) params.harvestTo = normalizedHarvestTo;
    if (statusFilter !== "ALL") params.status = statusFilter;
    return Object.keys(params).length ? params : undefined;
  }, [page, pageSize, debouncedSearch, normalizedHarvestFrom, normalizedHarvestTo, statusFilter]);

  const { batches, isLoading } = useAssignedBatchesQuery(assignedParams);
  const { stats: orderStats } = useRetailerOrderStats();
  const [selectedOrder, setSelectedOrder] =
    useState<ProduceListResponseDto | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const markArrivedMutation = useMarkArrivedMutation();

  const layoutMeta = useMemo(
    () => ({
      title: "My Orders",
      subtitle: "Track and manage your orders",
      mobile: {
        disableScroll: false,
      },
    }),
    []
  );

  useAppLayout(layoutMeta);

  const orders = useMemo(() => batches ?? [], [batches]);

  const stats = {
    total: orderStats?.totalOrders ?? orders.length,
    active:
      orderStats?.active ??
      orders.filter((o) =>
        ["PENDING_CHAIN", "ONCHAIN_CONFIRMED", "IN_TRANSIT", "ARRIVED"].includes(o.status)
      ).length,
    delivered:
      orderStats?.delivered ??
      orders.filter((o) => o.status === "RETAILER_VERIFIED").length,
  };

  const hasNextPage = (orders?.length ?? 0) === pageSize;

  const handleViewDetails = (order: ProduceListResponseDto) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const handleMarkAsArrived = async () => {
    if (!selectedOrder) return;

    try {
      await markArrivedMutation.markArrived(selectedOrder.batchId);
      Toast.show({
        type: "success",
        text1: "Marked as arrived",
        text2: "Order status updated",
      });
      setShowDetails(false);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Update failed",
        text2: parseError(error) || "Could not mark as arrived",
      });
    }
  };

  const pageContent = (
    <View className="px-6 py-6">

      <View className="flex-row gap-3 mb-6">
        <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <Text className="text-gray-600 dark:text-gray-400 text-xs mb-1">Total Orders</Text>
          <Text className="text-gray-900 dark:text-gray-100 text-2xl font-bold">
            {stats.total}
          </Text>
        </View>
        <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <Text className="text-gray-600 dark:text-gray-400 text-xs mb-1">Active</Text>
          <Text className="text-blue-600 dark:text-blue-400 text-2xl font-bold">
            {stats.active}
          </Text>
        </View>
        <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <Text className="text-gray-600 dark:text-gray-400 text-xs mb-1">Delivered</Text>
          <Text className="text-green-600 dark:text-green-400 text-2xl font-bold">
            {stats.delivered}
          </Text>
        </View>
      </View>

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

      <View className="mb-4">
        <Text className="text-gray-900 dark:text-gray-100 text-sm font-bold mb-3">
          {orders.length} {orders.length === 1 ? "Order" : "Orders"}
        </Text>
      </View>

      {isLoading ? (
        <View className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 items-center">
          <Text className="text-gray-900 dark:text-gray-100 text-base font-bold mt-4">
            Loading orders...
          </Text>
        </View>
      ) : isDesktop ? (
        <View className="flex-row flex-wrap gap-4">
      {orders.map((order) => (
        <View key={order.id} style={{ width: "48%" }}>
          <OrderCard order={order} onViewDetails={handleViewDetails} />
        </View>
      ))}
    </View>
  ) : (
    <View>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} onViewDetails={handleViewDetails} />
      ))}
    </View>
  )}

      {orders.length === 0 && !isLoading && (
        <View className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 items-center">
          <Package color="#9ca3af" size={48} />
          <Text className="text-gray-900 dark:text-gray-100 text-base font-bold mt-4">
            No orders found
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm text-center mt-2">
            You have not placed any orders yet
          </Text>
        </View>
      )}

      <Pagination
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        isLoading={isLoading}
        hasNext={hasNextPage}
        total={stats.total}
      />
    </View>
  );

  return (
    <>
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        {isDesktop ? pageContent : <ScrollView className="flex-1">{pageContent}</ScrollView>}
      </View>

      
      <OrderDetailsModal
        visible={showDetails}
        isDesktop={isDesktop}
        order={selectedOrder}
        onClose={() => setShowDetails(false)}
        onMarkArrived={handleMarkAsArrived}
        isMarking={markArrivedMutation.isPending}
      />

    </>
  );
}
