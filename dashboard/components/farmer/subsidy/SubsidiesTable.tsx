import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Eye } from "lucide-react-native";
import EthAmountDisplay from "@/components/common/EthAmountDisplay";
import { formatDate } from "@/components/farmer/farm-produce/utils";
import type { SubsidyResponseDto } from "@/api";
import { getStatusColor, getStatusIcon } from "./statusHelpers";

type Props = {
  subsidies: SubsidyResponseDto[];
  isLoading: boolean;
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

export default function SubsidiesTable({
  subsidies,
  isLoading,
  onViewDetails,
  farmerPrograms,
}: Props) {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <View className="flex-row items-center justify-between bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
        <Text className="text-gray-900 dark:text-gray-100 text-lg font-bold">
          Active Subsidies
        </Text>
      </View>

      {isLoading ? (
        <View className="px-6 py-8">
          <Text className="text-gray-500 text-sm text-center">
            Loading subsidies...
          </Text>
        </View>
      ) : subsidies.length === 0 ? (
        <View className="px-6 py-8">
          <Text className="text-gray-500 text-sm text-center">
            No subsidies found. Submit a claim to get started.
          </Text>
        </View>
      ) : (
        <>
          <View className="flex-row bg-gray-50 dark:bg-gray-700 px-6 py-4">
            <Text className="flex-[2] text-gray-500 dark:text-gray-300 text-xs font-semibold uppercase tracking-wide">
              Program Name
            </Text>
            <Text className="flex-[2] text-gray-500 dark:text-gray-300 text-xs font-semibold uppercase tracking-wide">
              Applied Date
            </Text>
            <Text className="flex-[2] text-gray-500 dark:text-gray-300 text-xs font-semibold uppercase tracking-wide">
              Amount
            </Text>
            <Text className="flex-[1.6] text-gray-500 dark:text-gray-300 text-xs font-semibold uppercase tracking-wide">
              Status
            </Text>
            <View className="flex-[0.55] items-end">
              <Text className="text-gray-500 dark:text-gray-300 text-xs font-semibold uppercase tracking-wide">
                Actions
              </Text>
            </View>
          </View>

          {subsidies.map((subsidy, index) => (
            <View
              key={subsidy.id}
                  className={`flex-row items-center px-6 py-5 ${
                index !== 0 ? "border-t border-gray-100 dark:border-gray-700" : ""
              }`}
            >
              <View className="flex-[2]">
                <Text className="text-gray-900 dark:text-gray-100 text-base font-semibold">
                  {getProgramName(subsidy.programsId, farmerPrograms)}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">{subsidy.id}</Text>
              </View>
              <View className="flex-[2]">
                <Text className="text-gray-700 dark:text-gray-300 text-sm">
                  {formatDate(subsidy.createdAt)}
                </Text>
              </View>
              <View className="flex-[2]">
                <EthAmountDisplay
                  ethAmount={subsidy.amount}
                  textClassName="text-gray-900 dark:text-gray-100 text-sm font-semibold"
                  myrClassName="text-gray-500 dark:text-gray-400 text-[10px]"
                />
              </View>
              <View className="flex-[1.6]">
                <View
                  className={`flex-row items-center gap-1 px-2 py-1 rounded-full self-start ${getStatusColor(
                    getStatusDisplay(subsidy.status)
                  )}`}
                >
                  {getStatusIcon(getStatusDisplay(subsidy.status))}
                  <Text className="text-xs font-semibold capitalize">
                    {getStatusDisplay(subsidy.status)}
                  </Text>
                </View>
              </View>
              <View className="flex-[0.6] items-end justify-end">
                <TouchableOpacity
                  onPress={() => onViewDetails(subsidy)}
                  className="flex-row items-center justify-center gap-1 bg-emerald-50 border border-emerald-200 rounded-lg py-2 px-3"
                >
                  <Eye color="#059669" size={16} />
                  <Text className="text-emerald-700 text-xs font-semibold">
                    View
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </>
      )}
    </View>
  );
}
