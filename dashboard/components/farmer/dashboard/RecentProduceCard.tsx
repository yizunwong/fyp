import { Text, TouchableOpacity, View } from "react-native";

import { RecentProduceItem } from "./types";

type Props = {
  recentProduce: RecentProduceItem[];
  onViewAll: () => void;
  getStatusColor: (status: string) => string;
};

const RecentProduceCard = ({
  recentProduce,
  onViewAll,
  getStatusColor,
}: Props) => {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-gray-900 dark:text-gray-100 text-lg font-bold">Recent Produce</Text>

        <TouchableOpacity onPress={onViewAll}>
          <Text className="text-emerald-600 text-sm font-semibold">View All</Text>
        </TouchableOpacity>
      </View>

      {recentProduce.length === 0 ? (
        <Text className="text-gray-500 dark:text-gray-400 text-sm">No produce data found.</Text>
      ) : (
        <View className="gap-3">
          {recentProduce.slice(0, 3).map((item) => (
            <View
              key={item.id}
              className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700"
            >
              <View className="flex-1">
                <Text className="text-gray-900 dark:text-gray-100 text-sm font-medium">
                  {item.name}
                </Text>

                <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  Batch: {item.batch} | {item.quantity}
                </Text>
              </View>

              <View
                className={`px-3 py-1 rounded-full ${getStatusColor(item.status)}`}
              >
                <Text className="text-xs font-semibold text-gray-900 dark:text-gray-100">{item.status}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default RecentProduceCard;
