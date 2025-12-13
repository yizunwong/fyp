import { Text, TouchableOpacity, View } from "react-native";

import { SubsidyStatusItem } from "./types";

type Props = {
  subsidyStatus: SubsidyStatusItem[];
  onViewAll: () => void;
  getStatusColor: (status: string) => string;
};

const SubsidyStatusCard = ({
  subsidyStatus,
  onViewAll,
  getStatusColor,
}: Props) => {
  return (
    <View className="bg-white rounded-xl p-6 border border-gray-200">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-gray-900 text-lg font-bold">Subsidy Status</Text>

        <TouchableOpacity onPress={onViewAll}>
          <Text className="text-emerald-600 text-sm font-semibold">View All</Text>
        </TouchableOpacity>
      </View>

      {subsidyStatus.length === 0 ? (
        <Text className="text-gray-500 text-sm">No subsidy data found.</Text>
      ) : (
        <View className="gap-3">
          {subsidyStatus.slice(0, 3).map((item) => (
            <View
              key={item.id}
              className="flex-row items-center justify-between py-3 border-b border-gray-100"
            >
              <View className="flex-1">
                <Text className="text-gray-900 text-sm font-medium">
                  {item.program}
                </Text>

                <Text className="text-gray-500 text-xs mt-1">{item.amount}</Text>
              </View>

              <View
                className={`px-3 py-1 rounded-full ${getStatusColor(item.status)}`}
              >
                <Text className="text-xs font-semibold">{item.status}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default SubsidyStatusCard;
