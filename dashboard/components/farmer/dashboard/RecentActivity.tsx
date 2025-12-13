import { Text, View } from "react-native";
import { CheckCircle, Clock } from "lucide-react-native";

import { TimelineItem } from "./types";

type Props = {
  timeline: TimelineItem[];
};

const RecentActivity = ({ timeline }: Props) => {
  return (
    <View className="bg-white rounded-xl p-6 border border-gray-200 mt-6">
      <Text className="text-gray-900 text-lg font-bold mb-4">Recent Activity</Text>

      {timeline.length === 0 ? (
        <Text className="text-gray-500 text-sm">No recent activity found.</Text>
      ) : (
        <View className="gap-4">
          {timeline.map((item, index) => (
            <View key={index} className="flex-row items-start gap-4">
              <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center">
                {item.verified ? (
                  <CheckCircle color="#059669" size={20} />
                ) : (
                  <Clock color="#6b7280" size={20} />
                )}
              </View>

              <View className="flex-1">
                <Text className="text-gray-900 text-sm font-medium">
                  {item.status}
                </Text>

                <Text className="text-gray-500 text-xs mt-1">
                  {item.date} | {item.time}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default RecentActivity;
