import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import {
  Home,
  FileCheck,
  CloudRain,
  FileText,
  Shield,
  Users,
  Settings,
  ArrowLeft,
} from "lucide-react-native";
import { router, usePathname, useRouter } from "expo-router";
import { ReactNode, useMemo } from "react";
import NotificationDrawer, {
  type Notification,
} from "@/components/ui/NotificationDrawer";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useAgencyLayoutContext } from "@/components/agency/layout/AgencyLayoutContext";

interface NavigationItem {
  id: string;
  label: string;
  route: string;
  icon: typeof Home;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    route: "/dashboard/agency",
    icon: Home,
  },
  {
    id: "registrations",
    label: "Farm Registrations",
    route: "/dashboard/agency/registrations",
    icon: FileCheck,
  },
  {
    id: "approvals",
    label: "Subsidy Approvals",
    route: "/dashboard/agency/approvals",
    icon: FileText,
  },
  {
    id: "policies",
    label: "Policy Management",
    route: "/dashboard/agency/policies",
    icon: Users,
  },
  {
    id: "settings",
    label: "Settings",
    route: "/dashboard/agency/settings",
    icon: CloudRain,
  },
];

const DEFAULT_NOTIFICATIONS: Notification[] = [
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
];

function resolveActiveTab(pathname: string): string {
  if (pathname.includes("/registrations")) return "registrations";
  if (pathname.includes("/approvals")) return "approvals";
  if (pathname.includes("/weather")) return "weather";
  if (pathname.includes("/policies")) return "policies";
  return "dashboard";
}

function getInitials(name?: string): string {
  if (!name) return "AG";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "AG";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function Sidebar({
  activeTab,
  officerName,
  officerDepartment,
}: {
  activeTab: string;
  officerName?: string;
  officerDepartment?: string;
}) {
  const router = useRouter();

  return (
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
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push(item.route as never)}
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
            <Text className="text-blue-700 text-sm font-semibold">
              {getInitials(officerName)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 text-sm font-semibold">
              {officerName ?? "Officer"}
            </Text>
            <Text className="text-gray-500 text-xs">
              {officerDepartment ?? "Agency"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function DesktopHeader({
  title,
  subtitle,
  notifications,
  onMarkAllRead,
  onNotificationPress,
  rightHeaderButton,
}: {
  title: string;
  subtitle?: string;
  notifications: Notification[];
  onMarkAllRead: () => void;
  onNotificationPress: (n: Notification) => void;
  rightHeaderButton?: ReactNode;
}) {
  return (
    <View className="bg-white border-b border-gray-200 px-6 py-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-gray-900 text-2xl font-bold">{title}</Text>
          {!!subtitle && (
            <Text className="text-gray-600 text-sm mt-1">{subtitle}</Text>
          )}
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
}

function MobileHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const router = useRouter();
  return (
    <View className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-8 pb-10">
      <TouchableOpacity
        onPress={router.back}
        className="flex-row items-center mb-6"
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <ArrowLeft color="#fff" size={22} />
      </TouchableOpacity>
      <View className="flex-row items-center gap-3">
        <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
          <Shield color="#fff" size={24} />
        </View>
        <View className="flex-1">
          <Text className="text-white text-2xl font-bold">{title}</Text>
          {!!subtitle && (
            <Text className="text-white/90 text-sm mt-1">{subtitle}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

function BottomNavigation({
  activeTab,
  items,
}: {
  activeTab: string;
  items: NavigationItem[];
}) {
  const router = useRouter();

  return (
    <View className="bg-white border-t border-gray-200 flex-row items-center justify-around py-3">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            onPress={() => router.push(item.route as never)}
            className="items-center flex-1"
          >
            <Icon color={isActive ? "#2563eb" : "#6b7280"} size={22} />
            <Text
              className={`text-xs mt-1 font-semibold ${
                isActive ? "text-blue-700" : "text-gray-600"
              }`}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function AgencyLayout({ children }: { children: ReactNode }) {
  const { isDesktop } = useResponsiveLayout();
  const pathname = usePathname();
  const { meta } = useAgencyLayoutContext();
  const activeTab = resolveActiveTab(pathname);

  const notifications = meta.notifications ?? DEFAULT_NOTIFICATIONS;
  const onMarkAllRead = meta.onMarkAllRead ?? (() => {});
  const onNotificationPress = meta.onNotificationPress ?? (() => {});

  const mobileContent = useMemo(
    () => (
      <>
        <MobileHeader title={meta.title} subtitle={meta.subtitle} />
        <ScrollView
          className="flex-1 bg-gray-50"
          contentContainerStyle={{ paddingBottom: 96 }}
        >
          {children}
        </ScrollView>
        <BottomNavigation activeTab={activeTab} items={NAVIGATION_ITEMS} />
      </>
    ),
    [activeTab, children, meta.subtitle, meta.title]
  );

  if (!isDesktop) {
    return <View className="flex-1">{mobileContent}</View>;
  }

  return (
    <View className="flex-1 flex-row bg-gray-50">
      <Sidebar
        activeTab={activeTab}
        officerName={meta.officerName}
        officerDepartment={meta.officerDepartment}
      />
      <View className="flex-1">
        <DesktopHeader
          title={meta.title}
          subtitle={meta.subtitle}
          notifications={notifications}
          onMarkAllRead={onMarkAllRead}
          onNotificationPress={onNotificationPress}
          rightHeaderButton={meta.rightHeaderButton}
        />
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="flex-1">{children}</View>
        </ScrollView>
      </View>
    </View>
  );
}
