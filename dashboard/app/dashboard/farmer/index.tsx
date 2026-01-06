import { useCallback, useMemo, useState } from "react";
import { TouchableOpacity } from "react-native";
import {
  CheckCircle,
  DollarSign,
  Package,
  Plus,
  Warehouse,
} from "lucide-react-native";
import useWeather from "@/hooks/useWeather";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import FarmerDashboardContent from "@/components/farmer/dashboard/FarmerDashboardContent";
import {
  Notification,
  KPIItem,
  RecentProduceItem,
  SubsidyStatusItem,
  TimelineItem,
} from "@/components/farmer/dashboard/types";
import { useAuthControllerProfile } from "@/api";
import { useFarmerDashboardStats } from "@/hooks/useDashboard";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useAppLayout } from "@/components/layout";

export default function FarmerDashboardScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [weatherPage, setWeatherPage] = useState(1);
  const [expandedAlerts, setExpandedAlerts] = useState<Set<number>>(new Set());
  const { isDesktop } = useResponsiveLayout();
  const { stats: farmerStats } = useFarmerDashboardStats();
  const { data: profileResponse } = useAuthControllerProfile();
  const {
    alerts: weatherAlerts,
    isLoading: isLoadingWeather,
    total: weatherTotal,
  } = useWeather({ limit: 5, page: weatherPage });
  const userProfile = profileResponse?.data;
  const userName = userProfile?.username || "Farmer";
  const userLocation = `${userProfile?.location ?? "Location not set"}`;

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
    router.push("/dashboard/farmer/produces/create");
  }, []);

  const handleViewAllProduce = useCallback(() => {
    router.push("/dashboard/farmer/produces");
  }, []);

  const handleViewAllSubsidy = useCallback(() => {
    router.push("/dashboard/farmer/subsidies");
  }, []);

  const formatNumber = useCallback((value?: number | null) => {
    if (value === null || value === undefined) return "0";

    return Number(value).toLocaleString("en-US");
  }, []);

  const formatCurrency = useCallback((value?: number | null) => {
    if (value === null || value === undefined) return "$0";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(value));
  }, []);

  const kpis = useMemo<KPIItem[]>(() => {
    if (!farmerStats) return [];

    return [
      {
        label: "Total Farms",
        value: formatNumber(farmerStats.totalFarms),
        icon: Warehouse,
        color: "#22c55e",
      },

      {
        label: "Active Batches",
        value: formatNumber(farmerStats.activeBatches),
        icon: Package,
        color: "#3b82f6",
      },

      {
        label: "Verified Records",
        value: formatNumber(farmerStats.verifiedRecords),
        icon: CheckCircle,
        color: "#8b5cf6",
      },

      {
        label: "Subsidies",
        value: formatCurrency(farmerStats.subsidies),
        icon: DollarSign,
        color: "#f59e0b",
      },
    ];
  }, [farmerStats, formatCurrency, formatNumber]);

  const recentProduce = useMemo<RecentProduceItem[]>(
    () =>
      farmerStats?.recentProduce?.map((item, index) => ({
        id: item.batch || index,
        name: item.name,
        batch: item.batch,
        quantity:
          item.quantity !== undefined && item.unit
            ? `${item.quantity} ${item.unit.toLowerCase?.() || item.unit}`
            : `${item.quantity ?? ""}`.trim(),

        status: item.status,
      })) ?? [],

    [farmerStats]
  );

  const subsidyStatus = useMemo<SubsidyStatusItem[]>(
    () =>
      farmerStats?.subsidyStatus?.map((item, index) => ({
        id: item.program || index,
        program: item.program,
        amount: formatCurrency(item.amount),
        status: item.status,
      })) ?? [],

    [farmerStats, formatCurrency]
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

  const layoutMeta = useMemo(
    () => ({
      title: headerTitle,
      subtitle: headerSubtitle,
      notifications,
      onMarkAllRead: handleMarkAllRead,
      onNotificationPress: handleNotificationPress,

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
      handleMarkAllRead,
      handleNotificationPress,
      headerSubtitle,
      headerTitle,
      handleAddProduce,
      isDesktop,
      notifications,
    ]
  );

  useAppLayout(layoutMeta);

  const timeline: TimelineItem[] = [];

  return (
    <FarmerDashboardContent
      isDesktop={isDesktop}
      kpis={kpis}
      recentProduce={recentProduce}
      subsidyStatus={subsidyStatus}
      timeline={timeline}
      onViewAllProduce={handleViewAllProduce}
      onViewAllSubsidy={handleViewAllSubsidy}
      weatherAlerts={weatherAlerts}
      isLoadingWeather={isLoadingWeather}
      weatherTotal={weatherTotal}
      weatherPage={weatherPage}
      setWeatherPage={setWeatherPage}
      expandedAlerts={expandedAlerts}
      setExpandedAlerts={setExpandedAlerts}
    />
  );
}
