import { View, Text } from "react-native";
import { Archive, CheckCircle, FileText, Settings } from "lucide-react-native";

export interface PolicyStats {
  active: number;
  draft: number;
  archived: number;
  total: number;
}

interface Props {
  stats: PolicyStats;
  isDesktop: boolean;
  isFetchingPolicies: boolean;
}

export function PolicySummaryCards({
  stats,
  isDesktop,
  isFetchingPolicies,
}: Props) {
  return (
    <View className={isDesktop ? "flex-row gap-4 mb-6" : "gap-3 mb-6"}>
      <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-green-50 rounded-lg items-center justify-center">
            <CheckCircle color="#15803d" size={20} />
          </View>
          <Text className="text-2xl font-bold text-gray-900">
            {stats.active}
          </Text>
        </View>
        <Text className="text-gray-600 text-sm font-medium">
          Active Policies
        </Text>
        <Text className="text-gray-500 text-xs mt-1">
          {isFetchingPolicies ? "Refreshing..." : "Currently enforced"}
        </Text>
      </View>

      <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-yellow-50 rounded-lg items-center justify-center">
            <FileText color="#b45309" size={20} />
          </View>
          <Text className="text-2xl font-bold text-gray-900">
            {stats.draft}
          </Text>
        </View>
        <Text className="text-gray-600 text-sm font-medium">
          Draft Policies
        </Text>
        <Text className="text-gray-500 text-xs mt-1">Pending review</Text>
      </View>

      <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-gray-50 rounded-lg items-center justify-center">
            <Archive color="#6b7280" size={20} />
          </View>
          <Text className="text-2xl font-bold text-gray-900">
            {stats.archived}
          </Text>
        </View>
        <Text className="text-gray-600 text-sm font-medium">Archived</Text>
        <Text className="text-gray-500 text-xs mt-1">Past policies</Text>
      </View>

      <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-blue-50 rounded-lg items-center justify-center">
            <Settings color="#2563eb" size={20} />
          </View>
          <Text className="text-2xl font-bold text-gray-900">
            {stats.total}
          </Text>
        </View>
        <Text className="text-gray-600 text-sm font-medium">
          Total Policies
        </Text>
        <Text className="text-gray-500 text-xs mt-1">All time</Text>
      </View>
    </View>
  );
}

export default PolicySummaryCards;
