import { View, Text } from "react-native";
import { CheckCircle, FileText, Settings } from "lucide-react-native";

export interface ProgramStats {
  active: number;
  draft: number;
  total: number;
}

interface Props {
  stats: ProgramStats;
  isDesktop: boolean;
  isFetchingPrograms: boolean;
}

export function ProgramSummaryCards({
  stats,
  isDesktop,
  isFetchingPrograms,
}: Props) {
  return (
    <View className={isDesktop ? "flex-row gap-4 mb-6" : "gap-3 mb-6"}>
      <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-lg items-center justify-center">
            <CheckCircle color="#15803d" size={20} />
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.active}
          </Text>
        </View>
        <Text className="text-gray-600 dark:text-gray-400 text-sm font-medium">
          Active Programs
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">
          {isFetchingPrograms ? "Refreshing..." : "Currently enforced"}
        </Text>
      </View>

      <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg items-center justify-center">
            <FileText color="#b45309" size={20} />
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.draft}
          </Text>
        </View>
        <Text className="text-gray-600 dark:text-gray-400 text-sm font-medium">
          Draft Programs
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">Pending review</Text>
      </View>

      <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg items-center justify-center">
            <Settings color="#2563eb" size={20} />
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.total}
          </Text>
        </View>
        <Text className="text-gray-600 dark:text-gray-400 text-sm font-medium">
          Total Programs
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">All time</Text>
      </View>
    </View>
  );
}

export default ProgramSummaryCards;
