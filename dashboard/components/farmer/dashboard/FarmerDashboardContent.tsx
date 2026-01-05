import { View } from "react-native";

import FarmerDashboardKpiCards from "./KpiCards";
import MobileHero from "./MobileHero";
import RecentActivity from "./RecentActivity";
import RecentProduceCard from "./RecentProduceCard";
import SubsidyStatusCard from "./SubsidyStatusCard";
import {
  Notification,
  KPIItem,
  RecentProduceItem,
  SubsidyStatusItem,
  TimelineItem,
} from "./types";

type Props = {
  isDesktop: boolean;
  userName: string;
  userLocation: string;
  notifications: Notification[];
  onMarkAllRead: () => void;
  onNotificationPress: (notification: Notification) => void;
  kpis: KPIItem[];
  recentProduce: RecentProduceItem[];
  subsidyStatus: SubsidyStatusItem[];
  timeline: TimelineItem[];
  onViewAllProduce: () => void;
  onViewAllSubsidy: () => void;
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "retailer_verified":
      return "bg-green-100 dark:bg-green-900/90 text-green-700 dark:text-green-400";
    case "onchain_confirmed":
      return "bg-yellow-100 dark:bg-yellow-900/90 text-yellow-700 dark:text-yellow-400";
    case "in_transit":
      return "bg-blue-100 dark:bg-blue-900/90 text-blue-700 dark:text-blue-400";
    case "arrived":
      return "bg-indigo-100 dark:bg-indigo-900/90 text-indigo-700 dark:text-indigo-400";
    case "archived":
      return "bg-gray-100 dark:bg-gray-900/90 text-gray-700 dark:text-gray-400";
    case "disbursed":
      return "bg-emerald-100 dark:bg-emerald-900/90 text-emerald-700 dark:text-emerald-400";
    default:
      return "bg-gray-100 dark:bg-gray-900/90 text-gray-700 dark:text-gray-400";
  }
};

const FarmerDashboardContent = ({
  isDesktop,
  userName,
  userLocation,
  notifications,
  onMarkAllRead,
  onNotificationPress,
  kpis,
  recentProduce,
  subsidyStatus,
  timeline,
  onViewAllProduce,
  onViewAllSubsidy,
}: Props) => {
  return (
    <View className={isDesktop ? "px-6 py-6" : "flex-1"}>
      {!isDesktop && (
        <MobileHero
          userName={userName}
          userLocation={userLocation}
          notifications={notifications}
          onMarkAllRead={onMarkAllRead}
          onNotificationPress={onNotificationPress}
        />
      )}

      <View className={isDesktop ? "" : "px-6 pt-6"}>
        <FarmerDashboardKpiCards kpis={kpis} isDesktop={isDesktop} />

        <View className={isDesktop ? "flex-row gap-6" : ""}>
          <View className={isDesktop ? "flex-1" : "mb-6"}>
            <RecentProduceCard
              recentProduce={recentProduce}
              onViewAll={onViewAllProduce}
              getStatusColor={getStatusColor}
            />
          </View>

          <View className={isDesktop ? "flex-1" : "mb-6"}>
            <SubsidyStatusCard
              subsidyStatus={subsidyStatus}
              onViewAll={onViewAllSubsidy}
              getStatusColor={getStatusColor}
            />
          </View>
        </View>

        {isDesktop && <RecentActivity timeline={timeline} />}
      </View>
    </View>
  );
};

export default FarmerDashboardContent;
