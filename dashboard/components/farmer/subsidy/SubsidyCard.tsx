import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Eye } from "lucide-react-native";
import EthAmountDisplay from "@/components/common/EthAmountDisplay";
import { formatDate } from "@/components/farmer/farm-produce/utils";
import type { Subsidy } from "./types";

type Props = {
  subsidy: Subsidy;
  onViewDetails: (subsidy: Subsidy) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
};

export default function SubsidyCard({
  subsidy,
  onViewDetails,
  getStatusColor,
  getStatusIcon,
}: Props) {
  return (
    <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-gray-900 text-base font-bold mb-1">
            {subsidy.programName}
          </Text>
          <Text className="text-gray-500 text-xs">{subsidy.id}</Text>
        </View>
        <View
          className={`flex-row items-center gap-1 px-3 py-1 rounded-full ${getStatusColor(
            subsidy.status
          )}`}
        >
          {getStatusIcon(subsidy.status)}
          <Text className="text-xs font-semibold capitalize">
            {subsidy.status}
          </Text>
        </View>
      </View>

      <View className="gap-2 mb-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">Application Date</Text>
          <Text className="text-gray-900 text-sm font-medium">
            {formatDate(subsidy.applicationDate)}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">Amount</Text>
          <EthAmountDisplay
            ethAmount={subsidy.amount}
            textClassName="text-gray-900 text-sm font-bold"
            myrClassName="text-gray-500 text-xs"
          />
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">Farm</Text>
          <Text className="text-gray-900 text-sm font-medium">
            {subsidy.farmName}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => onViewDetails(subsidy)}
        className="flex-row items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg py-2"
      >
        <Eye color="#059669" size={18} />
        <Text className="text-emerald-700 text-sm font-semibold">
          View Details
        </Text>
      </TouchableOpacity>
    </View>
  );
}
