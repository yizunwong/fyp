import { View, Text } from "react-native";
import type { PolicyForm } from "./types";

interface Props {
  policy: PolicyForm;
  compact?: boolean;
}

export function PolicyPreviewCard({ policy, compact }: Props) {
  const sectionClass = compact ? "gap-2" : "gap-3";

  return (
    <View className="bg-white rounded-xl border border-gray-200 p-4">
      <Text className="text-gray-900 text-base font-bold mb-2">
        Policy Preview
      </Text>
      <View className={sectionClass}>
        <View>
          <Text className="text-gray-500 text-xs">Name</Text>
          <Text className="text-gray-900 text-sm font-semibold">
            {policy.name || "Untitled policy"}
          </Text>
        </View>
        <View>
          <Text className="text-gray-500 text-xs">Type</Text>
          <Text className="text-gray-900 text-sm font-semibold capitalize">
            {policy.type?.replace("_", " ") || "manual"}
          </Text>
        </View>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-gray-500 text-xs">Start Date</Text>
            <Text className="text-gray-900 text-sm font-semibold">
              {policy.startDate || "-"}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-gray-500 text-xs">End Date</Text>
            <Text className="text-gray-900 text-sm font-semibold">
              {policy.endDate || "-"}
            </Text>
          </View>
        </View>
        <View>
          <Text className="text-gray-500 text-xs">Payout</Text>
          <Text className="text-gray-900 text-sm font-semibold">
            RM {policy.payoutRule.amount || 0}
            {policy.payoutRule.maxCap ? ` Cap RM ${policy.payoutRule.maxCap}` : ""}
          </Text>
        </View>
        <View>
          <Text className="text-gray-500 text-xs">States</Text>
          <Text className="text-gray-900 text-sm">
            {policy.eligibility.states?.length
              ? policy.eligibility.states.join(", ")
              : "-"}
          </Text>
        </View>
        <View>
          <Text className="text-gray-500 text-xs">Crop Types</Text>
          <Text className="text-gray-900 text-sm">
            {policy.eligibility.cropTypes?.length
              ? policy.eligibility.cropTypes.join(", ")
              : "-"}
          </Text>
        </View>
        <View>
          <Text className="text-gray-500 text-xs">Land Documents</Text>
          <Text className="text-gray-900 text-sm">
            {policy.eligibility.landDocumentTypes?.length
              ? policy.eligibility.landDocumentTypes.join(", ")
              : "-"}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default PolicyPreviewCard;
