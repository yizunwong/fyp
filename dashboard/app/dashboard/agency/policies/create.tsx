import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { useAgencyLayout } from "@/components/agency/layout/AgencyLayoutContext";
import usePolicy from "@/hooks/usePolicy";
import {
  useAuthControllerProfile,
  type CreatePolicyDto,
  type CreatePolicyDtoStatus,
} from "@/api";
import { useSubsidyPolicyCreation } from "@/hooks/useBlockchain";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { EligibilityBuilder } from "@/components/agency/create-policy/EligibilityBuilder";
import { PolicyBasicsSection } from "@/components/agency/create-policy/PolicyBasicsSection";
import { PolicyPreviewCard } from "@/components/agency/create-policy/PolicyPreviewCard";
import { PolicyActionButtons } from "@/components/agency/create-policy/PolicyActionButtons";

const defaultPolicy: CreatePolicyDto = {
  onchainId: 0,
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
    landDocumentTypes: [],
  },
  payoutRule: {
    amount: 0,
    maxCap: 0,
  },
  createdBy: "",
};

export default function CreatePolicyScreen() {
  const [policy, setPolicy] = useState<CreatePolicyDto>(defaultPolicy);
  const { createPolicy, isCreatingPolicy } = usePolicy();
  const { createPolicyOnChain, isWriting, isWaitingReceipt } =
    useSubsidyPolicyCreation();
  const { isDesktop } = useResponsiveLayout();
  const { data: profileResponse } = useAuthControllerProfile();
  const profileId = profileResponse?.data?.id;

  useAgencyLayout({
    title: "Create Policy",
    subtitle: "Define a new subsidy policy for your agency",
  });

  useEffect(() => {
    if (!profileId) return;
    setPolicy((prev) =>
      prev.createdBy === profileId ? prev : { ...prev, createdBy: profileId }
    );
  }, [profileId]);

  const handleSubmit = async (successMessage: {
    title: string;
    subtitle: string;
  }) => {
    const payoutAmount = Number(policy.payoutRule?.amount ?? 0);
    const payoutCap = Number(policy.payoutRule?.maxCap ?? 0);
    if (Number.isNaN(payoutAmount) || payoutAmount <= 1) {
      Toast.show({
        type: "error",
        text1: "Invalid payout amount",
        text2: "Payout amount must be greater than 1.",
      });
      return;
    }
    if (Number.isNaN(payoutCap) || payoutCap <= 1) {
      Toast.show({
        type: "error",
        text1: "Invalid maximum cap",
        text2: "Maximum cap must be greater than 1.",
      });
      return;
    }

    const policyWithCreator: CreatePolicyDto = {
      ...policy,
      status: "active" as CreatePolicyDtoStatus,
      createdBy: profileId ?? policy.createdBy,
    };

    if (!policyWithCreator.createdBy) {
      Toast.show({
        type: "error",
        text1: "Missing creator",
        text2: "Please re-login to continue creating policies.",
      });
      return;
    }

    try {
      const { policyId } = await createPolicyOnChain(policyWithCreator);
      const payload: CreatePolicyDto = {
        ...policyWithCreator,
        onchainId:
          policyId !== undefined
            ? Number(policyId)
            : policyWithCreator.onchainId,
      };
      await createPolicy(payload);
      setPolicy(payload);
      Toast.show({
        type: "success",
        text1: successMessage.title,
        text2:
          successMessage.subtitle +
          (policyId !== undefined ? ` (On-chain ID: ${policyId})` : ""),
      });
      router.push("/dashboard/agency/policies" as never);
    } catch (error) {
      console.error("Error creating policy:", error);
      Toast.show({
        type: "error",
        text1: "Failed to save policy",
        text2: (error as Error)?.message ?? "Something went wrong",
      });
    }
  };

  const handlePublish = () =>
    handleSubmit({
      title: "Policy published",
      subtitle: "New policy is on-chain and saved in the dashboard",
    });

  const isSubmittingPolicy = isCreatingPolicy || isWriting || isWaitingReceipt;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {!isDesktop && (
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
      )}

      {isDesktop ? (
        <View className="px-6 pb-6 pt-4 flex-row gap-6">
          <View className="flex-1">
            <PolicyBasicsSection policy={policy} onChange={setPolicy} />
            <EligibilityBuilder policy={policy} onChange={setPolicy} />
            <PolicyActionButtons
              onPublish={handlePublish}
              isSubmitting={isSubmittingPolicy}
            />
          </View>
          <View className="w-[360px]">
            <PolicyPreviewCard policy={policy} />
          </View>
        </View>
      ) : (
        <View className="px-6 pb-6 pt-4 gap-6">
          <PolicyBasicsSection policy={policy} onChange={setPolicy} />
          <EligibilityBuilder policy={policy} onChange={setPolicy} />
          <PolicyActionButtons
            onPublish={handlePublish}
            isSubmitting={isSubmittingPolicy}
          />
          <PolicyPreviewCard policy={policy} compact />
        </View>
      )}
    </ScrollView>
  );
}
