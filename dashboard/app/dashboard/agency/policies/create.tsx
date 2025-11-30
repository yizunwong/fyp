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
import { CheckCircle, Save, ArrowLeft } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { useAgencyLayout } from "@/components/agency/layout/AgencyLayoutContext";
import usePolicy from "@/hooks/usePolicy";
import type {
  CreatePolicyDto,
  CreatePolicyEligibilityDto,
  CreatePolicyDtoStatus,
  CreatePolicyDtoType,
  CreatePayoutRuleDto,
  CreatePayoutRuleDtoBeneficiaryCategory,
  CreatePayoutRuleDtoFrequency,
} from "@/api";

const payoutFrequencies: CreatePayoutRuleDtoFrequency[] = [
  "per_trigger",
  "annual",
  "monthly",
];

const beneficiaryCategories: CreatePayoutRuleDtoBeneficiaryCategory[] = [
  "all_farmers",
  "small_medium_farmers",
  "organic_farmers",
  "certified_farmers",
];

type PolicyForm = Omit<CreatePolicyDto, "eligibility" | "payoutRule"> & {
  eligibility: CreatePolicyEligibilityDto;
  payoutRule: CreatePayoutRuleDto;
  description: string;
  status: CreatePolicyDtoStatus;
};

type EligibilityListField =
  | "states"
  | "districts"
  | "cropTypes"
  | "certifications";

const defaultPolicy: PolicyForm = {
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
  payoutRule: {
    amount: 0,
    frequency: "per_trigger",
    maxCap: 0,
    beneficiaryCategory: "all_farmers",
  },
  createdBy: "Current Officer",
};

export default function CreatePolicyScreen() {
  const [policy, setPolicy] = useState<PolicyForm>(defaultPolicy);
  const { createPolicy, isCreatingPolicy } = usePolicy();

  useAgencyLayout({
    title: "Create Policy",
    subtitle: "Define a new subsidy policy for your agency",
  });

  const updateEligibilityList = (field: EligibilityListField, text: string) => {
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

  const buildPayload = (status: CreatePolicyDtoStatus): CreatePolicyDto => {
    const eligibility = policy.eligibility;
    return {
      name: policy.name,
      description: policy.description || undefined,
      type: policy.type,
      startDate: policy.startDate,
      endDate: policy.endDate,
      status,
      createdBy: policy.createdBy,
      eligibility: {
        ...eligibility,
        states: eligibility?.states?.length ? eligibility.states : undefined,
        districts: eligibility?.districts?.length
          ? eligibility.districts
          : undefined,
        cropTypes: eligibility?.cropTypes?.length
          ? eligibility.cropTypes
          : undefined,
        certifications: eligibility?.certifications?.length
          ? eligibility.certifications
          : undefined,
      },
      payoutRule: {
        ...policy.payoutRule,
        frequency: policy.payoutRule.frequency as CreatePayoutRuleDtoFrequency,
        beneficiaryCategory: policy.payoutRule
          .beneficiaryCategory as CreatePayoutRuleDtoBeneficiaryCategory,
      },
    };
  };

  const handleSaveDraft = async () => {
    try {
      await createPolicy(buildPayload("draft"));
      Toast.show({
        type: "success",
        text1: "Draft saved",
        text2: "Policy created as draft.",
      });
      router.push("/dashboard/agency/policies" as never);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to save draft",
      });
    }
  };

  const handlePublish = async () => {
    try {
      await createPolicy(buildPayload("active"));
      Toast.show({
        type: "success",
        text1: "Policy published",
        text2: "New policy is now active.",
      });
      router.push("/dashboard/agency/policies" as never);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to publish policy",
      });
    }
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
              Configure eligibility and payouts
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
                      setPolicy({
                        ...policy,
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
                    setPolicy({ ...policy, startDate: text })
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
                    setPolicy({ ...policy, endDate: text })
                  }
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
                value={policy?.eligibility?.states?.join(", ")}
                onChangeText={(text) => updateEligibilityList("states", text)}
                placeholder="e.g., Kedah, Perlis, Penang"
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View>
              <Text className="text-gray-600 text-xs mb-1">Districts</Text>
              <TextInput
                value={policy?.eligibility?.districts?.join(", ")}
                onChangeText={(text) =>
                  updateEligibilityList("districts", text)
                }
                placeholder="e.g., Kubang Pasu, Kangar"
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View>
              <Text className="text-gray-600 text-xs mb-1">Crop Types*</Text>
              <TextInput
                value={policy?.eligibility?.cropTypes?.join(", ")}
                onChangeText={(text) =>
                  updateEligibilityList("cropTypes", text)
                }
                placeholder="e.g., Paddy, Vegetables"
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View>
              <Text className="text-gray-600 text-xs mb-1">Certifications</Text>
              <TextInput
                value={policy?.eligibility?.certifications?.join(", ")}
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
          <Text className="text-gray-900 text-base font-bold mb-3">
            C. Payout Rules
          </Text>
          <View className="gap-3">
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-gray-600 text-xs mb-1">
                  Payout Amount (RM)*
                </Text>
                <TextInput
                  value={policy.payoutRule.amount.toString()}
                  onChangeText={(text) =>
                    setPolicy({
                      ...policy,
                      payoutRule: {
                        ...policy.payoutRule,
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
                  value={policy.payoutRule.maxCap.toString()}
                  onChangeText={(text) =>
                    setPolicy({
                      ...policy,
                      payoutRule: {
                        ...policy.payoutRule,
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
                {payoutFrequencies.map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    onPress={() =>
                      setPolicy({
                        ...policy,
                        payoutRule: { ...policy.payoutRule, frequency: freq },
                      })
                    }
                    className={`px-4 py-2 rounded-lg border ${
                      policy.payoutRule.frequency === freq
                        ? "bg-blue-50 border-blue-500"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium capitalize ${
                        policy.payoutRule.frequency === freq
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
                {beneficiaryCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() =>
                      setPolicy({
                        ...policy,
                        payoutRule: {
                          ...policy.payoutRule,
                          beneficiaryCategory: cat,
                        },
                      })
                    }
                    className={`px-4 py-2 rounded-lg border ${
                      policy.payoutRule.beneficiaryCategory === cat
                        ? "bg-blue-50 border-blue-500"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium capitalize ${
                        policy.payoutRule.beneficiaryCategory === cat
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
          <TouchableOpacity
            className="rounded-lg overflow-hidden"
            onPress={handlePublish}
            disabled={isCreatingPolicy}
            style={{ opacity: isCreatingPolicy ? 0.7 : 1 }}
          >
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
            disabled={isCreatingPolicy}
            style={{ opacity: isCreatingPolicy ? 0.7 : 1 }}
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
