import { ReactNode, useMemo } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  type ViewProps,
} from "react-native";
import { router, usePathname, useRouter } from "expo-router";
import { ArrowLeft, LucideIcon, Shield } from "lucide-react-native";
import NotificationDrawer, {
  type Notification,
} from "@/components/ui/NotificationDrawer";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import {
  useAppLayoutContext,
  type AppLayoutMeta,
  type Breadcrumb,
  type MobileLayoutMeta,
  type AppRole,
} from "./AppLayoutContext";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthControllerProfile } from "@/api";
import { LoadingState } from "@/components/ui/LoadingState";
import { useSession } from "@/contexts/SessionContext";
import Toast from "react-native-toast-message";

export interface NavigationItem {
  id: string;
  label: string;
  route: string;
  icon: LucideIcon;
}

interface AppLayoutProps {
  children: ReactNode;
  role: AppRole;
  navigationItems: NavigationItem[];
  resolveActiveTab: (pathname: string) => string;
  branding: {
    name: string;
    icon: LucideIcon;
    iconBgColor: string;
    iconColor: string;
    portalLabel: string;
    mobileHeaderGradient: [string, string];
    activeColor: string;
    activeBgColor: string;
  };
}

const DEFAULT_NOTIFICATIONS: Notification[] = [];

function getInitials(name?: string): string {
  if (!name) return "U";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function Breadcrumbs({ breadcrumbs }: { breadcrumbs?: Breadcrumb[] }) {
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
  navigationItems,
  branding,
  userDisplayName,
  userDisplaySubtext,
  role,
  onLogout,
}: {
  activeTab: string;
  navigationItems: NavigationItem[];
  branding: AppLayoutProps["branding"];
  userDisplayName?: string;
  userDisplaySubtext?: string;
  role: AppRole;
  onLogout?: () => Promise<void>;
}) {
  const router = useRouter();
  const Icon = branding.icon;

  return (
    <View className="w-80 bg-white border-r border-gray-200 min-h-screen p-6">
      <View className="mb-8">
        <View className="flex-row items-center gap-3 mb-2">
          <View
            className={`w-12 h-12 rounded-xl items-center justify-center`}
            style={{ backgroundColor: branding.iconBgColor }}
          >
            <Icon color={branding.iconColor} size={24} />
          </View>
          <Text className="text-gray-900 text-xl font-bold">
            {branding.name}
          </Text>
        </View>
        <Text className="text-gray-600 text-sm">{branding.portalLabel}</Text>
      </View>

      <View className="gap-2">
        {navigationItems.map((item) => {
          const ItemIcon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push(item.route as never)}
              className={`flex-row items-center gap-3 px-4 py-3 rounded-lg ${
                isActive ? branding.activeBgColor : "bg-transparent"
              }`}
            >
              <ItemIcon
                color={isActive ? branding.activeColor : "#6b7280"}
                size={20}
              />
              <Text
                className={`text-[15px] font-medium ${
                  isActive
                    ? role === "farmer"
                      ? "text-emerald-700"
                      : "text-blue-700"
                    : "text-gray-700"
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
          <View
            className={`w-10 h-10 rounded-full items-center justify-center ${
              role === "farmer" ? "bg-emerald-100" : "bg-blue-100"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                role === "farmer" ? "text-emerald-700" : "text-blue-700"
              }`}
            >
              {getInitials(userDisplayName)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 text-sm font-semibold">
              {userDisplayName ?? "User"}
            </Text>
            {userDisplaySubtext && (
              <Text className="text-gray-500 text-xs">
                {userDisplaySubtext}
              </Text>
            )}
          </View>
        </View>
        <View className="px-4 pt-2">
          <TouchableOpacity
            onPress={() => onLogout?.()}
            className="mt-2 rounded-lg border border-gray-200 px-4 py-2 bg-gray-50"
          >
            <Text
              className={`text-sm font-semibold text-center ${
                role === "farmer" ? "text-emerald-700" : "text-blue-700"
              }`}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function DesktopHeader({
  meta,
  notifications,
}: {
  meta: AppLayoutMeta;
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
  breadcrumbs?: Breadcrumb[];
  containerProps?: ViewProps;
  branding: AppLayoutProps["branding"];
};

function MobileHeader({
  title,
  subtitle,
  breadcrumbs,
  containerProps,
  branding,
}: MobileHeaderProps) {
  const Icon = branding.icon;

  return (
    <LinearGradient
      colors={branding.mobileHeaderGradient}
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

      {breadcrumbs && breadcrumbs.length > 0 && (
        <View className="mb-3">
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </View>
      )}

      <View className="flex-row items-center gap-3">
        <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
          <Icon color="#fff" size={24} />
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
  branding,
  role,
}: {
  activeTab: string;
  items: NavigationItem[];
  branding: AppLayoutProps["branding"];
  role: AppRole;
}) {
  const router = useRouter();

  return (
    <View className="bg-white border-t border-gray-200 flex-row items-center justify-around py-3">
      {items.map((item) => {
        const ItemIcon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            onPress={() => router.push(item.route as never)}
            className="items-center flex-1"
          >
            <ItemIcon
              color={isActive ? branding.activeColor : "#6b7280"}
              size={22}
            />
            <Text
              className={`text-xs mt-1 font-semibold ${
                isActive
                  ? role === "farmer"
                    ? "text-emerald-600"
                    : "text-blue-700"
                  : "text-gray-600"
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

export default function AppLayout({
  children,
  role,
  navigationItems,
  resolveActiveTab,
  branding,
}: AppLayoutProps) {
  const { meta } = useAppLayoutContext();
  const { isDesktop } = useResponsiveLayout();
  const pathname = usePathname();
  const activeTab = resolveActiveTab(pathname);
  const { signOut } = useSession();
  const routerInstance = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      routerInstance.replace("/login");
      Toast.show({
        type: "success",
        text1: "Logged out",
        text2: "See you soon!",
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "Logout failed",
        text2: "Please try again.",
      });
    }
  };

  const { data: profileResponse, isLoading: isProfileLoading } =
    useAuthControllerProfile({
      query: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
      },
    });
  const userProfile = profileResponse?.data;

  const isProfileDataLoading = isProfileLoading && !profileResponse;
  const isDataLoading = isProfileDataLoading;

  const userUsername = userProfile?.username;
  const userEmailPrefix = userProfile?.email?.split("@")[0];
  const userDisplayName = useMemo(() => {
    return (
      meta.userDisplayName ||
      meta.farmerName ||
      meta.officerName ||
      userUsername ||
      userEmailPrefix ||
      "User"
    );
  }, [
    meta.userDisplayName,
    meta.farmerName,
    meta.officerName,
    userUsername,
    userEmailPrefix,
  ]);

  const userDisplaySubtext = useMemo(() => {
    // Prioritize meta overrides
    if (
      meta.userDisplaySubtext ||
      meta.farmerLocation ||
      meta.officerDepartment
    ) {
      return (
        meta.userDisplaySubtext || meta.farmerLocation || meta.officerDepartment
      );
    }
    // Fallback to email for all roles
    if (userProfile?.email) {
      return userProfile.email;
    }
    return undefined;
  }, [
    meta.userDisplaySubtext,
    meta.farmerLocation,
    meta.officerDepartment,
    userProfile?.email,
  ]);

  const notifications = meta.notifications ?? DEFAULT_NOTIFICATIONS;
  const mobileMeta: MobileLayoutMeta = useMemo(
    () => ({
      headerPlacement: "inside",
      backgroundClassName: "bg-gray-50",
      ...meta.mobile,
    }),
    [meta.mobile]
  );

  // Show loading state until critical data is loaded
  if (isDataLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <LoadingState message="Loading..." />
      </View>
    );
  }

  if (isDesktop) {
    return (
      <View className="flex-1 flex-row bg-gray-50">
        <Sidebar
          activeTab={activeTab}
          navigationItems={navigationItems}
          branding={branding}
          userDisplayName={userDisplayName}
          userDisplaySubtext={userDisplaySubtext}
          role={role}
          onLogout={handleLogout}
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

  const resolvedHeader =
    header ??
    (role === "agency" ? (
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
            <Text className="text-white text-2xl font-bold">{meta.title}</Text>
            {!!meta.subtitle && (
              <Text className="text-white/90 text-sm mt-1">
                {meta.subtitle}
              </Text>
            )}
          </View>
        </View>
      </View>
    ) : (
      <MobileHeader
        title={meta.title}
        subtitle={meta.subtitle}
        breadcrumbs={meta.breadcrumbs}
        branding={branding}
      />
    ));

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
        <BottomNavigation
          activeTab={activeTab}
          items={navigationItems}
          branding={branding}
          role={role}
        />
      )}
      {floatingAction}
    </View>
  );
}
