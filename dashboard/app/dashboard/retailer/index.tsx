import { useState, useMemo } from "react";
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
  QrCode,
  Star,
  TrendingUp,
  ShoppingCart,
  Eye,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAppLayout } from "@/components/layout/AppLayoutContext";
import { useDashboardStats } from "@/hooks/useDashboard";
import { useBatchesQuery } from "@/hooks/useRetailer";
import type { ProduceListResponseDto } from "@/api";


const mockNotifications = [
  {
    id: 1,
    title: "New Batch Available",
    message: "Fresh organic tomatoes from Faizal Farm",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: 2,
    title: "Order Delivered",
    message: "Batch BTH-032 has been delivered",
    time: "3 hours ago",
    unread: true,
  },
  {
    id: 3,
    title: "Price Update",
    message: "Lettuce prices reduced by 10%",
    time: "1 day ago",
    unread: false,
  },
];

export default function RetailerDashboard() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;

  const { stats, isLoading: isStatsLoading } = useDashboardStats();
  const { batches } = useBatchesQuery();
  const recentBatches = useMemo(
    () => (batches ?? []).slice(0, isDesktop ? 2 : 3),
    [batches, isDesktop]
  );

  const kpiValues = {
    availableBatches: stats?.availableBatches ?? 0,
    ordersThisMonth: stats?.ordersThisMonth ?? 0,
    averageRating: stats?.averageRating ?? 0,
    totalSuppliers: stats?.totalSuppliers ?? 0,
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const handleNotificationPress = (notification: (typeof notifications)[0]) => {
    console.log("Notification pressed:", notification);
  };

  const headerSubtitle = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useAppLayout({
    title: "Welcome back!",
    subtitle: headerSubtitle,
    notifications,
    onMarkAllRead: handleMarkAllRead,
    onNotificationPress: handleNotificationPress,
    mobile: {
      disableScroll: false,
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getCertificationBadge = (cert: string) => {
    switch (cert.toLowerCase()) {
      case "mygap":
        return { label: "MyGAP", color: "bg-blue-100 text-blue-700" };
      case "organic":
        return { label: "Organic", color: "bg-green-100 text-green-700" };
      default:
        return { label: cert, color: "bg-gray-100 text-gray-700" };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "ONCHAIN_CONFIRMED":
      case "IN_TRANSIT":
      case "ARRIVED":
        return "bg-blue-100 text-blue-700";
      case "RETAILER_VERIFIED":
      case "DELIVERED":
        return "bg-green-100 text-green-700";
      case "PENDING_CHAIN":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const KPICards = () => {
    const kpis = [
      {
        label: "Available Batches",
        value: kpiValues.availableBatches,
        icon: Package,
        color: "#22c55e",
      },
      {
        label: "Orders This Month",
        value: kpiValues.ordersThisMonth,
        icon: ShoppingCart,
        color: "#3b82f6",
      },
      {
        label: "Average Rating",
        value: kpiValues.averageRating,
        icon: Star,
        color: "#f59e0b",
      },
      {
        label: "Total Suppliers",
        value: kpiValues.totalSuppliers,
        icon: TrendingUp,
        color: "#ea580c",
      },
    ];

    if (isDesktop) {
      return (
        <View className="gap-4 flex-row mb-6">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <View
                key={index}
                className="bg-white rounded-xl p-5 border border-gray-200 flex-1"
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View
                    className="w-12 h-12 rounded-lg items-center justify-center"
                    style={{ backgroundColor: `${kpi.color}20` }}
                  >
                    <Icon color={kpi.color} size={24} />
                  </View>
                  <TrendingUp color="#10b981" size={20} />
                </View>
                <Text className="text-gray-900 text-3xl font-bold mb-1">
                  {kpi.value}
                </Text>
                <Text className="text-gray-600 text-sm">{kpi.label}</Text>
              </View>
            );
          })}
        </View>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-6 -mx-6 px-6"
      >
        <View className="flex-row gap-4">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <View
                key={index}
                className="bg-white rounded-xl p-4 w-40 border border-gray-100"
              >
                <View
                  className="w-10 h-10 rounded-lg mb-3 items-center justify-center"
                  style={{ backgroundColor: `${kpi.color}20` }}
                >
                  <Icon color={kpi.color} size={20} />
                </View>
                <Text className="text-gray-900 text-2xl font-bold mb-1">
                  {kpi.value}
                </Text>
                <Text className="text-gray-600 text-xs">{kpi.label}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  const QuickActions = () => (
    <View className="mb-6">
      <Text className="text-gray-900 text-base font-bold mb-3">
        Quick Actions
      </Text>
      <View className={isDesktop ? "flex-row gap-3" : "gap-3"}>
        <TouchableOpacity
          onPress={() => router.push("/dashboard/retailer/scan" as any)}
          className="flex-1 bg-white rounded-xl p-4 border border-gray-200"
        >
          <View className="w-12 h-12 bg-orange-50 rounded-lg items-center justify-center mb-3">
            <QrCode color="#ea580c" size={24} />
          </View>
          <Text className="text-gray-900 text-sm font-bold mb-1">
            Scan QR Code
          </Text>
          <Text className="text-gray-500 text-xs">
            Verify produce authenticity
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/dashboard/retailer/batches" as any)}
          className="flex-1 bg-white rounded-xl p-4 border border-gray-200"
        >
          <View className="w-12 h-12 bg-blue-50 rounded-lg items-center justify-center mb-3">
            <Package color="#2563eb" size={24} />
          </View>
          <Text className="text-gray-900 text-sm font-bold mb-1">
            Browse Batches
          </Text>
          <Text className="text-gray-500 text-xs">View inventory</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/dashboard/retailer/ratings" as any)}
          className="flex-1 bg-white rounded-xl p-4 border border-gray-200"
        >
          <View className="w-12 h-12 bg-yellow-50 rounded-lg items-center justify-center mb-3">
            <Star color="#b45309" size={24} />
          </View>
          <Text className="text-gray-900 text-sm font-bold mb-1">
            Rate Suppliers
          </Text>
          <Text className="text-gray-500 text-xs">Share feedback</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const BatchCard = ({ batch }: { batch: ProduceListResponseDto }) => {
    const certBadge = getCertificationBadge(batch.certifications?.[0]?.type ?? "N/A");

    return (
      <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-gray-900 text-base font-bold">
                {batch.name}
              </Text>
              <View className={`px-2 py-0.5 rounded-full ${certBadge.color}`}>
                <Text className="text-xs font-semibold">{certBadge.label}</Text>
              </View>
            </View>
            <Text className="text-gray-600 text-sm">
              {batch.farm?.name ?? "Farm"}
            </Text>
            <Text className="text-gray-500 text-xs">
              Batch {batch.batchId}
            </Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${getStatusColor(batch.status || "")}`}>
            <Text className="text-xs font-semibold capitalize">{batch.status ?? "Unknown"}</Text>
          </View>
        </View>

        <View className="gap-2 mb-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 text-sm">Quantity</Text>
            <Text className="text-gray-900 text-sm font-medium">
              {batch.quantity ?? 0} {batch.unit}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 text-sm">Harvest Date</Text>
            <Text className="text-gray-900 text-sm">
              {formatDate(batch.harvestDate.toString())}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/dashboard/retailer/batches" as any)}
          className="rounded-lg overflow-hidden"
        >
          <LinearGradient
            colors={["#ea580c", "#c2410c"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-row items-center justify-center gap-2 py-2.5"
          >
            <Eye color="#fff" size={18} />
            <Text className="text-white text-sm font-semibold">
              View Details
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  const DashboardContent = () => (
    <View className="px-6 py-6">
      <KPICards />
      <QuickActions />

      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-gray-900 text-base font-bold">
            Recent Batches
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/dashboard/retailer/batches" as any)}
          >
            <Text className="text-orange-600 text-sm font-semibold">
              View All
            </Text>
          </TouchableOpacity>
        </View>

        {recentBatches.length > 0 ? (
          isDesktop ? (
            <View className="flex-row flex-wrap gap-4">
              {recentBatches.map((batch) => (
                <View key={batch.id} style={{ width: "48%" }}>
                  <BatchCard batch={batch} />
                </View>
              ))}
            </View>
          ) : (
            <View>
              {recentBatches.map((batch) => (
                <BatchCard key={batch.id} batch={batch} />
              ))}
            </View>
          )
        ) : (
          <View className="bg-white rounded-xl p-8 border border-gray-200 items-center">
            <Package color="#9ca3af" size={48} />
            <Text className="text-gray-900 text-base font-bold mt-4">
              No recent batches
            </Text>
            <Text className="text-gray-500 text-sm text-center mt-2">
              Browse batches to see them here
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return <DashboardContent />;
}
