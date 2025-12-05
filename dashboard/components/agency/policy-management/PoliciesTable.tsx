import { useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { CreatePolicyDtoStatus, PolicyResponseDto } from "@/api";

interface Props {
  policies: PolicyResponseDto[];
  isWeb: boolean;
  onOpenStatusPicker: (
    policy: PolicyResponseDto,
    anchor?: { x: number; y: number; width: number; height: number }
  ) => void;
  statusOptions: CreatePolicyDtoStatus[];
  onSelectStatus: (policyId: string, status: CreatePolicyDtoStatus) => void;
  getTypeColor: (type: string | undefined | null) => string;
  getStatusColor: (status: string | undefined | null) => string;
  formatDate: (date: string | Date | undefined | null) => string;
}

export function PoliciesTable({
  policies,
  isWeb,
  onOpenStatusPicker,
  statusOptions,
  getStatusColor,
  getTypeColor,
  formatDate,
}: Props) {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  return (
    <View className="relative bg-white rounded-xl border border-gray-200 overflow-visible">
      {isWeb && openDropdownId && (
        <TouchableOpacity
          className="absolute inset-0 z-20"
          activeOpacity={1}
          onPress={() => setOpenDropdownId(null)}
        />
      )}
      <View className="flex-row border-b border-gray-200 px-6 py-4 bg-gray-50 rounded-t-xl">
        <Text className="flex-1 pr-3 text-gray-600 text-xs font-semibold">
          Policy Name
        </Text>
        <Text className="flex-1 pr-3 text-gray-600 text-xs font-semibold">
          Type
        </Text>
        <Text className="flex-1 pr-3 text-gray-600 text-xs font-semibold">
          Active Period
        </Text>
        <Text className="flex-1 pr-3 text-gray-600 text-xs font-semibold">
          Payout
        </Text>
        <Text className="flex-1 pr-3 text-gray-600 text-xs font-semibold">
          Status
        </Text>
        <Text className="flex-1 text-gray-600 text-xs font-semibold text-right">
          Action
        </Text>
      </View>

      <ScrollView className="max-h-[600px] overflow-visible">
        {policies.map((policy) => (
          <View
            key={policy.id}
            className="flex-row items-center px-6 py-4 border-b border-gray-100"
          >
            <View className="flex-1 pr-3">
              <Text
                className="text-gray-900 text-sm font-medium"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {policy.name}
              </Text>
              <Text
                className="text-gray-500 text-xs mt-0.5"
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {policy.description}
              </Text>
            </View>
            <View className="flex-1 pr-3">
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
            <View className="flex-1 pr-3">
              <Text className="text-gray-900 text-xs font-medium">
                {formatDate(policy.startDate)}
              </Text>
              <Text className="text-gray-500 text-xs">
                to {formatDate(policy.endDate)}
              </Text>
            </View>
            <View className="flex-1 pr-3">
              <Text className="text-gray-900 text-xs font-medium">
                RM {(policy.payoutRule?.amount ?? 0).toLocaleString()}
              </Text>
            </View>
            <View className="flex-1 pr-3 items-start">
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
            <View className="flex-1 items-end">
              <View className="relative">
                <TouchableOpacity
                  onPress={() =>
                    isWeb
                      ? setOpenDropdownId((prev) =>
                          prev === policy.id ? null : policy.id
                        )
                      : onOpenStatusPicker(policy)
                  }
                  className="flex-row items-center justify-center gap-1 bg-blue-50 border border-blue-200 rounded-lg py-1.5 px-2"
                >
                  <Text className="text-blue-700 text-xs font-semibold">
                    Change Status
                  </Text>
                </TouchableOpacity>
                {isWeb && openDropdownId === policy.id && (
                  <View className="absolute mt-7 right-0 w-40 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {statusOptions.map((status) => (
                      <TouchableOpacity
                        key={status}
                        onPress={() => {
                          onOpenStatusPicker({
                            ...policy,
                            status,
                          });
                          setOpenDropdownId(null);
                        }}
                        className="px-3 py-2 hover:bg-gray-50"
                      >
                        <Text className="text-sm text-gray-800 capitalize">
                          {status.toLowerCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export default PoliciesTable;
