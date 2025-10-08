import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Bell, ArrowLeft, ChevronRight } from "lucide-react-native";

const mockNotifications = [
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
  {
    id: 3,
    title: "Payment Received",
    message: "$3,200 deposited to your account",
    time: "1 day ago",
    unread: false,
  },
  {
    id: 4,
    title: "New Subsidy Available",
    message: "Check out the new Crop Insurance program",
    time: "2 days ago",
    unread: false,
  },
  {
    id: 5,
    title: "Delivery Completed",
    message: "Batch BTH-004 successfully delivered",
    time: "3 days ago",
    unread: false,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const unreadCount = mockNotifications.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    console.log("Mark all as read");
  };

  const handleNotificationPress = (
    notification: (typeof mockNotifications)[0]
  ) => {
    console.log("Notification pressed:", notification);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between px-6 py-4 pt-12">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center rounded-lg bg-gray-100"
            >
              <ArrowLeft color="#374151" size={20} />
            </TouchableOpacity>
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
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllRead}>
              <Text className="text-emerald-600 text-sm font-semibold">
                Mark all read
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {mockNotifications.length === 0 ? (
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
            {mockNotifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                onPress={() => handleNotificationPress(notification)}
                className={`flex-row gap-3 p-4 rounded-xl border bg-white ${
                  notification.unread ? "border-emerald-200" : "border-gray-200"
                }`}
              >
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    notification.unread ? "bg-emerald-100" : "bg-gray-100"
                  }`}
                >
                  <Bell
                    color={notification.unread ? "#059669" : "#6b7280"}
                    size={18}
                  />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-start justify-between mb-1">
                    <Text
                      className={`text-[15px] font-semibold flex-1 ${
                        notification.unread ? "text-gray-900" : "text-gray-700"
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
  );
}
