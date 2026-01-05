import { Text, View } from "react-native";
import { CheckCircle, Clock, FileText, XCircle } from "lucide-react-native";
import type { FarmRegistrationStats } from "./FarmRegistrationTypes";

export function FarmRegistrationSummaryCards({ stats }: { stats: FarmRegistrationStats }) {
  return (
    <View className="flex-row flex-wrap gap-4 mb-6">
      <View className="flex-1 min-w-[180px] bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg items-center justify-center">
            <Clock color="#b45309" size={20} />
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.pending}</Text>
        </View>
        <Text className="text-gray-600 dark:text-gray-400 text-sm font-medium">Pending Review</Text>
        <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">Awaiting verification</Text>
      </View>

      <View className="flex-1 min-w-[180px] bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-lg items-center justify-center">
            <CheckCircle color="#15803d" size={20} />
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.verified}</Text>
        </View>
        <Text className="text-gray-600 dark:text-gray-400 text-sm font-medium">Verified</Text>
        <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">Completed checks</Text>
      </View>

      <View className="flex-1 min-w-[180px] bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-red-50 dark:bg-red-900/30 rounded-lg items-center justify-center">
            <XCircle color="#dc2626" size={20} />
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.rejected}</Text>
        </View>
        <Text className="text-gray-600 dark:text-gray-400 text-sm font-medium">Rejected</Text>
        <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">Requires resubmission</Text>
      </View>

      <View className="flex-1 min-w-[180px] bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg items-center justify-center">
            <FileText color="#2563eb" size={20} />
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.documents}</Text>
        </View>
        <Text className="text-gray-600 dark:text-gray-400 text-sm font-medium">Documents</Text>
        <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">Uploaded for review</Text>
      </View>
    </View>
  );
}
