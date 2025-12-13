import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import NotificationDrawer from "@/components/ui/NotificationDrawer";

import { Notification } from "./types";

type Props = {
  userName: string;
  userLocation: string;
  notifications: Notification[];
  onMarkAllRead: () => void;
  onNotificationPress: (notification: Notification) => void;
};

const MobileHero = ({
  userName,
  userLocation,
  notifications,
  onMarkAllRead,
  onNotificationPress,
}: Props) => {
  return (
    <LinearGradient
      colors={["#22c55e", "#059669"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="pt-12 pb-8 px-6"
    >
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 bg-white/30 rounded-full items-center justify-center">
            <Text className="text-white text-lg font-bold">
              {userName.slice(0, 2).toUpperCase()}
            </Text>
          </View>

          <View>
            <Text className="text-white text-lg font-bold">{userName}</Text>

            <Text className="text-white/80 text-xs">{userLocation}</Text>
          </View>
        </View>

        <NotificationDrawer
          notifications={notifications}
          onMarkAllRead={onMarkAllRead}
          onNotificationPress={onNotificationPress}
        />
      </View>

      <Text className="text-white text-4xl font-bold mb-2">Data not found</Text>

      <Text className="text-white/90 text-sm">Total revenue this month</Text>
    </LinearGradient>
  );
};

export default MobileHero;
