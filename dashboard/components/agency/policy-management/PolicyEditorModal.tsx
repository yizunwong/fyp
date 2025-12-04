import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CheckCircle, Plus, Save, X } from "lucide-react-native";
import type { PolicyResponseDto } from "@/api";

type EligibilityDefaults = NonNullable<PolicyResponseDto["eligibility"]>;

interface Props {
  visible: boolean;
  policy: PolicyResponseDto | null;
  eligibilityDefaults: EligibilityDefaults;
  isFetchingPolicy: boolean;
  onClose: () => void;
  onChangePolicy: (policy: PolicyResponseDto) => void;
}

export function PolicyEditorModal({
  visible,
  policy,
  eligibilityDefaults,
  isFetchingPolicy,
  onClose,
  onChangePolicy,
}: Props) {
  if (!visible) return null;

  const payoutRule =
    policy?.payoutRule ?? ({ id: "temp-payout-rule", amount: 0, maxCap: 0 } as PolicyResponseDto["payoutRule"]);
  const eligibility = policy?.eligibility ?? eligibilityDefaults;

  const updatePolicy = (updates: Partial<PolicyResponseDto>) => {
    if (!policy) return;
    onChangePolicy({ ...policy, ...updates });
  };

  const updateEligibility = (
    updates: Partial<NonNullable<PolicyResponseDto["eligibility"]>>
  ) => {
    if (!policy) return;
    updatePolicy({
      eligibility: {
        ...eligibility,
        ...updates,
      } as PolicyResponseDto["eligibility"],
    });
  };

  const updatePayoutRule = (
    updates: Partial<NonNullable<PolicyResponseDto["payoutRule"]>>
  ) => {
    if (!policy) return;
    updatePolicy({
      payoutRule: {
        ...payoutRule,
        ...updates,
      } as PolicyResponseDto["payoutRule"],
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-white">
        <ScrollView>
          <View className="px-6 py-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-gray-900 text-xl font-bold">Edit Policy</Text>
              <TouchableOpacity
                onPress={onClose}
                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
              >
                <X color="#6b7280" size={20} />
              </TouchableOpacity>
            </View>

            {isFetchingPolicy && (
              <View className="flex-row items-center gap-2 mb-4">
                <ActivityIndicator size="small" color="#2563eb" />
                <Text className="text-gray-600 text-sm">Loading policy...</Text>
              </View>
            )}

            {policy && (
              <View className="gap-6">
                <View>
                  <Text className="text-gray-700 text-sm font-bold mb-3">
                    A. Policy Basics
                  </Text>
                  <View className="gap-3">
                    <View>
                      <Text className="text-gray-600 text-xs mb-1">
                        Policy Name*
                      </Text>
                      <TextInput
                        value={policy.name}
                        onChangeText={(text) =>
                          updatePolicy({ ...policy, name: text })
                        }
                        placeholder="e.g., Drought Relief Subsidy 2025"
                        className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                        placeholderTextColor="#9ca3af"
                      />
                    </View>

                    <View>
                      <Text className="text-gray-600 text-xs mb-1">
                        Description*
                      </Text>
                      <TextInput
                        value={policy.description || ""}
                        onChangeText={(text) =>
                          updatePolicy({
                            ...policy,
                            description: text,
                          })
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
                      <Text className="text-gray-600 text-xs mb-1">
                        Policy Type*
                      </Text>
                      <View className="flex-row flex-wrap gap-2">
                        {["drought", "flood", "crop_loss", "manual"].map(
                          (type) => (
                            <TouchableOpacity
                              key={type}
                              onPress={() =>
                                updatePolicy({
                                  ...policy,
                                  type: type.toUpperCase() as PolicyResponseDto["type"],
                                })
                              }
                              className={`px-4 py-2 rounded-lg border ${
                                policy.type?.toString().toLowerCase() === type
                                  ? "bg-blue-50 border-blue-500"
                                  : "bg-white border-gray-300"
                              }`}
                            >
                              <Text
                                className={`text-sm font-medium capitalize ${
                                  policy.type?.toString().toLowerCase() === type
                                    ? "text-blue-700"
                                    : "text-gray-700"
                                }`}
                              >
                                {type.replace("_", " ")}
                              </Text>
                            </TouchableOpacity>
                          )
                        )}
                      </View>
                    </View>

                    <View className="flex-row gap-3">
                      <View className="flex-1">
                        <Text className="text-gray-600 text-xs mb-1">
                          Start Date*
                        </Text>
                        <TextInput
                          value={policy.startDate}
                          onChangeText={(text) =>
                            updatePolicy({ ...policy, startDate: text })
                          }
                          placeholder="YYYY-MM-DD"
                          className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                          placeholderTextColor="#9ca3af"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-600 text-xs mb-1">
                          End Date*
                        </Text>
                        <TextInput
                          value={policy.endDate}
                          onChangeText={(text) =>
                            updatePolicy({ ...policy, endDate: text })
                          }
                          placeholder="YYYY-MM-DD"
                          className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                          placeholderTextColor="#9ca3af"
                        />
                      </View>
                    </View>
                  </View>
                </View>

                <View>
                  <Text className="text-gray-700 text-sm font-bold mb-3">
                    B. Eligibility Builder
                  </Text>
                  <View className="gap-3">
                    <View className="flex-row gap-3">
                      <View className="flex-1">
                        <Text className="text-gray-600 text-xs mb-1">
                          Min Farm Size (ha)
                        </Text>
                        <TextInput
                          value={eligibility.minFarmSize?.toString() || ""}
                          onChangeText={(text) =>
                            updateEligibility({
                              minFarmSize: parseFloat(text) || undefined,
                            })
                          }
                          placeholder="0"
                          keyboardType="numeric"
                          className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                          placeholderTextColor="#9ca3af"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-600 text-xs mb-1">
                          Max Farm Size (ha)
                        </Text>
                        <TextInput
                          value={eligibility.maxFarmSize?.toString() || ""}
                          onChangeText={(text) =>
                            updateEligibility({
                              maxFarmSize: parseFloat(text) || undefined,
                            })
                          }
                          placeholder="No limit"
                          keyboardType="numeric"
                          className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                          placeholderTextColor="#9ca3af"
                        />
                      </View>
                    </View>

                    <View>
                      <Text className="text-gray-600 text-xs mb-1">States*</Text>
                      <TextInput
                        value={eligibility?.states?.join(", ")}
                        onChangeText={(text) =>
                          updateEligibility({
                            states: text.split(",").map((s) => s.trim()),
                          })
                        }
                        placeholder="e.g., Kedah, Perlis, Penang"
                        className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                        placeholderTextColor="#9ca3af"
                      />
                    </View>

                    <View>
                      <Text className="text-gray-600 text-xs mb-1">
                        Districts
                      </Text>
                      <TextInput
                        value={eligibility?.districts?.join(", ")}
                        onChangeText={(text) =>
                          updateEligibility({
                            districts: text.split(",").map((s) => s.trim()),
                          })
                        }
                        placeholder="e.g., Kubang Pasu, Kangar (optional)"
                        className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                        placeholderTextColor="#9ca3af"
                      />
                    </View>

                    <View>
                      <Text className="text-gray-600 text-xs mb-1">
                        Crop Types*
                      </Text>
                      <TextInput
                        value={eligibility?.cropTypes?.join(", ")}
                        onChangeText={(text) =>
                          updateEligibility({
                            cropTypes: text.split(",").map((s) => s.trim()),
                          })
                        }
                        placeholder="e.g., Paddy, Vegetables, Fruits"
                        className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                        placeholderTextColor="#9ca3af"
                      />
                    </View>

                    <View>
                      <Text className="text-gray-600 text-xs mb-1">
                        Land Document Types
                      </Text>
                      <TextInput
                        value={(eligibility.landDocumentTypes ?? []).join(", ")}
                        onChangeText={(text) =>
                          updateEligibility({
                            landDocumentTypes: text
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean) as EligibilityDefaults["landDocumentTypes"],
                          })
                        }
                        placeholder="e.g., GERAN_TANAH, LEASE_AGREEMENT"
                        className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                        placeholderTextColor="#9ca3af"
                      />
                    </View>
                  </View>
                </View>

                <View>
                  <Text className="text-gray-700 text-sm font-bold mb-3">
                    D. Subsidy Payout Rules
                  </Text>
                  <View className="gap-3">
                    <View className="flex-row gap-3">
                      <View className="flex-1">
                        <Text className="text-gray-600 text-xs mb-1">
                          Payment Amount (RM)*
                        </Text>
                        <TextInput
                          value={(payoutRule?.amount ?? 0).toString()}
                          onChangeText={(text) =>
                            updatePayoutRule({
                              amount: parseFloat(text) || 0,
                            })
                          }
                          placeholder="e.g., 5000"
                          keyboardType="numeric"
                          className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                          placeholderTextColor="#9ca3af"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-600 text-xs mb-1">
                          Max Cap (RM)*
                        </Text>
                        <TextInput
                          value={(payoutRule?.maxCap ?? 0).toString()}
                          onChangeText={(text) =>
                            updatePayoutRule({
                              maxCap: parseFloat(text) || 0,
                            })
                          }
                          placeholder="e.g., 15000"
                          keyboardType="numeric"
                          className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                          placeholderTextColor="#9ca3af"
                        />
                      </View>
                    </View>
                  </View>
                </View>

                <View className="gap-3 pt-4 border-t border-gray-200">
                  <TouchableOpacity className="rounded-lg overflow-hidden">
                    <LinearGradient
                      colors={["#22c55e", "#15803d"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="flex-row items-center justify-center gap-2 py-3"
                    >
                      <CheckCircle color="#fff" size={20} />
                      <Text className="text-white text-[15px] font-bold">
                        Publish Policy
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity className="flex-row items-center justify-center gap-2 bg-gray-100 border border-gray-300 rounded-lg py-3">
                    <Save color="#6b7280" size={20} />
                    <Text className="text-gray-700 text-[15px] font-bold">
                      Save as Draft
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={onClose}
                    className="flex-row items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg py-3"
                  >
                    <X color="#6b7280" size={20} />
                    <Text className="text-gray-700 text-[15px] font-bold">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

export default PolicyEditorModal;
