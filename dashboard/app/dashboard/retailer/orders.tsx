import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  useWindowDimensions,
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

interface Order {
  id: string;
  batchNumber: string;
  produceType: string;
  farmName: string;
  farmerName: string;
  quantity: number;
  unit: string;
  totalPrice: number;
  orderDate: string;
  deliveryDate?: string;
  status: "pending" | "processing" | "in_transit" | "delivered" | "cancelled";
  location: string;
}

const mockOrders: Order[] = [
  {
    id: "ORD-001",
    batchNumber: "BTH-001-2025",
    produceType: "Organic Tomatoes",
    farmName: "Faizal Farm",
    farmerName: "Mohd Faizal bin Ahmad",
    quantity: 500,
    unit: "kg",
    totalPrice: 4250.0,
    orderDate: "2025-12-08",
    deliveryDate: "2025-12-10",
    status: "in_transit",
    location: "Kubang Pasu, Kedah",
  },
  {
    id: "ORD-002",
    batchNumber: "BTH-045-2025",
    produceType: "Fresh Lettuce",
    farmName: "Mei Ling Organic Farm",
    farmerName: "Tan Mei Ling",
    quantity: 300,
    unit: "kg",
    totalPrice: 1800.0,
    orderDate: "2025-12-09",
    status: "processing",
    location: "Cameron Highlands, Pahang",
  },
  {
    id: "ORD-003",
    batchNumber: "BTH-032-2025",
    produceType: "Bok Choy",
    farmName: "Wong Brothers Farm",
    farmerName: "Wong Wei Ming",
    quantity: 400,
    unit: "kg",
    totalPrice: 1800.0,
    orderDate: "2025-12-05",
    deliveryDate: "2025-12-07",
    status: "delivered",
    location: "Ipoh, Perak",
  },
  {
    id: "ORD-004",
    batchNumber: "BTH-112-2025",
    produceType: "Cherry Tomatoes",
    farmName: "Siti Nursery",
    farmerName: "Siti Aminah",
    quantity: 150,
    unit: "kg",
    totalPrice: 1800.0,
    orderDate: "2025-12-10",
    status: "pending",
    location: "Kuala Selangor, Selangor",
  },
];

export default function OrdersScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;

  const [orders] = useState<Order[]>(mockOrders);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "completed"
  >("all");

  useAppLayout({
    title: "My Orders",
    subtitle: "Track and manage your orders",
    mobile: {
      disableScroll: false,
    },
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          color: "bg-yellow-100 text-yellow-700",
          icon: Clock,
          iconColor: "#b45309",
        };
      case "processing":
        return {
          label: "Processing",
          color: "bg-blue-100 text-blue-700",
          icon: Package,
          iconColor: "#2563eb",
        };
      case "in_transit":
        return {
          label: "In Transit",
          color: "bg-purple-100 text-purple-700",
          icon: Truck,
          iconColor: "#7c3aed",
        };
      case "delivered":
        return {
          label: "Delivered",
          color: "bg-green-100 text-green-700",
          icon: CheckCircle,
          iconColor: "#15803d",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          color: "bg-red-100 text-red-700",
          icon: XCircle,
          iconColor: "#dc2626",
        };
      default:
        return {
          label: status,
          color: "bg-gray-100 text-gray-700",
          icon: Package,
          iconColor: "#6b7280",
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "active") {
      return ["pending", "processing", "in_transit"].includes(order.status);
    }
    if (activeFilter === "completed") {
      return ["delivered", "cancelled"].includes(order.status);
    }
    return true;
  });

  const stats = {
    total: orders.length,
    active: orders.filter((o) =>
      ["pending", "processing", "in_transit"].includes(o.status)
    ).length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  const OrderCard = ({ order }: { order: Order }) => {
    const statusInfo = getStatusInfo(order.status);
    const StatusIcon = statusInfo.icon;

    return (
      <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <Text className="text-gray-900 text-base font-bold mb-1">
              {order.produceType}
            </Text>
            <Text className="text-gray-600 text-sm">{order.farmName}</Text>
            <Text className="text-gray-500 text-xs">{order.farmerName}</Text>
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
                {order.id}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-600 text-sm">Batch</Text>
              <Text className="text-gray-900 text-sm font-mono font-medium">
                {order.batchNumber}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-600 text-sm">Quantity</Text>
              <Text className="text-gray-900 text-sm font-medium">
                {order.quantity} {order.unit}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-600 text-sm">Total Price</Text>
              <Text className="text-green-700 text-base font-bold">
                RM {order.totalPrice.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <View className="gap-2 mb-3">
          <View className="flex-row items-center gap-2">
            <Calendar color="#9ca3af" size={14} />
            <Text className="text-gray-600 text-xs">
              Ordered: {formatDate(order.orderDate)}
            </Text>
          </View>
          {order.deliveryDate && (
            <View className="flex-row items-center gap-2">
              <Truck color="#9ca3af" size={14} />
              <Text className="text-gray-600 text-xs">
                {order.status === "delivered" ? "Delivered" : "Expected"}:{" "}
                {formatDate(order.deliveryDate)}
              </Text>
            </View>
          )}
          <View className="flex-row items-center gap-2">
            <MapPin color="#9ca3af" size={14} />
            <Text className="text-gray-600 text-xs">{order.location}</Text>
          </View>
        </View>

        <TouchableOpacity className="rounded-lg overflow-hidden">
          <LinearGradient
            colors={["#ea580c", "#c2410c"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-row items-center justify-center gap-2 py-2.5"
          >
            <Package color="#fff" size={18} />
            <Text className="text-white text-sm font-semibold">
              View Details
            </Text>
          </LinearGradient>
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
              activeFilter === "completed" ? "text-orange-700" : "text-gray-600"
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

      {isDesktop ? (
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

      {filteredOrders.length === 0 && (
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
    <View className="flex-1 bg-gray-50">
      {pageContent}
    </View>
  );
}
