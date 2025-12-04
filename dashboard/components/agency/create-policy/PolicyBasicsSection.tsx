import { View, Text, TextInput, TouchableOpacity } from "react-native";
import type { CreatePolicyDtoType } from "@/api";
import type { PolicyForm } from "./types";

interface Props {
  policy: PolicyForm;
  onChange: (policy: PolicyForm) => void;
}

export function PolicyBasicsSection({ policy, onChange }: Props) {
  const updatePolicy = (updates: Partial<PolicyForm>) => {
    onChange({ ...policy, ...updates });
  };

  const updatePayout = (updates: Partial<PolicyForm["payoutRule"]>) => {
    updatePolicy({
      payoutRule: {
        ...policy.payoutRule,
        ...updates,
      },
    });
  };

  return (
    <>
      <View className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <Text className="text-gray-900 text-base font-bold mb-3">
          A. Policy Basics & Payout
        </Text>
        <View className="gap-3">
          <View>
          <Text className="text-gray-600 text-xs mb-1">Policy Name*</Text>
          <TextInput
            value={policy.name}
            onChangeText={(text) => updatePolicy({ name: text })}
            placeholder="e.g., Drought Relief Subsidy 2025"
            className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
            placeholderTextColor="#9ca3af"
          />
        </View>

          <View>
            <Text className="text-gray-600 text-xs mb-1">Description*</Text>
            <TextInput
            value={policy.description}
            onChangeText={(text) =>
                updatePolicy({ description: text })
            }
            placeholder="Brief description of the policy purpose"
            multiline
            numberOfLines={3}
            className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
              placeholderTextColor="#9ca3af"
              style={{ textAlignVertical: "top" }}
            />
          </View>

          <View>
            <Text className="text-gray-600 text-xs mb-1">Policy Type*</Text>
            <View className="flex-row flex-wrap gap-2">
              {["drought", "flood", "crop_loss", "manual"].map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() =>
                    updatePolicy({
                      type: type as CreatePolicyDtoType,
                    })
                  }
                  className={`px-4 py-2 rounded-lg border ${
                    policy.type === type
                      ? "bg-blue-50 border-blue-500"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium capitalize ${
                      policy.type === type ? "text-blue-700" : "text-gray-700"
                    }`}
                  >
                    {type.replace("_", " ")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-gray-600 text-xs mb-1">Start Date*</Text>
              <TextInput
                value={policy.startDate}
                onChangeText={(text) =>
                  updatePolicy({ startDate: text })
                }
                placeholder="YYYY-MM-DD"
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                placeholderTextColor="#9ca3af"
              />
            </View>
            <View className="flex-1">
              <Text className="text-gray-600 text-xs mb-1">End Date*</Text>
              <TextInput
                value={policy.endDate}
                onChangeText={(text) =>
                  updatePolicy({ endDate: text })
                }
                placeholder="YYYY-MM-DD"
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
        </View>
      </View>

      <View className="gap-3 bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
        <Text className="text-blue-900 text-sm font-semibold">
          Payout Configuration
        </Text>
        {policy.type === "flood" ? (
          <Text className="text-blue-800 text-xs">
            Automated payouts run every 1 hour for flood policies (powered by
            Chainlink).
          </Text>
        ) : null}
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-gray-700 text-xs mb-1">
              Payout Amount (RM)*
            </Text>
            <TextInput
              value={policy.payoutRule.amount.toString()}
              onChangeText={(text) =>
                updatePayout({
                  amount: parseFloat(text) || 0,
                })
              }
              placeholder="5000"
              keyboardType="numeric"
              className="bg-white border border-blue-200 rounded-lg px-4 py-3 text-gray-900 text-sm"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View className="flex-1">
            <Text className="text-gray-700 text-xs mb-1">Maximum Cap (RM)</Text>
            <TextInput
              value={policy.payoutRule.maxCap.toString()}
              onChangeText={(text) =>
                updatePayout({
                  maxCap: parseFloat(text) || 0,
                })
              }
              placeholder="15000"
              keyboardType="numeric"
              className="bg-white border border-blue-200 rounded-lg px-4 py-3 text-gray-900 text-sm"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>
      </View>
    </>
  );
}

export default PolicyBasicsSection;
