import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Eye } from "lucide-react-native";
import EthAmountDisplay from "@/components/common/EthAmountDisplay";
import { formatDate } from "@/components/farmer/farm-produce/utils";
import type { SubsidyResponseDto } from "@/api";
import { getStatusColor, getStatusIcon } from "./statusHelpers";

type Props = {
  subsidy: SubsidyResponseDto;
  onViewDetails: (subsidy: SubsidyResponseDto) => void;
  farmerPrograms?: { id: string; name: string }[];
};

const getStatusDisplay = (status: string) => {
  if (status === "APPROVED" || status === "DISBURSED") return "approved";
  if (status === "REJECTED") return "rejected";
  return "pending";
};

const getProgramName = (
  programsId: string | null | undefined,
  farmerPrograms?: { id: string; name: string }[]
) => {
  if (!programsId || !farmerPrograms) return "Unknown Program";
  const program = farmerPrograms.find((p) => p.id === programsId);
  return program?.name || "Unknown Program";
};

export default function SubsidyCard({
  subsidy,
  onViewDetails,
  farmerPrograms,
}: Props) {
  const statusDisplay = getStatusDisplay(subsidy.status);
  const programName = getProgramName(subsidy.programsId, farmerPrograms);

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-3">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-gray-900 dark:text-gray-100 text-base font-bold mb-1">
            {programName}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-xs">{subsidy.id}</Text>
        </View>
        <View
          className={`flex-row items-center gap-1 px-3 py-1 rounded-full ${getStatusColor(
            statusDisplay
          )}`}
        >
          {getStatusIcon(statusDisplay)}
          <Text className="text-xs font-semibold capitalize">
            {statusDisplay}
          </Text>
        </View>
      </View>

      <View className="gap-2 mb-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 dark:text-gray-400 text-sm">Application Date</Text>
          <Text className="text-gray-900 dark:text-gray-100 text-sm font-medium">
            {formatDate(subsidy.createdAt)}
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
