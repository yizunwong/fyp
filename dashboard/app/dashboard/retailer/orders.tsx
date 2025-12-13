import { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  useWindowDimensions,
  Modal,
} from "react-native";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Calendar,
  MapPin,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppLayout } from "@/components/layout/AppLayoutContext";
import { useAssignedBatchesQuery } from "@/hooks/useRetailer";
import type { ProduceListResponseDto } from "@/api";
import { useMarkArrivedMutation } from "@/hooks/useProduce";
import Toast from "react-native-toast-message";
import { parseError } from '@/utils/format-error';

export default function OrdersScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;

  const { batches, isLoading } = useAssignedBatchesQuery();
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "completed"
  >("all");
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

  const toStatusInfo = (status: string) => {
    if (status === "IN_TRANSIT")
      return { label: "In Transit", color: "bg-purple-100 text-purple-700", icon: Truck, iconColor: "#7c3aed" };
    if (status === "ARRIVED")
      return { label: "Arrived", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle, iconColor: "#10b981" };
    if (status === "RETAILER_VERIFIED")
      return { label: "Accepted", color: "bg-green-100 text-green-700", icon: CheckCircle, iconColor: "#15803d" };
    if (status === "ARCHIVED")
      return { label: "Cancelled", color: "bg-red-100 text-red-700", icon: XCircle, iconColor: "#dc2626" };
    if (status === "ONCHAIN_CONFIRMED")
      return { label: "Processing", color: "bg-blue-100 text-blue-700", icon: Package, iconColor: "#2563eb" };
    return { label: "Pending", color: "bg-yellow-100 text-yellow-700", icon: Clock, iconColor: "#b45309" };
  };

  const orders = useMemo(() => batches ?? [], [batches]);

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "active") {
      return ["PENDING_CHAIN", "ONCHAIN_CONFIRMED", "IN_TRANSIT", "ARRIVED"].includes(
        order.status
      );
    }
    return ["RETAILER_VERIFIED", "ARCHIVED"].includes(order.status);
  });

  const stats = {
    total: orders.length,
    active: orders.filter((o) =>
      ["PENDING_CHAIN", "ONCHAIN_CONFIRMED", "IN_TRANSIT", "ARRIVED"].includes(o.status)
    ).length,
    delivered: orders.filter((o) => o.status === "RETAILER_VERIFIED").length,
  };

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

  const OrderCard = ({ order }: { order: ProduceListResponseDto }) => {
    const statusInfo = toStatusInfo(order.status);
    const StatusIcon = statusInfo.icon;
    const farmName = order.farm?.name ?? "Farm";
    const farmLocation = order.farm?.address
      ? `${order.farm.address}${order.farm.district ? `, ${order.farm.district}` : ""}${
          order.farm.state ? `, ${order.farm.state}` : ""
        }`
      : farmName;

    return (
      <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <Text className="text-gray-900 text-base font-bold mb-1">
              {order.name}
            </Text>
            <Text className="text-gray-600 text-sm">{farmName}</Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${statusInfo.color}`}>
            <Text className="text-xs font-semibold">{statusInfo.label}</Text>
          </View>
        </View>

        <View className="bg-gray-50 rounded-lg p-3 mb-3">
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-600 text-sm">Order ID</Text>
              <Text className="text-gray-900 text-sm font-mono font-medium">
                {order.batchId}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-600 text-sm">Batch</Text>
              <Text className="text-gray-900 text-sm font-mono font-medium">
                {order.batchId}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-600 text-sm">Quantity</Text>
              <Text className="text-gray-900 text-sm font-medium">
                {order.quantity ?? 0} {order.unit}
              </Text>
            </View>
          </View>
        </View>

        <View className="gap-2 mb-3">
          <View className="flex-row items-center gap-2">
            <Calendar color="#9ca3af" size={14} />
            <Text className="text-gray-600 text-xs">
              Harvested: {new Date(order.harvestDate).toLocaleDateString()}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <MapPin color="#9ca3af" size={14} />
            <Text className="text-gray-600 text-xs">
              {farmLocation || "Location pending"}
            </Text>
          </View>
        </View>

        <TouchableOpacity className="rounded-lg overflow-hidden">
          <LinearGradient
            colors={["#ea580c", "#c2410c"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-row items-center justify-center gap-2 py-2.5"
          >
            <StatusIcon color="#fff" size={18} />
            <Text className="text-white text-sm font-semibold">
              View Details
            </Text>
          </LinearGradient>
          <TouchableOpacity
            className="absolute inset-0"
            onPress={() => handleViewDetails(order)}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const pageContent = (
    <View className="px-6 py-6">
      <View className="mb-6">
        <Text className="text-gray-900 text-xl font-bold mb-2">My Orders</Text>
        <Text className="text-gray-600 text-sm">
          Track and manage your produce orders
        </Text>
      </View>

      <View className="flex-row gap-3 mb-6">
        <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
          <Text className="text-gray-600 text-xs mb-1">Total Orders</Text>
          <Text className="text-gray-900 text-2xl font-bold">
            {stats.total}
          </Text>
        </View>
        <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
          <Text className="text-gray-600 text-xs mb-1">Active</Text>
          <Text className="text-blue-600 text-2xl font-bold">
            {stats.active}
          </Text>
        </View>
        <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
          <Text className="text-gray-600 text-xs mb-1">Delivered</Text>
          <Text className="text-green-600 text-2xl font-bold">
            {stats.delivered}
          </Text>
        </View>
      </View>

      <View className="flex-row bg-white rounded-xl p-1 border border-gray-200 mb-6">
        <TouchableOpacity
          onPress={() => setActiveFilter("all")}
          className={`flex-1 py-2 rounded-lg ${
            activeFilter === "all" ? "bg-orange-50" : ""
          }`}
        >
          <Text
            className={`text-center text-sm font-semibold ${
              activeFilter === "all" ? "text-orange-700" : "text-gray-600"
            }`}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveFilter("active")}
          className={`flex-1 py-2 rounded-lg ${
            activeFilter === "active" ? "bg-orange-50" : ""
          }`}
        >
          <Text
            className={`text-center text-sm font-semibold ${
              activeFilter === "active" ? "text-orange-700" : "text-gray-600"
            }`}
          >
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveFilter("completed")}
          className={`flex-1 py-2 rounded-lg ${
            activeFilter === "completed" ? "bg-orange-50" : ""
          }`}
        >
          <Text
            className={`text-center text-sm font-semibold ${
              activeFilter === "completed"
                ? "text-orange-700"
                : "text-gray-600"
            }`}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <View className="mb-4">
        <Text className="text-gray-900 text-sm font-bold mb-3">
          {filteredOrders.length}{" "}
          {filteredOrders.length === 1 ? "Order" : "Orders"}
        </Text>
      </View>

      {isLoading ? (
        <View className="bg-white rounded-xl p-8 border border-gray-200 items-center">
          <Text className="text-gray-900 text-base font-bold mt-4">
            Loading orders...
          </Text>
        </View>
      ) : isDesktop ? (
        <View className="flex-row flex-wrap gap-4">
          {filteredOrders.map((order) => (
            <View key={order.id} style={{ width: "48%" }}>
              <OrderCard order={order} />
            </View>
          ))}
        </View>
      ) : (
        <View>
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </View>
      )}

      {filteredOrders.length === 0 && !isLoading && (
        <View className="bg-white rounded-xl p-8 border border-gray-200 items-center">
          <Package color="#9ca3af" size={48} />
          <Text className="text-gray-900 text-base font-bold mt-4">
            No orders found
          </Text>
          <Text className="text-gray-500 text-sm text-center mt-2">
            {activeFilter === "all"
              ? "You have not placed any orders yet"
              : `No ${activeFilter} orders`}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <>
      <View className="flex-1 bg-gray-50">
        {isDesktop ? pageContent : <ScrollView className="flex-1">{pageContent}</ScrollView>}
      </View>

      <Modal
        visible={showDetails}
        transparent
        animationType={isDesktop ? "fade" : "slide"}
        onRequestClose={() => setShowDetails(false)}
      >
        <View
          className={`flex-1 bg-black/50 ${isDesktop ? "items-center justify-center" : "justify-end"}`}
        >
          <View
            className={`bg-white ${isDesktop ? "rounded-2xl w-full max-w-3xl" : "rounded-t-3xl"} max-h-[90%]`}
          >
            <ScrollView>
              <View className="p-6">
                <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-gray-900 text-xl font-bold">
                    Order Details
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowDetails(false)}
                    className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                  >
                    <Text className="text-gray-600 text-lg">×</Text>
                  </TouchableOpacity>
                </View>

                {selectedOrder && (
                  <View className="gap-4">
                    <View className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <Text className="text-orange-900 text-lg font-bold mb-1">
                        {selectedOrder.name}
                      </Text>
                      <Text className="text-orange-700 text-sm">
                        Batch: {selectedOrder.batchId}
                      </Text>
                    </View>

                    <View className="bg-gray-50 rounded-lg p-4">
                      <Text className="text-gray-700 text-sm font-bold mb-3">
                        Farm Information
                      </Text>
                      <View className="gap-2">
                        <View className="flex-row items-center justify-between">
                          <Text className="text-gray-600 text-sm">Farm</Text>
                          <Text className="text-gray-900 text-sm font-medium">
                            {selectedOrder.farm?.name ?? "N/A"}
                          </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <Text className="text-gray-600 text-sm">Location</Text>
                          <Text className="text-gray-900 text-sm text-right">
                            {selectedOrder.farm?.address
                              ? `${selectedOrder.farm.address}${selectedOrder.farm.district ? `, ${selectedOrder.farm.district}` : ""}${
                                  selectedOrder.farm.state ? `, ${selectedOrder.farm.state}` : ""
                                }`
                              : "Location pending"}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View className="bg-gray-50 rounded-lg p-4">
                      <Text className="text-gray-700 text-sm font-bold mb-3">
                        Batch Details
                      </Text>
                      <View className="gap-2">
                        <View className="flex-row items-center justify-between">
                          <Text className="text-gray-600 text-sm">Quantity Available</Text>
                          <Text className="text-gray-900 text-sm font-bold">
                            {selectedOrder.quantity ?? 0} {selectedOrder.unit}
                          </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <Text className="text-gray-600 text-sm">Harvest Date</Text>
                          <Text className="text-gray-900 text-sm">
                            {new Date(selectedOrder.harvestDate).toLocaleDateString()}
                          </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <Text className="text-gray-600 text-sm">Status</Text>
                          <View
                            className={`px-3 py-1 rounded-full ${toStatusInfo(selectedOrder.status).color}`}
                          >
                            <Text className="text-xs font-semibold capitalize">
                              {toStatusInfo(selectedOrder.status).label}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View className="gap-3">
                      {selectedOrder?.status === "IN_TRANSIT" && (
                        <TouchableOpacity
                          onPress={handleMarkAsArrived}
                          disabled={markArrivedMutation.isPending}
                          className="rounded-lg overflow-hidden"
                        >
                          <LinearGradient
                            colors={["#22c55e", "#15803d"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className={`flex-row items-center justify-center gap-2 py-3 ${
                              markArrivedMutation.isPending ? "opacity-50" : ""
                            }`}
                          >
                            <CheckCircle color="#fff" size={20} />
                            <Text className="text-white text-[15px] font-bold">
                              {markArrivedMutation.isPending
                                ? "Updating..."
                                : "Mark as Arrived"}
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        onPress={() => setShowDetails(false)}
                        className="flex-row items-center justify-center gap-2 bg-gray-100 border border-gray-300 rounded-lg py-3"
                      >
                        <Text className="text-gray-700 text-[15px] font-bold">
                          Close
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
