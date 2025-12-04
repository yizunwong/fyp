import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { PolicyResponseDto } from "@/api";

interface Props {
  policy: PolicyResponseDto;
  onChangeStatus: (policy: PolicyResponseDto) => void;
  getTypeColor: (type: string | undefined | null) => string;
  getStatusColor: (status: string | undefined | null) => string;
  formatDate: (date: string | Date | undefined | null) => string;
}

export function PolicyCard({
  policy,
  onChangeStatus,
  getTypeColor,
  getStatusColor,
  formatDate,
}: Props) {
  const typeLabel = (policy.type ?? "").toString();
  const statusLabel = (policy.status ?? "").toString();

  return (
    <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-gray-900 text-base font-bold">
              {policy.name}
            </Text>
            <View
              className={`px-2 py-0.5 rounded-full ${getTypeColor(typeLabel)}`}
            >
              <Text className="text-xs font-semibold capitalize">
                {typeLabel.replace("_", " ")}
              </Text>
            </View>
          </View>
          <Text className="text-gray-600 text-sm">
            {policy.description ?? ""}
          </Text>
        </View>
        <View
          className={`px-3 py-1 rounded-full ${getStatusColor(statusLabel)}`}
        >
          <Text className="text-xs font-semibold capitalize">
            {statusLabel.toLowerCase()}
          </Text>
        </View>
      </View>

      <View className="gap-2 mb-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">Period</Text>
          <Text className="text-gray-900 text-sm font-medium">
            {formatDate(policy.startDate)} - {formatDate(policy.endDate)}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">Payout Amount</Text>
          <Text className="text-gray-900 text-sm font-medium">
            RM {(policy.payoutRule?.amount ?? 0).toLocaleString()}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => onChangeStatus(policy)}
        className="rounded-lg overflow-hidden"
      >
        <LinearGradient
          colors={["#2563eb", "#1d4ed8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex-row items-center justify-center gap-2 py-2.5"
        >
          <Text className="text-white text-sm font-semibold">
            Change Status
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

export default PolicyCard;
