import { useCallback, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import {
  Package,
  Plus,
  TrendingUp,
  CheckCircle,
  DollarSign,
  Warehouse,
  Clock,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import NotificationDrawer from "@/components/ui/NotificationDrawer";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useFarmerLayout } from "@/components/farmer/layout/FarmerLayoutContext";
import { useAuthControllerProfile } from "@/api";

const mockData = {
  farmer: {
    name: "John Farmer",
    location: "Northern Region",
  },
  kpis: [
    { label: "Total Farms", value: "12", icon: Warehouse, color: "#22c55e" },
    { label: "Active Batches", value: "34", icon: Package, color: "#3b82f6" },
    {
      label: "Verified Records",
      value: "156",
      icon: CheckCircle,
      color: "#8b5cf6",
    },
    { label: "Subsidies", value: "$8,450", icon: DollarSign, color: "#f59e0b" },
  ],
  produce: [
    {
      id: 1,
      name: "Organic Tomatoes",
      batch: "BTH-001",
      quantity: "500 kg",
      status: "In Transit",
      date: "2025-10-05",
    },
    {
      id: 2,
      name: "Sweet Corn",
      batch: "BTH-002",
      quantity: "800 kg",
      status: "Verified",
      date: "2025-10-03",
    },
    {
      id: 3,
      name: "Green Beans",
      batch: "BTH-003",
      quantity: "300 kg",
      status: "Processing",
      date: "2025-10-01",
    },
    {
      id: 4,
      name: "Carrots",
      batch: "BTH-004",
      quantity: "600 kg",
      status: "Delivered",
      date: "2025-09-28",
    },
  ],
  timeline: [
    {
      status: "Harvest Completed",
      date: "2025-10-05",
      time: "08:30 AM",
      verified: true,
    },
    {
      status: "Quality Check Passed",
      date: "2025-10-05",
      time: "10:15 AM",
      verified: true,
    },
    {
      status: "In Transit to Warehouse",
      date: "2025-10-05",
      time: "02:45 PM",
      verified: true,
    },
    {
      status: "Pending Retailer Acceptance",
      date: "2025-10-06",
      time: "Pending",
      verified: false,
    },
  ],
  subsidies: [
    {
      id: 1,
      program: "Organic Farming Grant",
      amount: "$2,500",
      status: "Approved",
      date: "2025-09-15",
    },
    {
      id: 2,
      program: "Irrigation Subsidy",
      amount: "$1,800",
      status: "Processing",
      date: "2025-10-01",
    },
    {
      id: 3,
      program: "Seed Support Program",
      amount: "$950",
      status: "Pending",
      date: "2025-10-03",
    },
  ],
  notifications: [
    {
      id: 1,
      title: "Batch BTH-001 Verified",
      message: "Your tomato batch has been verified",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 2,
      title: "Subsidy Approved",
      message: "Organic Farming Grant approved",
      time: "5 hours ago",
      unread: true,
    },
    {
      id: 3,
      title: "Payment Received",
      message: "$3,200 deposited to your account",
      time: "1 day ago",
      unread: false,
    },
    {
      id: 4,
      title: "New Subsidy Available",
      message: "Check out the new Crop Insurance program",
      time: "2 days ago",
      unread: false,
    },
  ],
};

export default function FarmerDashboardScreen() {
  const [notifications, setNotifications] = useState(mockData.notifications);
  const { isDesktop } = useResponsiveLayout();

  // Fetch user profile to get real name
  const { data: profileResponse } = useAuthControllerProfile();
  const userProfile = profileResponse?.data;
  const userName = (userProfile?.username || "Farmer");

  const handleMarkAllRead = useCallback(() => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  }, [notifications]);

  const handleNotificationPress = useCallback(
    (notification: (typeof notifications)[0]) => {
      console.log("Notification pressed:", notification);
    },
    []
  );

  const handleAddProduce = useCallback(() => {
    router.push("/dashboard/farmer/add-produce");
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "verified":
      case "delivered":
      case "approved":
        return "bg-green-100 text-green-700";
      case "in transit":
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const KPICards = () => {
    if (isDesktop) {
      return (
        <View className="gap-4 flex-row mb-6">
          {mockData.kpis.map((kpi, index) => {
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
          {mockData.kpis.map((kpi, index) => {
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

  const DashboardContent = () => (
    <View className={isDesktop ? "px-6 py-6" : "flex-1"}>
      {!isDesktop && (
        <LinearGradient
          colors={["#22c55e", "#059669"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="pt-12 pb-8 px-6"
        >
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 bg-white/30 rounded-full items-center justify-center">
                <Text className="text-white text-lg font-bold">JF</Text>
              </View>
              <View>
                <Text className="text-white text-lg font-bold">
                  {mockData.farmer.name}
                </Text>
                <Text className="text-white/80 text-xs">
                  {mockData.farmer.location}
                </Text>
              </View>
            </View>
            <NotificationDrawer
              notifications={notifications}
              onMarkAllRead={handleMarkAllRead}
              onNotificationPress={handleNotificationPress}
            />
          </View>
          <Text className="text-white text-4xl font-bold mb-2">$24,850</Text>
          <Text className="text-white/90 text-sm">
            Total revenue this month
          </Text>
        </LinearGradient>
      )}

      <View className={isDesktop ? "" : "px-6 pt-6"}>
        <KPICards />

        <View className={isDesktop ? "flex-row gap-6" : ""}>
          <View className={isDesktop ? "flex-1" : "mb-6"}>
            <View className="bg-white rounded-xl p-6 border border-gray-200">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-gray-900 text-lg font-bold">
                  Recent Produce
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/dashboard/farmer/produce")}
                >
                  <Text className="text-emerald-600 text-sm font-semibold">
                    View All
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="gap-3">
                {mockData.produce.slice(0, 3).map((item) => (
                  <View
                    key={item.id}
                    className="flex-row items-center justify-between py-3 border-b border-gray-100"
                  >
                    <View className="flex-1">
                      <Text className="text-gray-900 text-sm font-medium">
                        {item.name}
                      </Text>
                      <Text className="text-gray-500 text-xs mt-1">
                        Batch: {item.batch} Ã¢â‚¬Â¢ {item.quantity}
                      </Text>
                    </View>
                    <View
                      className={`px-3 py-1 rounded-full ${getStatusColor(
                        item.status
                      )}`}
                    >
                      <Text className="text-xs font-semibold">
                        {item.status}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View className={isDesktop ? "flex-1" : "mb-6"}>
            <View className="bg-white rounded-xl p-6 border border-gray-200">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-gray-900 text-lg font-bold">
                  Subsidy Status
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/dashboard/farmer/subsidy")}
                >
                  <Text className="text-emerald-600 text-sm font-semibold">
                    View All
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="gap-3">
                {mockData.subsidies.slice(0, 3).map((item) => (
                  <View
                    key={item.id}
                    className="flex-row items-center justify-between py-3 border-b border-gray-100"
                  >
                    <View className="flex-1">
                      <Text className="text-gray-900 text-sm font-medium">
                        {item.program}
                      </Text>
                      <Text className="text-gray-500 text-xs mt-1">
                        {item.amount}
                      </Text>
                    </View>
                    <View
                      className={`px-3 py-1 rounded-full ${getStatusColor(
                        item.status
                      )}`}
                    >
                      <Text className="text-xs font-semibold">
                        {item.status}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {isDesktop && (
          <View className="bg-white rounded-xl p-6 border border-gray-200 mt-6">
            <Text className="text-gray-900 text-lg font-bold mb-4">
              Recent Activity
            </Text>
            <View className="gap-4">
              {mockData.timeline.map((item, index) => (
                <View key={index} className="flex-row items-start gap-4">
                  <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center">
                    {item.verified ? (
                      <CheckCircle color="#059669" size={20} />
                    ) : (
                      <Clock color="#6b7280" size={20} />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 text-sm font-medium">
                      {item.status}
                    </Text>
                    <Text className="text-gray-500 text-xs mt-1">
                      {item.date} Ã¢â‚¬Â¢ {item.time}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const headerTitle = useMemo(() => `Welcome back, ${userName}!`, [userName]);
  const headerSubtitle = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    []
  );

  const desktopActionButton = useMemo(
    () => (
      <TouchableOpacity
        onPress={handleAddProduce}
        className="rounded-lg overflow-hidden"
      >
        <LinearGradient
          colors={["#22c55e", "#059669"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex-row items-center gap-2 px-5 py-3"
        >
          <Plus color="#fff" size={20} />
          <Text className="text-white text-[15px] font-semibold">
            Add Produce
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    ),
    [handleAddProduce]
  );

  const layoutMeta = useMemo(
    () => ({
      title: headerTitle,
      subtitle: headerSubtitle,
      notifications,
      onMarkAllRead: handleMarkAllRead,
      onNotificationPress: handleNotificationPress,
      // Don't set farmerName/farmerLocation - let AppLayout fetch real user data
      rightHeaderButton: isDesktop ? desktopActionButton : undefined,
      mobile: {
        floatingAction: isDesktop ? undefined : (
          <TouchableOpacity
            onPress={handleAddProduce}
            className="absolute bottom-20 right-6 rounded-full overflow-hidden shadow-lg"
            style={{ elevation: 5 }}
          >
            <LinearGradient
              colors={["#22c55e", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="w-14 h-14 items-center justify-center"
            >
              <Plus color="#fff" size={28} />
            </LinearGradient>
          </TouchableOpacity>
        ),
      },
    }),
    [
      desktopActionButton,
      handleMarkAllRead,
      handleNotificationPress,
      headerSubtitle,
      headerTitle,
      handleAddProduce,
      isDesktop,
      notifications,
    ]
  );

  useFarmerLayout(layoutMeta);

  return <DashboardContent />;
}
