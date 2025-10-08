import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Bell, X, ChevronRight } from "lucide-react-native";

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

interface NotificationDrawerProps {
  notifications: Notification[];
  onMarkAllRead?: () => void;
  onNotificationPress?: (notification: Notification) => void;
}

export default function NotificationDrawer({
  notifications,
  onMarkAllRead,
  onNotificationPress,
}: NotificationDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;
  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleOpen = () => {
    if (isDesktop) {
      setIsOpen(true);
    } else {
      router.push("/notifications");
    }
  };

  const handleClose = () => setIsOpen(false);

  const handleMarkAllRead = () => {
    onMarkAllRead?.();
  };

  const handleNotificationPress = (notification: Notification) => {
    onNotificationPress?.(notification);
  };

  return (
    <>
      <TouchableOpacity
        onPress={handleOpen}
        className="relative p-2 rounded-lg hover:bg-gray-100"
      >
        <Bell color="#6b7280" size={24} />
        {unreadCount > 0 && (
          <View className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
            <Text className="text-white text-xs font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {isDesktop && (
        <Modal
          visible={isOpen}
          transparent
          animationType="fade"
          onRequestClose={handleClose}
        >
          <Pressable
            onPress={handleClose}
            className="flex-1 bg-black/50"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <View className="flex-1" onStartShouldSetResponder={() => true}>
              <Pressable
                onPress={(e) => e.stopPropagation()}
                className={`bg-white/95 shadow-2xl ${
                  Platform.OS === "web"
                    ? "absolute right-0 top-0 bottom-0 w-96"
                    : "absolute right-0 top-0 bottom-0 w-5/6"
                }`}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <View className="flex-1">
                  <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
                    <View className="flex-row items-center gap-3">
                      <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center">
                        <Bell color="#059669" size={20} />
                      </View>
                      <View>
                        <Text className="text-gray-900 text-xl font-bold">
                          Notifications
                        </Text>
                        {unreadCount > 0 && (
                          <Text className="text-gray-600 text-sm">
                            {unreadCount} unread
                          </Text>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={handleClose}
                      className="w-10 h-10 items-center justify-center rounded-lg hover:bg-gray-100"
                    >
                      <X color="#6b7280" size={24} />
                    </TouchableOpacity>
                  </View>

                  {unreadCount > 0 && (
                    <View className="px-6 py-3 border-b border-gray-200">
                      <TouchableOpacity onPress={handleMarkAllRead}>
                        <Text className="text-emerald-600 text-sm font-semibold">
                          Mark all as read
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <ScrollView className="flex-1 px-6 py-4">
                    {notifications.length === 0 ? (
                      <View className="flex-1 items-center justify-center py-12">
                        <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                          <Bell color="#9ca3af" size={32} />
                        </View>
                        <Text className="text-gray-900 text-lg font-semibold mb-1">
                          No notifications
                        </Text>
                        <Text className="text-gray-600 text-sm text-center">
                          You&apos;re all caught up! Check back later for updates.
                        </Text>
                      </View>
                    ) : (
                      <View className="gap-3">
                        {notifications.map((notification) => (
                          <TouchableOpacity
                            key={notification.id}
                            onPress={() =>
                              handleNotificationPress(notification)
                            }
                            className={`flex-row gap-3 p-4 rounded-xl border ${
                              notification.unread
                                ? "bg-emerald-50/80 border-emerald-200"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <View
                              className={`w-10 h-10 rounded-full items-center justify-center ${
                                notification.unread
                                  ? "bg-emerald-100"
                                  : "bg-gray-100"
                              }`}
                            >
                              <Bell
                                color={
                                  notification.unread ? "#059669" : "#6b7280"
                                }
                                size={18}
                              />
                            </View>
                            <View className="flex-1">
                              <View className="flex-row items-start justify-between mb-1">
                                <Text
                                  className={`text-[15px] font-semibold flex-1 ${
                                    notification.unread
                                      ? "text-gray-900"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {notification.title}
                                </Text>
                                {notification.unread && (
                                  <View className="w-2 h-2 bg-emerald-600 rounded-full ml-2 mt-1" />
                                )}
                              </View>
                              <Text className="text-gray-600 text-sm mb-2 leading-5">
                                {notification.message}
                              </Text>
                              <Text className="text-gray-500 text-xs">
                                {notification.time}
                              </Text>
                            </View>
                            <ChevronRight color="#d1d5db" size={18} />
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </ScrollView>
                </View>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  );
}
