import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Platform,
} from "react-native";
import {
  Home,
  Sprout,
  Package,
  Warehouse,
  DollarSign,
} from "lucide-react-native";
import { router, usePathname } from "expo-router";
import { ReactNode } from "react";
import NotificationDrawer from "@/components/shared/NotificationDrawer";

interface FarmerLayoutProps {
  children: ReactNode;
  headerTitle: string;
  headerSubtitle: string;
  notifications?: any[];
  onMarkAllRead?: () => void;
  onNotificationPress?: (notification: any) => void;
  farmerName?: string;
  farmerLocation?: string;
  rightHeaderButton?: ReactNode;
}

const mockData = {
  farmer: {
    name: "John Farmer",
    location: "Northern Region",
  },
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
  ],
};

export default function FarmerLayout({
  children,
  headerTitle,
  headerSubtitle,
  notifications = mockData.notifications,
  onMarkAllRead = () => {},
  onNotificationPress = () => {},
  farmerName = mockData.farmer.name,
  farmerLocation = mockData.farmer.location,
  rightHeaderButton,
}: FarmerLayoutProps) {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;
  const pathname = usePathname();

  const getActiveTab = () => {
    if (
      pathname.includes("/farm-management") ||
      pathname.includes("/register-farm")
    )
      return "farms";
    if (pathname.includes("/produce") || pathname.includes("/add-produce"))
      return "produce";
    if (pathname.includes("/subsidy")) return "subsidy";
    return "dashboard";
  };

  const activeTab = getActiveTab();

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
          {
            id: "dashboard",
            label: "Dashboard",
            icon: Home,
            route: "/dashboard/farmer",
          },
          {
            id: "farms",
            label: "My Farms",
            icon: Warehouse,
            route: "/dashboard/farmer/farm-management",
          },
          {
            id: "produce",
            label: "Produce",
            icon: Package,
            route: "/dashboard/farmer/produce",
          },
          {
            id: "subsidy",
            label: "Subsidy",
            icon: DollarSign,
            route: "/dashboard/farmer/subsidy",
          },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push(item.route as any)}
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
              {farmerName}
            </Text>
            <Text className="text-gray-500 text-xs">{farmerLocation}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const Header = () => (
    <View className="bg-white border-b border-gray-200 px-6 py-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-gray-900 text-2xl font-bold">
            {headerTitle}
          </Text>
          <Text className="text-gray-600 text-sm mt-1">{headerSubtitle}</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <NotificationDrawer
            notifications={notifications}
            onMarkAllRead={onMarkAllRead}
            onNotificationPress={onNotificationPress}
          />
          {rightHeaderButton}
        </View>
      </View>
    </View>
  );

  if (!isDesktop) {
    return <View className="flex-1">{children}</View>;
  }

  return (
    <View className="flex-1 flex-row">
      <Sidebar />
      <View className="flex-1">
        <Header />
        <ScrollView className="flex-1 bg-gray-50">{children}</ScrollView>
      </View>
    </View>
  );
}
