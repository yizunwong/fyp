import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { useAgencyLayout } from "@/components/agency/layout/AgencyLayoutContext";
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
    amount: 0,
    maxCap: 0,
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

  useAgencyLayout({
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
    const payoutAmount = Number(programs.payoutRule?.amount ?? 0);
    const payoutCap = Number(programs.payoutRule?.maxCap ?? 0);
    if (Number.isNaN(payoutAmount) || payoutAmount <= 0) {
      Toast.show({
        type: "error",
        text1: "Invalid payout amount",
        text2: "Payout amount must be greater than 0 ETH.",
      });
      return;
    }
    if (Number.isNaN(payoutCap) || payoutCap <= 0) {
      Toast.show({
        type: "error",
        text1: "Invalid maximum cap",
        text2: "Maximum cap must be greater than 0 ETH.",
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
      router.push("/dashboard/agency/programs" as never);
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

  const isSubmittingProgram =
    isCreatingProgram || isWriting || isWaitingReceipt;

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
                Create Program
              </Text>
              <Text className="text-gray-600 text-sm">
                Configure eligibility and payouts
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/dashboard/agency/programs" as never)}
            className="px-3 py-2 rounded-lg bg-white border border-gray-200"
          >
            <Text className="text-gray-700 text-sm font-semibold">
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
              isSubmitting={isSubmittingProgram}
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
            isSubmitting={isSubmittingProgram}
          />
          <ProgramPreviewCard programs={programs} compact />
        </View>
      )}
    </ScrollView>
  );
}
