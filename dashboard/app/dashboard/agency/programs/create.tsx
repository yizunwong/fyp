import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import useProgram from "@/hooks/useProgram";
import {
  useAuthControllerProfile,
  type CreateProgramDto,
  type CreateProgramDtoStatus,
} from "@/api";
import { useSubsidyProgramCreation } from "@/hooks/useBlockchain";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { EligibilityBuilder } from "@/components/agency/create-programs/EligibilityBuilder";
import { ProgramBasicsSection } from "@/components/agency/create-programs/ProgramBasicsSection";
import { ProgramPreviewCard } from "@/components/agency/create-programs/ProgramPreviewCard";
import { ProgramActionButtons } from "@/components/agency/create-programs/ProgramActionButtons";
import { useAppLayout } from '@/components/layout';
const defaultProgram: CreateProgramDto = {
  onchainId: 0,
  name: "",
  description: "",
  type: "flood",
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
    amount: 0.0001,
    maxCap: 0.0001,
  },
  createdBy: "",
};

export default function CreateProgramScreen() {
  const [programs, setProgram] = useState<CreateProgramDto>(defaultProgram);
  const { createProgram, isCreatingProgram } = useProgram();
  const { createProgramOnChain, isWriting, isWaitingReceipt } =
    useSubsidyProgramCreation();
  const { isDesktop } = useResponsiveLayout();
  const { data: profileResponse } = useAuthControllerProfile();
  const profileId = profileResponse?.data?.id;

  useAppLayout({
    title: "Create Program",
    subtitle: "Define a new subsidy programs for your agency",
  });

  useEffect(() => {
    if (!profileId) return;
    setProgram((prev) =>
      prev.createdBy === profileId ? prev : { ...prev, createdBy: profileId }
    );
  }, [profileId]);

  const handleSubmit = async (successMessage: {
    title: string;
    subtitle: string;
  }) => {
    const minPayout = 0.0001;
    const payoutAmount = Number(programs.payoutRule?.amount ?? 0);
    const payoutCap = Number(programs.payoutRule?.maxCap ?? 0);
    if (Number.isNaN(payoutAmount) || payoutAmount < minPayout) {
      Toast.show({
        type: "error",
        text1: "Invalid payout amount",
        text2: `Payout amount must be at least ${minPayout.toFixed(4)} ETH.`,
      });
      return;
    }
    if (Number.isNaN(payoutCap) || payoutCap < minPayout) {
      Toast.show({
        type: "error",
        text1: "Invalid maximum cap",
        text2: `Maximum cap must be at least ${minPayout.toFixed(4)} ETH.`,
      });
      return;
    }

    const programsWithCreator: CreateProgramDto = {
      ...programs,
      status: "active" as CreateProgramDtoStatus,
      createdBy: profileId ?? programs.createdBy,
    };

    if (!programsWithCreator.createdBy) {
      Toast.show({
        type: "error",
        text1: "Missing creator",
        text2: "Please re-login to continue creating programs.",
      });
      return;
    }

    try {
      const { programsId } = await createProgramOnChain(programsWithCreator);
      const payload: CreateProgramDto = {
        ...programsWithCreator,
        onchainId:
          programsId !== undefined
            ? Number(programsId)
            : programsWithCreator.onchainId,
      };
      await createProgram(payload);
      setProgram(payload);
      Toast.show({
        type: "success",
        text1: successMessage.title,
        text2:
          successMessage.subtitle +
          (programsId !== undefined ? ` (On-chain ID: ${programsId})` : ""),
      });
      router.push("/dashboard/agency/programs");
    } catch (error) {
      console.error("Error creating programs:", error);
      Toast.show({
        type: "error",
        text1: "Failed to save programs",
        text2: (error as Error)?.message ?? "Something went wrong",
      });
    }
  };

  const handlePublish = () =>
    handleSubmit({
      title: "Program published",
      subtitle: "New programs is on-chain and saved in the dashboard",
    });

  const handleSaveDraft = async () => {
    const programsWithCreator: CreateProgramDto = {
      ...programs,
      status: "draft",
      createdBy: profileId ?? programs.createdBy,
    };

    if (!programsWithCreator.createdBy) {
      Toast.show({
        type: "error",
        text1: "Missing creator",
        text2: "Please re-login to continue creating programs.",
      });
      return;
    }

    try {
      await createProgram(programsWithCreator);
      Toast.show({
        type: "success",
        text1: "Draft saved",
        text2: "Program has been saved as draft.",
      });
      router.push("/dashboard/agency/programs" as never);
    } catch (error) {
      console.error("Error saving draft:", error);
      Toast.show({
        type: "error",
        text1: "Failed to save draft",
        text2: (error as Error)?.message ?? "Something went wrong",
      });
    }
  };

  const isSubmittingProgram =
    isCreatingProgram || isWriting || isWaitingReceipt;

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {!isDesktop && (
        <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full items-center justify-center border border-gray-200 dark:border-gray-700"
            >
              <ArrowLeft color="#111827" size={20} />
            </TouchableOpacity>
            <View>
              <Text className="text-gray-900 dark:text-gray-100 text-xl font-bold">
                Create Program
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                Configure eligibility and payouts
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/dashboard/agency/programs" as never)}
            className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          >
            <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold">
              Back to Programs
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {isDesktop ? (
        <View className="px-6 pb-6 pt-4 flex-row gap-6">
          <View className="flex-1">
            <ProgramBasicsSection programs={programs} onChange={setProgram} />
            <EligibilityBuilder programs={programs} onChange={setProgram} />
            <ProgramActionButtons
              onPublish={handlePublish}
              onSaveDraft={handleSaveDraft}
              isSubmitting={isSubmittingProgram}
              isSavingDraft={isCreatingProgram}
            />
          </View>
          <View className="w-[360px]">
            <ProgramPreviewCard programs={programs} />
          </View>
        </View>
      ) : (
        <View className="px-6 pb-6 pt-4 gap-6">
          <ProgramBasicsSection programs={programs} onChange={setProgram} />
          <EligibilityBuilder programs={programs} onChange={setProgram} />
          <ProgramActionButtons
            onPublish={handlePublish}
            onSaveDraft={handleSaveDraft}
            isSubmitting={isSubmittingProgram}
            isSavingDraft={isCreatingProgram}
          />
          <ProgramPreviewCard programs={programs} compact />
        </View>
      )}
    </ScrollView>
  );
}
