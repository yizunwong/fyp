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
