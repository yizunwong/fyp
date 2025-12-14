import { View, Text } from "react-native";
import type { CreateProgramDto } from "@/api";
import { useEthToMyr } from "@/hooks/useEthToMyr";
import { formatCurrency, ethToMyr } from "@/components/farmer/farm-produce/utils";
interface Props {
  programs: CreateProgramDto;
  compact?: boolean;
}

export function ProgramPreviewCard({ programs, compact }: Props) {
  const { ethToMyr: ethToMyrRate } = useEthToMyr();
  const sectionClass = compact ? "gap-2" : "gap-3";
  const formatEthFixed = (amount: number) =>
    `ETH ${amount.toLocaleString("en-MY", {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    })}`;

  return (
    <View className="bg-white rounded-xl border border-gray-200 p-4">
      <Text className="text-gray-900 text-base font-bold mb-2">
        Program Preview
      </Text>
      <View className={sectionClass}>
        <View>
          <Text className="text-gray-500 text-xs">Name</Text>
          <Text className="text-gray-900 text-sm font-semibold">
            {programs.name || "Untitled programs"}
          </Text>
        </View>
        <View>
          <Text className="text-gray-500 text-xs">Type</Text>
          <Text className="text-gray-900 text-sm font-semibold capitalize">
            {programs.type?.replace("_", " ") || "manual"}
          </Text>
        </View>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-gray-500 text-xs">Start Date</Text>
            <Text className="text-gray-900 text-sm font-semibold">
              {programs.startDate || "-"}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-gray-500 text-xs">End Date</Text>
            <Text className="text-gray-900 text-sm font-semibold">
              {programs.endDate || "-"}
            </Text>
          </View>
        </View>
        <View>
          <Text className="text-gray-500 text-xs">Payout</Text>
          <View className="gap-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-gray-900 text-sm font-semibold">
                {formatEthFixed(programs.payoutRule?.amount || 0)}
              </Text>
              {programs.payoutRule?.amount && (
                <Text className="text-gray-500 text-xs">
                  ({formatCurrency(ethToMyr(programs.payoutRule.amount, ethToMyrRate) ?? 0)})
                </Text>
              )}
            </View>
            {programs.payoutRule?.maxCap && (
              <View className="flex-row items-center gap-2">
                <Text className="text-gray-900 text-sm font-semibold">
                  Cap: {formatEthFixed(programs.payoutRule.maxCap)}
                </Text>
                <Text className="text-gray-500 text-xs">
                  ({formatCurrency(ethToMyr(programs.payoutRule.maxCap, ethToMyrRate) ?? 0)})
                </Text>
              </View>
            )}
          </View>
        </View>
        <View>
          <Text className="text-gray-500 text-xs">States</Text>
          <Text className="text-gray-900 text-sm">
            {programs.eligibility?.states?.length
              ? programs.eligibility.states.join(", ")
              : "-"}
          </Text>
        </View>
        <View>
          <Text className="text-gray-500 text-xs">Crop Types</Text>
          <Text className="text-gray-900 text-sm">
            {programs.eligibility?.cropTypes?.length
              ? programs.eligibility.cropTypes.join(", ")
              : "-"}
          </Text>
        </View>
        <View>
          <Text className="text-gray-500 text-xs">Land Documents</Text>
          <Text className="text-gray-900 text-sm">
            {programs.eligibility?.landDocumentTypes?.length
              ? programs.eligibility.landDocumentTypes.join(", ")
              : "-"}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default ProgramPreviewCard;
