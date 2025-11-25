import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  CheckCircle,
  Save,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react-native";
import { useAgencyLayout } from "@/components/agency/layout/AgencyLayoutContext";

interface EnvironmentalTrigger {
  parameter: string;
  operator: string;
  threshold: number;
  windowValue: number;
  windowUnit: "hours" | "days";
}

interface EligibilityCriteria {
  minFarmSize?: number;
  maxFarmSize?: number;
  states: string[];
  districts: string[];
  cropTypes: string[];
  certifications: string[];
}

interface PayoutRules {
  amount: number;
  frequency: string;
  maxCap: number;
  beneficiaryCategory: string;
}

interface Policy {
  id: string;
  name: string;
  description: string;
  type: "drought" | "flood" | "crop_loss" | "manual";
  startDate: string;
  endDate: string;
  status: "draft" | "active" | "archived";
  eligibility: EligibilityCriteria;
  environmentalTriggers: EnvironmentalTrigger[];
  payoutRules: PayoutRules;
  createdBy: string;
  lastModified: string;
}

const defaultPolicy: Policy = {
  id: `new-${Date.now()}`,
  name: "",
  description: "",
  type: "manual",
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
  status: "draft",
  eligibility: {
    minFarmSize: undefined,
    maxFarmSize: undefined,
    states: [],
    districts: [],
    cropTypes: [],
    certifications: [],
  },
  environmentalTriggers: [
    {
      parameter: "Rainfall",
      operator: ">",
      threshold: 150,
      windowValue: 24,
      windowUnit: "hours",
    },
  ],
  payoutRules: {
    amount: 0,
    frequency: "per_trigger",
    maxCap: 0,
    beneficiaryCategory: "all_farmers",
  },
  createdBy: "Current Officer",
  lastModified: new Date().toISOString().split("T")[0],
};

export default function CreatePolicyScreen() {
  const [policy, setPolicy] = useState<Policy>(defaultPolicy);

  useAgencyLayout({
    title: "Create Policy",
    subtitle: "Define a new subsidy policy for your agency",
  });

  const updateEligibilityList = (
    field: keyof EligibilityCriteria,
    text: string
  ) => {
    setPolicy((prev) => ({
      ...prev,
      eligibility: {
        ...prev.eligibility,
        [field]: text
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      },
    }));
  };

  const updateTrigger = (
    index: number,
    updates: Partial<EnvironmentalTrigger>
  ) => {
    setPolicy((prev) => ({
      ...prev,
      environmentalTriggers: prev.environmentalTriggers.map((trigger, idx) =>
        idx === index ? { ...trigger, ...updates } : trigger
      ),
    }));
  };

  const addTrigger = () => {
    setPolicy((prev) => ({
      ...prev,
      environmentalTriggers: [
        ...prev.environmentalTriggers,
        {
          parameter: "Rainfall",
          operator: ">",
          threshold: 100,
          windowValue: 24,
          windowUnit: "hours",
        },
      ],
    }));
  };

  const removeTrigger = (index: number) => {
    setPolicy((prev) => ({
      ...prev,
      environmentalTriggers: prev.environmentalTriggers.filter(
        (_, idx) => idx !== index
      ),
    }));
  };

  const handleSaveDraft = () => {
    console.log("Saving draft policy", policy);
  };

  const handlePublish = () => {
    console.log("Publishing policy", policy);
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-white rounded-full items-center justify-center border border-gray-200"
          >
            <ArrowLeft color="#111827" size={20} />
          </TouchableOpacity>
          <View>
            <Text className="text-gray-900 text-xl font-bold">
              Create Policy
            </Text>
            <Text className="text-gray-600 text-sm">
              Configure eligibility, triggers, and payouts
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/dashboard/agency/policies" as never)}
          className="px-3 py-2 rounded-lg bg-white border border-gray-200"
        >
          <Text className="text-gray-700 text-sm font-semibold">
            Back to Policies
          </Text>
        </TouchableOpacity>
      </View>

      <View className="px-6 pb-6">
        <View className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <Text className="text-gray-900 text-base font-bold mb-3">
            A. Policy Basics
          </Text>
          <View className="gap-3">
            <View>
              <Text className="text-gray-600 text-xs mb-1">Policy Name*</Text>
              <TextInput
                value={policy.name}
                onChangeText={(text) => setPolicy({ ...policy, name: text })}
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
                  setPolicy({ ...policy, description: text })
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
                      setPolicy({ ...policy, type: type as Policy["type"] })
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
                  onChangeText={(text) => setPolicy({ ...policy, startDate: text })}
                  placeholder="YYYY-MM-DD"
                  className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-600 text-xs mb-1">End Date*</Text>
                <TextInput
                  value={policy.endDate}
                  onChangeText={(text) => setPolicy({ ...policy, endDate: text })}
                  placeholder="YYYY-MM-DD"
                  className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <Text className="text-gray-900 text-base font-bold mb-3">
            B. Eligibility Builder
          </Text>
          <View className="gap-3">
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-gray-600 text-xs mb-1">
                  Min Farm Size (ha)
                </Text>
                <TextInput
                  value={policy.eligibility.minFarmSize?.toString() || ""}
                  onChangeText={(text) =>
                    setPolicy({
                      ...policy,
                      eligibility: {
                        ...policy.eligibility,
                        minFarmSize: text ? parseFloat(text) : undefined,
                      },
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
                  value={policy.eligibility.maxFarmSize?.toString() || ""}
                  onChangeText={(text) =>
                    setPolicy({
                      ...policy,
                      eligibility: {
                        ...policy.eligibility,
                        maxFarmSize: text ? parseFloat(text) : undefined,
                      },
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
                value={policy.eligibility.states.join(", ")}
                onChangeText={(text) => updateEligibilityList("states", text)}
                placeholder="e.g., Kedah, Perlis, Penang"
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View>
              <Text className="text-gray-600 text-xs mb-1">Districts</Text>
              <TextInput
                value={policy.eligibility.districts.join(", ")}
                onChangeText={(text) => updateEligibilityList("districts", text)}
                placeholder="e.g., Kubang Pasu, Kangar"
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View>
              <Text className="text-gray-600 text-xs mb-1">Crop Types*</Text>
              <TextInput
                value={policy.eligibility.cropTypes.join(", ")}
                onChangeText={(text) => updateEligibilityList("cropTypes", text)}
                placeholder="e.g., Paddy, Vegetables"
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View>
              <Text className="text-gray-600 text-xs mb-1">Certifications</Text>
              <TextInput
                value={policy.eligibility.certifications.join(", ")}
                onChangeText={(text) =>
                  updateEligibilityList("certifications", text)
                }
                placeholder="e.g., MyGAP, Organic"
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
        </View>

        <View className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-900 text-base font-bold">
              C. Environmental Triggers
            </Text>
            <TouchableOpacity
              onPress={addTrigger}
              className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200"
            >
              <Text className="text-blue-700 text-xs font-semibold">
                Add Trigger
              </Text>
            </TouchableOpacity>
          </View>

          <View className="gap-4">
            {policy.environmentalTriggers.map((trigger, index) => (
              <View
                key={`${trigger.parameter}-${index}`}
                className="rounded-lg border border-gray-200 p-3"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-800 text-sm font-semibold">
                    Trigger #{index + 1}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeTrigger(index)}
                    className="px-2 py-1 bg-gray-100 rounded-lg border border-gray-200"
                  >
                    <Text className="text-gray-600 text-xs font-semibold">
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="gap-3">
                  <View>
                    <Text className="text-gray-600 text-xs mb-1">
                      Parameter
                    </Text>
                    <TextInput
                      value={trigger.parameter}
                      onChangeText={(text) =>
                        updateTrigger(index, { parameter: text })
                      }
                      placeholder="Rainfall / Temperature / Wind"
                      className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>

                  <View className="flex-row gap-3">
                    <View className="w-24">
                      <Text className="text-gray-600 text-xs mb-1">
                        Operator
                      </Text>
                      <View className="flex-row flex-wrap gap-2">
                        {[
                          ">",
                          "<",
                          ">=",
                          "<=",
                        ].map((op) => (
                          <TouchableOpacity
                            key={op}
                            onPress={() => updateTrigger(index, { operator: op })}
                            className={`px-3 py-2 rounded-lg border ${
                              trigger.operator === op
                                ? "bg-blue-50 border-blue-500"
                                : "bg-white border-gray-300"
                            }`}
                          >
                            <Text
                              className={`text-sm font-semibold ${
                                trigger.operator === op
                                  ? "text-blue-700"
                                  : "text-gray-700"
                              }`}
                            >
                              {op}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View className="flex-1">
                      <Text className="text-gray-600 text-xs mb-1">
                        Threshold
                      </Text>
                      <TextInput
                        value={trigger.threshold.toString()}
                        onChangeText={(text) =>
                          updateTrigger(index, {
                            threshold: parseFloat(text) || 0,
                          })
                        }
                        placeholder="e.g., 150"
                        keyboardType="numeric"
                        className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                        placeholderTextColor="#9ca3af"
                      />
                    </View>
                  </View>

                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <Text className="text-gray-600 text-xs mb-1">
                        Window Value
                      </Text>
                      <TextInput
                        value={trigger.windowValue.toString()}
                        onChangeText={(text) =>
                          updateTrigger(index, {
                            windowValue: parseFloat(text) || 0,
                          })
                        }
                        placeholder="e.g., 24"
                        keyboardType="numeric"
                        className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                        placeholderTextColor="#9ca3af"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-600 text-xs mb-1">
                        Window Unit
                      </Text>
                      <View className="flex-row gap-2">
                        {["hours", "days"].map((unit) => (
                          <TouchableOpacity
                            key={unit}
                            onPress={() =>
                              updateTrigger(index, {
                                windowUnit: unit as EnvironmentalTrigger["windowUnit"],
                              })
                            }
                            className={`px-4 py-2 rounded-lg border ${
                              trigger.windowUnit === unit
                                ? "bg-blue-50 border-blue-500"
                                : "bg-white border-gray-300"
                            }`}
                          >
                            <Text
                              className={`text-sm font-medium capitalize ${
                                trigger.windowUnit === unit
                                  ? "text-blue-700"
                                  : "text-gray-700"
                              }`}
                            >
                              {unit}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {policy.environmentalTriggers.length === 0 && (
            <View className="flex-row items-center gap-2 mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <AlertTriangle color="#d97706" size={16} />
              <Text className="text-amber-800 text-sm">
                No triggers set. Manual approval will be required.
              </Text>
            </View>
          )}
        </View>

        <View className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <Text className="text-gray-900 text-base font-bold mb-3">
            D. Payout Rules
          </Text>
          <View className="gap-3">
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-gray-600 text-xs mb-1">
                  Payout Amount (RM)*
                </Text>
                <TextInput
                  value={policy.payoutRules.amount.toString()}
                  onChangeText={(text) =>
                    setPolicy({
                      ...policy,
                      payoutRules: {
                        ...policy.payoutRules,
                        amount: parseFloat(text) || 0,
                      },
                    })
                  }
                  placeholder="5000"
                  keyboardType="numeric"
                  className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-600 text-xs mb-1">
                  Maximum Cap (RM)
                </Text>
                <TextInput
                  value={policy.payoutRules.maxCap.toString()}
                  onChangeText={(text) =>
                    setPolicy({
                      ...policy,
                      payoutRules: {
                        ...policy.payoutRules,
                        maxCap: parseFloat(text) || 0,
                      },
                    })
                  }
                  placeholder="15000"
                  keyboardType="numeric"
                  className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View>
              <Text className="text-gray-600 text-xs mb-1">Frequency*</Text>
              <View className="flex-row flex-wrap gap-2">
                {["per_trigger", "annual", "monthly"].map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    onPress={() =>
                      setPolicy({
                        ...policy,
                        payoutRules: { ...policy.payoutRules, frequency: freq },
                      })
                    }
                    className={`px-4 py-2 rounded-lg border ${
                      policy.payoutRules.frequency === freq
                        ? "bg-blue-50 border-blue-500"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium capitalize ${
                        policy.payoutRules.frequency === freq
                          ? "text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      {freq.replace("_", " ")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-gray-600 text-xs mb-1">
                Beneficiary Category*
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {[
                  "all_farmers",
                  "small_medium_farmers",
                  "organic_farmers",
                  "certified_farmers",
                ].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() =>
                      setPolicy({
                        ...policy,
                        payoutRules: {
                          ...policy.payoutRules,
                          beneficiaryCategory: cat,
                        },
                      })
                    }
                    className={`px-4 py-2 rounded-lg border ${
                      policy.payoutRules.beneficiaryCategory === cat
                        ? "bg-blue-50 border-blue-500"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium capitalize ${
                        policy.payoutRules.beneficiaryCategory === cat
                          ? "text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      {cat.replace(/_/g, " ")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View className="gap-3">
          <TouchableOpacity className="rounded-lg overflow-hidden" onPress={handlePublish}>
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

          <TouchableOpacity
            onPress={handleSaveDraft}
            className="flex-row items-center justify-center gap-2 bg-gray-100 border border-gray-300 rounded-lg py-3"
          >
            <Save color="#6b7280" size={20} />
            <Text className="text-gray-700 text-[15px] font-bold">
              Save as Draft
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
