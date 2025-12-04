import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import type { PolicyResponseDto } from "@/api";

interface Props {
  policies: PolicyResponseDto[];
  handleChangeStatus: (policy: PolicyResponseDto) => void;
  getTypeColor: (type: string | undefined | null) => string;
  getStatusColor: (status: string | undefined | null) => string;
  formatDate: (date: string | Date | undefined | null) => string;
}

export function PoliciesTable({
  policies,
  handleChangeStatus,
  getStatusColor,
  getTypeColor,
  formatDate,
}: Props) {
  return (
    <View className="bg-white rounded-xl border border-gray-200">
      <View className="flex-row border-b border-gray-200 px-6 py-4 bg-gray-50 rounded-t-xl">
        <Text className="flex-1 text-gray-600 text-xs font-semibold">
          Policy Name
        </Text>
        <Text className="w-32 text-gray-600 text-xs font-semibold">Type</Text>
        <Text className="w-48 text-gray-600 text-xs font-semibold">
          Active Period
        </Text>
        <Text className="w-40 text-gray-600 text-xs font-semibold">Payout</Text>
        <Text className="w-24 text-gray-600 text-xs font-semibold">Status</Text>
        <Text className="w-24 text-gray-600 text-xs font-semibold">Action</Text>
      </View>

      <ScrollView className="max-h-[600px]">
        {policies.map((policy) => (
          <View
            key={policy.id}
            className="flex-row items-center px-6 py-4 border-b border-gray-100"
          >
            <View className="flex-1">
              <Text className="text-gray-900 text-sm font-medium">
                {policy.name}
              </Text>
              <Text className="text-gray-500 text-xs mt-0.5">
                {policy.description}
              </Text>
            </View>
            <View className="w-32">
              <View
                className={`px-2 py-1 rounded-full self-start ${getTypeColor(
                  policy.type
                )}`}
              >
                <Text className="text-xs font-semibold capitalize">
                  {(policy.type ?? "").toString().replace("_", " ")}
                </Text>
              </View>
            </View>
            <View className="w-48">
              <Text className="text-gray-900 text-xs font-medium">
                {formatDate(policy.startDate)}
              </Text>
              <Text className="text-gray-500 text-xs">
                to {formatDate(policy.endDate)}
              </Text>
            </View>
            <View className="w-40">
              <Text className="text-gray-900 text-xs font-medium">
                RM {(policy.payoutRule?.amount ?? 0).toLocaleString()}
              </Text>
            </View>
            <View className="w-24">
              <View
                className={`px-2 py-1 rounded-full self-start ${getStatusColor(
                  policy.status
                )}`}
              >
                <Text className="text-xs font-semibold capitalize">
                  {(policy.status ?? "").toString().toLowerCase()}
                </Text>
              </View>
            </View>
            <View className="w-24">
              <TouchableOpacity
                onPress={() => handleChangeStatus(policy)}
                className="flex-row items-center justify-center gap-1 bg-blue-50 border border-blue-200 rounded-lg py-1.5 px-2"
              >
                <Text className="text-blue-700 text-xs font-semibold">
                  Change Status
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export default PoliciesTable;
