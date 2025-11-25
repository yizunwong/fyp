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
  FileCheck,
  CloudRain,
  FileText,
  Shield,
  Users,
  Settings,
} from "lucide-react-native";
import { router, usePathname } from "expo-router";
import { ReactNode } from "react";
import NotificationDrawer from "@/components/shared/NotificationDrawer";

interface AgencyLayoutProps {
  children: ReactNode;
  headerTitle: string;
  headerSubtitle: string;
  notifications?: any[];
  onMarkAllRead?: () => void;
  onNotificationPress?: (notification: any) => void;
  officerName?: string;
  officerDepartment?: string;
  rightHeaderButton?: ReactNode;
}

const mockData = {
  officer: {
    name: "Ahmad Ismail",
    department: "Agriculture Department",
  },
  notifications: [
    {
      id: 1,
      title: "New Farm Registration",
      message: "Padi Hijau Enterprise requires verification",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 2,
      title: "Critical Weather Alert",
      message: "Flood warning in Kuala Terengganu",
      time: "2 hours ago",
      unread: true,
    },
  ],
};

export default function AgencyLayout({
  children,
  headerTitle,
  headerSubtitle,
  notifications = mockData.notifications,
  onMarkAllRead = () => {},
  onNotificationPress = () => {},
  officerName = mockData.officer.name,
  officerDepartment = mockData.officer.department,
  rightHeaderButton,
}: AgencyLayoutProps) {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;
  const pathname = usePathname();

  const getActiveTab = () => {
    if (pathname.includes("/registrations")) return "registrations";
    if (pathname.includes("/approvals")) return "approvals";
    if (pathname.includes("/weather")) return "weather";
    if (pathname.includes("/policies")) return "policies";
    return "dashboard";
  };

  const activeTab = getActiveTab();

  const Sidebar = () => (
    <View className="w-64 bg-white border-r border-gray-200 min-h-screen p-6">
      <View className="mb-8">
        <View className="flex-row items-center gap-3 mb-2">
          <View className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl items-center justify-center">
            <Shield color="#fff" size={24} />
          </View>
          <Text className="text-gray-900 text-xl font-bold">AgriChain</Text>
        </View>
        <Text className="text-gray-600 text-sm">Government Portal</Text>
      </View>

      <View className="gap-2">
        {[
          {
            id: "dashboard",
            label: "Dashboard",
            icon: Home,
            route: "/dashboard/agency",
          },
          {
            id: "registrations",
            label: "Farm Registrations",
            icon: FileCheck,
            route: "/dashboard/agency/registrations",
          },
          {
            id: "approvals",
            label: "Subsidy Approvals",
            icon: FileText,
            route: "/dashboard/agency/approvals",
          },
          {
            id: "weather",
            label: "Weather Monitor",
            icon: CloudRain,
            route: "/dashboard/agency/weather",
          },
          {
            id: "policies",
            label: "Policy Management",
            icon: Users,
            route: "/dashboard/agency/policies",
          },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push(item.route as any)}
              className={`flex-row items-center gap-3 px-4 py-3 rounded-lg ${
                isActive ? "bg-blue-50" : "bg-transparent"
              }`}
            >
              <Icon color={isActive ? "#2563eb" : "#6b7280"} size={20} />
              <Text
                className={`text-[15px] font-medium ${
                  isActive ? "text-blue-700" : "text-gray-700"
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
          <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
            <Text className="text-blue-700 text-sm font-semibold">AI</Text>
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 text-sm font-semibold">
              {officerName}
            </Text>
            <Text className="text-gray-500 text-xs">{officerDepartment}</Text>
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
