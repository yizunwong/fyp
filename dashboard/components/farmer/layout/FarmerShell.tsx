import { ReactNode, useMemo } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  type ViewProps,
} from "react-native";
import { router, usePathname, useRouter } from "expo-router";
import {
  ArrowLeft,
  DollarSign,
  Home,
  Package,
  Sprout,
  Warehouse,
  Settings,
} from "lucide-react-native";
import NotificationDrawer, {
  type Notification,
} from "@/components/ui/NotificationDrawer";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import {
  useFarmerLayoutContext,
  type FarmerBreadcrumb,
  type FarmerLayoutMeta,
  type FarmerMobileLayoutMeta,
} from "./FarmerLayoutContext";
import { LinearGradient } from "expo-linear-gradient";

interface FarmerShellProps {
  children: ReactNode;
}

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
    route: "/dashboard/farmer",
    icon: Home,
  },
  {
    id: "farms",
    label: "Farms",
    route: "/dashboard/farmers/farms",
    icon: Warehouse,
  },
  {
    id: "produce",
    label: "Produce",
    route: "/dashboard/farmer/produce",
    icon: Package,
  },
  {
    id: "subsidy",
    label: "Subsidy",
    route: "/dashboard/farmer/subsidy",
    icon: DollarSign,
  },
  {
    id: "settings",
    label: "Settings",
    route: "/dashboard/farmer/settings",
    icon: Settings,
  },
];

const DEFAULT_NOTIFICATIONS: Notification[] = [
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
];

function resolveActiveTab(pathname: string): string {
  if (
    pathname.includes("/farms") ||
    pathname.includes("/register-farm") ||
    pathname.includes("/farm/")
  ) {
    return "farms";
  }

  if (pathname.includes("/produce") || pathname.includes("/add-produce")) {
    return "produce";
  }

  if (pathname.includes("/subsidy")) {
    return "subsidy";
  }

  if (pathname.includes("/settings")) {
    return "settings";
  }

  return "dashboard";
}

function getInitials(name?: string): string {
  if (!name) return "FM";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "FM";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function Breadcrumbs({ breadcrumbs }: { breadcrumbs?: FarmerBreadcrumb[] }) {
  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null;
  }

  return (
    <View className="flex-row flex-wrap items-center gap-1 mb-2">
      {breadcrumbs.map((crumb, index) => (
        <View key={`${crumb.label}-${index}`} className="flex-row items-center">
          <Text className="text-gray-500 text-xs font-medium">
            {crumb.label}
          </Text>
          {index < breadcrumbs.length - 1 && (
            <Text className="text-gray-400 text-xs mx-2">/</Text>
          )}
        </View>
      ))}
    </View>
  );
}

function Sidebar({
  activeTab,
  farmerName,
  farmerLocation,
}: {
  activeTab: string;
  farmerName?: string;
  farmerLocation?: string;
}) {
  const router = useRouter();

  return (
    <View className="w-64 bg-white border-r border-gray-200 min-h-screen p-6">
      <View className="mb-8">
        <View className="flex-row items-center gap-3 mb-2">
          <View className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl items-center justify-center">
            <Sprout color="#fff" size={24} />
          </View>
          <Text className="text-gray-900 text-xl font-bold">HarvestChain</Text>
        </View>
        <Text className="text-gray-600 text-sm">Farmer Portal</Text>
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
            <Text className="text-emerald-700 text-sm font-semibold">
              {getInitials(farmerName)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 text-sm font-semibold">
              {farmerName ?? "Farmer"}
            </Text>
            <Text className="text-gray-500 text-xs">
              {farmerLocation ?? "Unknown location"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function DesktopHeader({
  meta,
  notifications,
}: {
  meta: FarmerLayoutMeta;
  notifications: Notification[];
}) {
  return (
    <View className="bg-white border-b border-gray-200 px-6 py-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Breadcrumbs breadcrumbs={meta.breadcrumbs} />
          <Text className="text-gray-900 text-2xl font-bold">{meta.title}</Text>
          {!!meta.subtitle && (
            <Text className="text-gray-600 text-sm mt-1">{meta.subtitle}</Text>
          )}
        </View>
        <View className="flex-row items-center gap-3">
          <NotificationDrawer
            notifications={notifications}
            onMarkAllRead={meta.onMarkAllRead}
            onNotificationPress={meta.onNotificationPress}
          />
          {meta.rightHeaderButton}
        </View>
      </View>
    </View>
  );
}

type MobileHeaderProps = {
  title: string;
  subtitle?: string;
  breadcrumbs?: FarmerBreadcrumb[];
  onBack?: () => void;
  containerProps?: ViewProps;
};

function MobileHeader({
  title,
  subtitle,
  breadcrumbs,
  containerProps,
}: MobileHeaderProps) {
  return (
    <LinearGradient
      colors={["#22c55e", "#059669"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="px-6 py-8 pb-14"
      {...containerProps}
    >
      <TouchableOpacity
        onPress={router.back}
        className="flex-row items-center mb-6"
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <ArrowLeft color="#fff" size={24} />
      </TouchableOpacity>

      {/* Breadcrumbs (optional, white-themed) */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <View className="mb-3">
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </View>
      )}

      {/* Header Main Section */}
      <View className="flex-row items-center gap-3">
        <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
          <Warehouse color="#fff" size={24} />
        </View>

        <View className="flex-1">
          <Text className="text-white text-2xl font-bold">{title}</Text>
          {!!subtitle && (
            <Text className="text-white/90 text-sm mt-1">{subtitle}</Text>
          )}
        </View>
      </View>
    </LinearGradient>
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
            <Icon color={isActive ? "#059669" : "#6b7280"} size={22} />
            <Text
              className={`text-xs mt-1 font-semibold ${
                isActive ? "text-emerald-600" : "text-gray-600"
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

export default function FarmerShell({ children }: FarmerShellProps) {
  const { meta } = useFarmerLayoutContext();
  const { isDesktop } = useResponsiveLayout();
  const pathname = usePathname();
  const activeTab = resolveActiveTab(pathname);

  const notifications = meta.notifications ?? DEFAULT_NOTIFICATIONS;
  const mobileMeta: FarmerMobileLayoutMeta = useMemo(
    () => ({
      headerPlacement: "inside",
      backgroundClassName: "bg-gray-50",
      ...meta.mobile,
    }),
    [meta.mobile]
  );

  if (isDesktop) {
    return (
      <View className="flex-1 flex-row bg-gray-50">
        <Sidebar
          activeTab={activeTab}
          farmerName={meta.farmerName}
          farmerLocation={meta.farmerLocation}
        />
        <View className="flex-1">
          <DesktopHeader meta={meta} notifications={notifications} />
          <ScrollView
            className={`flex-1 ${
              mobileMeta.backgroundClassName ?? "bg-gray-50"
            }`}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View className={`flex-1 ${meta.contentClassName ?? ""}`}>
              {children}
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }

  const {
    header,
    headerPlacement = "inside",
    floatingAction,
    hideBottomNav,
    disableScroll,
    contentContainerStyle,
    backgroundClassName = "bg-gray-50",
  } = mobileMeta;

  const resolvedHeader = header ?? (
    <MobileHeader
      title={meta.title}
      subtitle={meta.subtitle}
      breadcrumbs={meta.breadcrumbs}
    />
  );

  const shouldRenderOutsideHeader = headerPlacement === "outside";

  return (
    <View className={`flex-1 ${backgroundClassName}`}>
      {disableScroll ? (
        <View className="flex-1">
          {resolvedHeader}
          <View className="flex-1">{children}</View>
        </View>
      ) : (
        <>
          {shouldRenderOutsideHeader && resolvedHeader}
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              paddingBottom: hideBottomNav ? 24 : 96,
              ...(contentContainerStyle ?? {}),
            }}
          >
            {!shouldRenderOutsideHeader && resolvedHeader}
            {children}
          </ScrollView>
        </>
      )}
      {!hideBottomNav && (
        <BottomNavigation activeTab={activeTab} items={NAVIGATION_ITEMS} />
      )}
      {floatingAction}
    </View>
  );
}
