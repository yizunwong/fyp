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
  Home,
  Sprout,
  Package,
  Settings,
  Plus,
  TrendingUp,
  CheckCircle,
  DollarSign,
  Warehouse,
  Clock,
  AlertCircle,
  Bell,
  ChevronRight,
  FileText,
  Shield,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import NotificationDrawer from '@/components/shared/notification-drawer';

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

export default function FarmerDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notifications, setNotifications] = useState(mockData.notifications);
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const handleNotificationPress = (notification: (typeof notifications)[0]) => {
    console.log("Notification pressed:", notification);
  };

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

  const Sidebar = () => (
    <View className="w-64 bg-white border-r border-gray-200 min-h-screen p-6">
      <View className="mb-8">
        <View className="flex-row items-center gap-3 mb-2">
          <View className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl items-center justify-center">
            <Sprout color="#fff" size={24} />
          </View>
          <Text className="text-gray-900 text-xl font-bold">AgriChain</Text>
        </View>
        <Text className="text-gray-600 text-sm">Farmer Portal</Text>
      </View>

      <View className="gap-2">
        {[
          { id: "dashboard", label: "Dashboard", icon: Home },
          { id: "farms", label: "My Farms", icon: Warehouse },
          { id: "produce", label: "Produce", icon: Package },
          { id: "settings", label: "Settings", icon: Settings },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => setActiveTab(item.id)}
              className={`flex-row items-center gap-3 px-4 py-3 rounded-lg ${
                isActive ? "bg-emerald-50" : "bg-transparent"
              }`}
            >
              <Icon color={isActive ? "#059669" : "#6b7280"} size={20} />
              <Text
                className={`text-[15px] font-medium ${
                  isActive ? "text-emerald-700" : "text-gray-700"
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="mt-auto pt-6 border-t border-gray-200">
        <View className="flex-row items-center gap-3 px-4 py-3">
          <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center">
            <Text className="text-emerald-700 text-sm font-semibold">JF</Text>
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 text-sm font-semibold">
              {mockData.farmer.name}
            </Text>
            <Text className="text-gray-500 text-xs">
              {mockData.farmer.location}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const Header = () => (
    <View className="bg-white border-b border-gray-200 px-6 py-4">
      <View
        className={`flex-row items-center justify-between ${
          isDesktop ? "" : "mb-4"
        }`}
      >
        <View className="flex-1">
          <Text className="text-gray-900 text-2xl font-bold">
            Welcome back, {mockData.farmer.name}!
          </Text>
          <Text className="text-gray-600 text-sm mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>
        <View className="flex-row items-center gap-3">
          <NotificationDrawer
            notifications={notifications}
            onMarkAllRead={handleMarkAllRead}
            onNotificationPress={handleNotificationPress}
          />
          {isDesktop && (
            <TouchableOpacity className="rounded-lg overflow-hidden">
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
          )}
        </View>
      </View>
    </View>
  );

  const KPICards = () => (
    <View className={`gap-4 ${isDesktop ? "flex-row" : ""}`}>
      {mockData.kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <View
            key={index}
            className={`bg-white rounded-xl p-5 border border-gray-200 ${
              isDesktop ? "flex-1" : ""
            }`}
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

  const ProduceList = () => (
    <View className="bg-white rounded-xl p-6 border border-gray-200">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-gray-900 text-lg font-bold">Recent Produce</Text>
        <TouchableOpacity>
          <Text className="text-emerald-600 text-sm font-semibold">
            View All
          </Text>
        </TouchableOpacity>
      </View>

      {isDesktop ? (
        <View>
          <View className="flex-row border-b border-gray-200 pb-3 mb-3">
            <Text className="flex-1 text-gray-600 text-sm font-semibold">
              Product
            </Text>
            <Text className="w-24 text-gray-600 text-sm font-semibold">
              Batch
            </Text>
            <Text className="w-24 text-gray-600 text-sm font-semibold">
              Quantity
            </Text>
            <Text className="w-32 text-gray-600 text-sm font-semibold">
              Status
            </Text>
            <Text className="w-24 text-gray-600 text-sm font-semibold">
              Date
            </Text>
          </View>
          {mockData.produce.map((item) => (
            <View
              key={item.id}
              className="flex-row py-3 border-b border-gray-100"
            >
              <Text className="flex-1 text-gray-900 text-[15px]">
                {item.name}
              </Text>
              <Text className="w-24 text-gray-700 text-[15px]">
                {item.batch}
              </Text>
              <Text className="w-24 text-gray-700 text-[15px]">
                {item.quantity}
              </Text>
              <View className="w-32">
                <View
                  className={`px-3 py-1 rounded-full self-start ${getStatusColor(
                    item.status
                  )}`}
                >
                  <Text className="text-xs font-medium">{item.status}</Text>
                </View>
              </View>
              <Text className="w-24 text-gray-600 text-[15px]">
                {item.date}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View className="gap-3">
          {mockData.produce.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <View className="flex-row items-start justify-between mb-2">
                <Text className="text-gray-900 text-[15px] font-semibold flex-1">
                  {item.name}
                </Text>
                <View
                  className={`px-3 py-1 rounded-full ${getStatusColor(
                    item.status
                  )}`}
                >
                  <Text className="text-xs font-medium">{item.status}</Text>
                </View>
              </View>
              <View className="gap-1">
                <Text className="text-gray-600 text-sm">
                  Batch: {item.batch}
                </Text>
                <Text className="text-gray-600 text-sm">
                  Quantity: {item.quantity}
                </Text>
                <Text className="text-gray-500 text-xs mt-1">{item.date}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const BlockchainTimeline = () => (
    <View className="bg-white rounded-xl p-6 border border-gray-200">
      <View className="flex-row items-center gap-2 mb-4">
        <Shield color="#059669" size={20} />
        <Text className="text-gray-900 text-lg font-bold">
          Blockchain Timeline
        </Text>
      </View>
      <Text className="text-gray-600 text-sm mb-4">
        Batch: BTH-001 (Organic Tomatoes)
      </Text>

      <View className="gap-4">
        {mockData.timeline.map((item, index) => (
          <View key={index} className="flex-row gap-3">
            <View className="items-center">
              <View
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  item.verified ? "bg-emerald-100" : "bg-gray-100"
                }`}
              >
                {item.verified ? (
                  <CheckCircle color="#059669" size={20} />
                ) : (
                  <Clock color="#6b7280" size={20} />
                )}
              </View>
              {index < mockData.timeline.length - 1 && (
                <View className="w-0.5 h-12 bg-gray-200 my-1" />
              )}
            </View>
            <View className="flex-1 pb-4">
              <Text className="text-gray-900 text-[15px] font-semibold mb-1">
                {item.status}
              </Text>
              <Text className="text-gray-600 text-sm">
                {item.date} • {item.time}
              </Text>
              {item.verified && (
                <View className="flex-row items-center gap-1 mt-1">
                  <Shield color="#059669" size={12} />
                  <Text className="text-emerald-600 text-xs font-medium">
                    Blockchain Verified
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const SubsidySection = () => (
    <View className="bg-white rounded-xl p-6 border border-gray-200">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-gray-900 text-lg font-bold">
          Subsidies & Grants
        </Text>
        <TouchableOpacity className="rounded-lg overflow-hidden">
          <LinearGradient
            colors={["#22c55e", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="px-4 py-2"
          >
            <Text className="text-white text-sm font-semibold">Apply New</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View className="gap-3">
        {mockData.subsidies.map((subsidy) => (
          <View
            key={subsidy.id}
            className="border border-gray-200 rounded-lg p-4"
          >
            <View className="flex-row items-start justify-between mb-2">
              <View className="flex-1">
                <Text className="text-gray-900 text-[15px] font-semibold mb-1">
                  {subsidy.program}
                </Text>
                <Text className="text-gray-600 text-sm">
                  Applied on {subsidy.date}
                </Text>
              </View>
              <View
                className={`px-3 py-1 rounded-full ${getStatusColor(
                  subsidy.status
                )}`}
              >
                <Text className="text-xs font-medium">{subsidy.status}</Text>
              </View>
            </View>
            <Text className="text-emerald-600 text-xl font-bold">
              {subsidy.amount}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const QuickStats = () => (
    <View className="bg-white rounded-xl p-6 border border-gray-200">
      <Text className="text-gray-900 text-lg font-bold mb-4">Quick Stats</Text>
      <View className="gap-4">
        <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
          <Text className="text-gray-600 text-sm">This Month&apos;s Revenue</Text>
          <Text className="text-gray-900 text-lg font-bold">$12,450</Text>
        </View>
        <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
          <Text className="text-gray-600 text-sm">Pending Deliveries</Text>
          <Text className="text-gray-900 text-lg font-bold">8</Text>
        </View>
        <View className="flex-row items-center justify-between py-3">
          <Text className="text-gray-600 text-sm">Average Rating</Text>
          <Text className="text-gray-900 text-lg font-bold">4.8/5.0</Text>
        </View>
      </View>
    </View>
  );

  const BottomNav = () => (
    <View className="bg-white border-t border-gray-200">
      <View className="flex-row justify-around py-3">
        {[
          { id: "dashboard", label: "Dashboard", icon: Home },
          { id: "farms", label: "Farms", icon: Warehouse },
          { id: "produce", label: "Produce", icon: Package },
          { id: "settings", label: "Settings", icon: Settings },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => setActiveTab(item.id)}
              className="items-center px-4 py-2"
            >
              <Icon color={isActive ? "#059669" : "#9ca3af"} size={24} />
              <Text
                className={`text-xs mt-1 ${
                  isActive ? "text-emerald-600 font-semibold" : "text-gray-500"
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const FloatingActionButton = () => (
    <TouchableOpacity
      className="absolute bottom-20 right-6 w-14 h-14 rounded-full items-center justify-center"
      style={{
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      }}
    >
      <LinearGradient
        colors={["#22c55e", "#059669"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="w-full h-full rounded-full items-center justify-center"
      >
        <Plus color="#fff" size={28} />
      </LinearGradient>
    </TouchableOpacity>
  );

  const MainContent = () => (
    <ScrollView className="flex-1 bg-gray-50">
      <Header />
      <View className="p-6 gap-6">
        <KPICards />
        <View className={isDesktop ? "flex-row gap-6" : "gap-6"}>
          <View className={isDesktop ? "flex-1" : ""}>
            <ProduceList />
          </View>
          <View className={isDesktop ? "w-96" : ""}>
            <BlockchainTimeline />
          </View>
        </View>
        <View className={isDesktop ? "flex-row gap-6" : "gap-6"}>
          <View className={isDesktop ? "flex-1" : ""}>
            <SubsidySection />
          </View>
          <View className={isDesktop ? "w-96" : ""}>
            <QuickStats />
          </View>
        </View>
      </View>
    </ScrollView>
  );

  if (isDesktop) {
    return (
      <View className="flex-1 flex-row">
        <Sidebar />
        <View className="flex-1">
          <MainContent />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <MainContent />
      <FloatingActionButton />
      <BottomNav />
    </View>
  );
}
