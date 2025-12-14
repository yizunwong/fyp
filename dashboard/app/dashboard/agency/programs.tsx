import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Archive, Plus } from "lucide-react-native";
import { router } from "expo-router";
import { useAgencyLayout } from "@/components/agency/layout/AgencyLayoutContext";
import {
  useProgramsQuery,
  useUpdateProgramStatusMutation,
} from "@/hooks/useProgram";
import {
  ProgramResponseDtoStatus,
  type ProgramResponseDto,
  type CreateProgramDto,
  type CreateProgramDtoStatus,
} from "@/api";
import { ProgramsTable } from "@/components/agency/programs-management/ProgramsTable";
import { ProgramCard } from "@/components/agency/programs-management/ProgramCard";
import {
  ProgramSummaryCards,
  ProgramStats,
} from "@/components/agency/programs-management/ProgramSummaryCards";
import { formatDate } from "@/components/farmer/farm-produce/utils";
import Toast from "react-native-toast-message";
import { parseError } from "@/utils/format-error";
import { useSubsidyProgramCreation } from "@/hooks/useBlockchain";
import { ProgramType } from "@/components/agency/create-programs/types";

export default function ProgramManagementScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;
  useAgencyLayout({
    title: "Program Management",
    subtitle: "Create and manage subsidy programs",
  });

  const {
    programs: programsDtos,
    isLoading: isLoadingPrograms,
    isFetching: isFetchingPrograms,
    error: programsError,
    refetch: refetchPrograms,
  } = useProgramsQuery();
  const { updateProgramStatus, isUpdatingStatus } =
    useUpdateProgramStatusMutation();
  const { createProgramOnChain, isWriting, isWaitingReceipt } =
    useSubsidyProgramCreation();
  const [programs, setPrograms] = useState<ProgramResponseDto[]>([]);
  const [statusPickerProgram, setStatusPickerProgram] =
    useState<ProgramResponseDto | null>(null);

  useEffect(() => {
    setPrograms(programsDtos ?? []);
  }, [programsDtos]);

  const stats = useMemo<ProgramStats>(
    () => ({
      active: programs.filter(
        (p) => (p.status ?? "").toString().toLowerCase() === "active"
      ).length,
      draft: programs.filter(
        (p) => (p.status ?? "").toString().toLowerCase() === "draft"
      ).length,
      archived: programs.filter(
        (p) => (p.status ?? "").toString().toLowerCase() === "archived"
      ).length,
      total: programs.length,
    }),
    [programs]
  );

  const getStatusColor = (status: string | undefined | null) => {
    const statusValue = (status ?? "").toString().toLowerCase();
    switch (statusValue) {
      case "active":
        return "bg-green-100 text-green-700";
      case "draft":
        return "bg-yellow-100 text-yellow-700";
      case "archived":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeColor = (type: string | undefined | null) => {
    const typeValue = (type ?? "").toString().toLowerCase();
    switch (typeValue) {
      case "drought":
        return "bg-orange-100 text-orange-700";
      case "flood":
        return "bg-blue-100 text-blue-700";
      case "crop_loss":
        return "bg-red-100 text-red-700";
      case "manual":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const statusOrder: ProgramResponseDtoStatus[] = [
    ProgramResponseDtoStatus.draft,
    ProgramResponseDtoStatus.active,
    ProgramResponseDtoStatus.archived,
  ];

  const normalizeStatus = (
    status?: ProgramResponseDtoStatus | string | null
  ) => (status ?? "").toString().toLowerCase();

  const getAvailableStatuses = (
    currentStatus?: ProgramResponseDtoStatus | null
  ) => {
    const currentStatusNormalized = normalizeStatus(currentStatus);
    return statusOrder.filter((status) => {
      const normalizedStatus = normalizeStatus(status);
      return (
        normalizedStatus !== currentStatusNormalized &&
        !(
          currentStatusNormalized === ProgramResponseDtoStatus.active &&
          normalizedStatus === ProgramResponseDtoStatus.draft
        )
      );
    });
  };

  const handleSelectStatus = async (
    programsId: string,
    status: ProgramResponseDto["status"]
  ) => {
    const program = programs.find((p) => p.id === programsId);
    const targetStatus = status;
    const currentStatusNormalized = normalizeStatus(program?.status);
    const targetStatusNormalized = normalizeStatus(targetStatus);
    console.log(program);
    if (
      currentStatusNormalized === ProgramResponseDtoStatus.active &&
      targetStatusNormalized === ProgramResponseDtoStatus.draft
    ) {
      Toast.show({
        type: "error",
        text1: "Invalid transition",
        text2: "Active programs cannot be moved back to draft.",
      });
      return;
    }

    if (!program) {
      setStatusPickerProgram(null);
      return;
    }

    try {
      let nextOnchainId = program.onchainId;

      if (targetStatus === ProgramResponseDtoStatus.active) {
        if (!program.createdBy) {
          Toast.show({
            type: "error",
            text1: "Missing creator",
            text2: "Creator information is required before activating.",
          });
          return;
        }
        if (!program.payoutRule) {
          Toast.show({
            type: "error",
            text1: "Missing payout rule",
            text2: "Please add a payout rule before activating.",
          });
          return;
        }

        const programsWithCreator: CreateProgramDto = {
          onchainId: Number(program.onchainId ?? 1),
          name: program.name,
          description: program.description ?? "",
          type: program.type.toLowerCase() as ProgramType,
          startDate: program.startDate,
          endDate: program.endDate,
          status: "active",
          createdBy: program.createdBy,
          eligibility: program.eligibility
            ? {
                minFarmSize: program.eligibility.minFarmSize ?? undefined,
                maxFarmSize: program.eligibility.maxFarmSize ?? undefined,
                states: program.eligibility.states ?? [],
                districts: program.eligibility.districts ?? [],
                cropTypes: program.eligibility.cropTypes ?? [],
                landDocumentTypes: program.eligibility.landDocumentTypes ?? [],
              }
            : undefined,
          payoutRule: {
            amount: Number(program.payoutRule?.amount ?? 0),
            maxCap: Number(program.payoutRule?.maxCap ?? 0),
          },
        };

        const { programsId: chainProgramsId } = await createProgramOnChain(
          programsWithCreator
        );
        console.log(programsWithCreator.payoutRule);
        if (chainProgramsId !== undefined) {
          nextOnchainId = Number(chainProgramsId);
        }
      }

      console.log(nextOnchainId);

      await updateProgramStatus(programsId, { status: targetStatus });
      setPrograms((prev) =>
        prev.map((p) =>
          p.id === programsId
            ? { ...p, status: targetStatus, onchainId: nextOnchainId }
            : p
        )
      );
      Toast.show({
        type: "success",
        text1: "Status updated",
        text2: `Program marked as ${targetStatusNormalized}`,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to update",
        text2: parseError(error),
      });
    } finally {
      setStatusPickerProgram(null);
    }
  };

  const isInitialLoading =
    (isLoadingPrograms || isFetchingPrograms) && programs.length === 0;
  const shouldShowEmptyState =
    !isLoadingPrograms && !isFetchingPrograms && programs.length === 0;
  const formatList = (values?: string[] | null, fallback = "Any") =>
    values && values.length > 0 ? values.join(", ") : fallback;
  const formatEthFixed = (amount: number) =>
    amount.toLocaleString("en-MY", {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    });
  const isProcessingStatusChange =
    isUpdatingStatus || isWriting || isWaitingReceipt;

  if (isInitialLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-700 mt-3">Loading programs...</Text>
      </View>
    );
  }

  if (programsError && programs.length > 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-gray-900 text-xl font-bold mb-2">
          Failed to load programs
        </Text>
        <Text className="text-gray-600 text-sm mb-4">
          {programsError as string}
        </Text>
        <TouchableOpacity
          onPress={() => refetchPrograms()}
          className="px-4 py-2 bg-blue-600 rounded-lg"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const pageContent = (
    <View className="px-6 py-6">
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-gray-900 text-xl font-bold">
            Program Management
          </Text>
          <Text className="text-gray-600 text-sm">
            Create and manage subsidy programs
          </Text>
        </View>
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => router.push("/dashboard/agency/programs/create")}
            className="flex-row items-center gap-2 px-4 py-2 bg-blue-500 rounded-lg"
          >
            <Plus color="#fff" size={18} />
            <Text className="text-white text-sm font-semibold">
              Create Program
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg">
            <Archive color="#6b7280" size={18} />
            <Text className="text-gray-700 text-sm font-semibold">
              Archived
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ProgramSummaryCards
        stats={stats}
        isDesktop={isDesktop}
        isFetchingPrograms={isFetchingPrograms}
      />
      {shouldShowEmptyState ? (
        <View className="bg-white border border-dashed border-gray-300 rounded-xl p-6 items-center justify-center">
          <Text className="text-gray-900 text-base font-semibold">
            No programs found
          </Text>
          <Text className="text-gray-600 text-sm mt-1 text-center">
            Create a new programs to get started or refresh to fetch the latest
            records.
          </Text>
          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
              onPress={() => refetchPrograms()}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg"
            >
              <Text className="text-gray-800 text-sm font-semibold">
                Refresh
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                router.push("/dashboard/agency/programs/create" as never)
              }
              className="px-4 py-2 bg-blue-500 rounded-lg"
            >
              <Text className="text-white text-sm font-semibold">
                Create Program
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : isDesktop ? (
        <ProgramsTable
          programs={programs}
          isWeb={isWeb}
          onSelectStatus={handleSelectStatus}
          onOpenStatusPicker={setStatusPickerProgram}
          statusOptions={statusOrder}
          getStatusColor={getStatusColor}
          getTypeColor={getTypeColor}
          formatDate={formatDate}
        />
      ) : (
        <View>
          {programs.map((programs) => (
            <ProgramCard
              key={programs.id}
              programs={programs}
              onOpenStatusPicker={setStatusPickerProgram}
              getTypeColor={getTypeColor}
              getStatusColor={getStatusColor}
              formatDate={formatDate}
            />
          ))}
        </View>
      )}
    </View>
  );

  return (
    <>
      {statusPickerProgram && (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setStatusPickerProgram(null)}
        >
          <Pressable
            className="flex-1 bg-black/30 justify-center px-6"
            onPress={() => setStatusPickerProgram(null)}
          >
            <View className="bg-white rounded-2xl p-5 shadow-lg max-w-2xl w-full self-center">
              <View className="flex-row items-start justify-between gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-gray-900 text-lg font-bold">
                    {statusPickerProgram.name}
                  </Text>
                  <Text className="text-gray-600 text-sm mt-1">
                    {statusPickerProgram.description ??
                      "No description provided."}
                  </Text>
                </View>
                <View className="items-end gap-2">
                  <View
                    className={`px-2 py-1 rounded-full ${getTypeColor(
                      statusPickerProgram.type
                    )}`}
                  >
                    <Text className="text-xs font-semibold capitalize">
                      {statusPickerProgram.type.toString().replace("_", " ")}
                    </Text>
                  </View>
                  <View
                    className={`px-2 py-1 rounded-full ${getStatusColor(
                      statusPickerProgram.status
                    )}`}
                  >
                    <Text className="text-xs font-semibold capitalize">
                      {statusPickerProgram.status.toString().toLowerCase()}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row flex-wrap gap-3 mb-4">
                <View className="flex-1 min-w-[45%] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <Text className="text-xs text-gray-500">Active period</Text>
                  <Text className="text-sm font-semibold text-gray-900 mt-0.5">
                    {formatDate(statusPickerProgram.startDate)} -{" "}
                    {formatDate(statusPickerProgram.endDate)}
                  </Text>
                </View>
                <View className="flex-1 min-w-[45%] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <Text className="text-xs text-gray-500">Payout</Text>
                  <Text className="text-sm font-semibold text-gray-900 mt-0.5">
                    ETH{" "}
                    {formatEthFixed(
                      statusPickerProgram.payoutRule?.amount ?? 0
                    )}{" "}
                    {statusPickerProgram.payoutRule?.maxCap
                      ? `(Cap: ETH ${formatEthFixed(
                          statusPickerProgram.payoutRule.maxCap
                        )})`
                      : ""}
                  </Text>
                </View>
                <View className="flex-1 min-w-[45%] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <Text className="text-xs text-gray-500">On-chain ID</Text>
                  <Text className="text-sm font-semibold text-gray-900 mt-0.5">
                    #{statusPickerProgram.onchainId}
                  </Text>
                </View>
                <View className="flex-1 min-w-[45%] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <Text className="text-xs text-gray-500">Last updated</Text>
                  <Text className="text-sm font-semibold text-gray-900 mt-0.5">
                    {formatDate(statusPickerProgram.updatedAt)}
                  </Text>
                </View>
              </View>

              <View className="border border-gray-200 rounded-xl p-3 mb-4">
                <Text className="text-gray-900 text-sm font-semibold mb-2">
                  Eligibility
                </Text>
                <View className="flex-row flex-wrap gap-3">
                  <View className="flex-1 min-w-[45%]">
                    <Text className="text-xs text-gray-500">States</Text>
                    <Text className="text-sm text-gray-800 mt-0.5">
                      {formatList(statusPickerProgram.eligibility?.states)}
                    </Text>
                  </View>
                  <View className="flex-1 min-w-[45%]">
                    <Text className="text-xs text-gray-500">Districts</Text>
                    <Text className="text-sm text-gray-800 mt-0.5">
                      {formatList(statusPickerProgram.eligibility?.districts)}
                    </Text>
                  </View>
                  <View className="flex-1 min-w-[45%]">
                    <Text className="text-xs text-gray-500">Crop types</Text>
                    <Text className="text-sm text-gray-800 mt-0.5">
                      {formatList(statusPickerProgram.eligibility?.cropTypes)}
                    </Text>
                  </View>
                  <View className="flex-1 min-w-[45%]">
                    <Text className="text-xs text-gray-500">
                      Land documents
                    </Text>
                    <Text className="text-sm text-gray-800 mt-0.5">
                      {formatList(
                        statusPickerProgram.eligibility?.landDocumentTypes
                      )}
                    </Text>
                  </View>
                  <View className="flex-1 min-w-[45%]">
                    <Text className="text-xs text-gray-500">Min farm size</Text>
                    <Text className="text-sm text-gray-800 mt-0.5">
                      {statusPickerProgram.eligibility?.minFarmSize ?? "Any"}
                    </Text>
                  </View>
                  <View className="flex-1 min-w-[45%]">
                    <Text className="text-xs text-gray-500">Max farm size</Text>
                    <Text className="text-sm text-gray-800 mt-0.5">
                      {statusPickerProgram.eligibility?.maxFarmSize ?? "Any"}
                    </Text>
                  </View>
                </View>
              </View>

              <View>
                <Text className="text-gray-900 text-sm font-semibold mb-2">
                  Change status
                </Text>
                <View className="gap-2">
                  {getAvailableStatuses(statusPickerProgram.status).map(
                    (status) => (
                      <TouchableOpacity
                        key={status}
                        disabled={isProcessingStatusChange}
                        onPress={() =>
                          handleSelectStatus(statusPickerProgram.id, status)
                        }
                        className="px-4 py-2 border border-gray-200 rounded-lg"
                      >
                        <Text className="text-sm text-gray-800 capitalize">
                          {status.toLowerCase()}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>
            </View>
          </Pressable>
        </Modal>
      )}
      {isDesktop ? (
        pageContent
      ) : (
        <View className="flex-1 bg-gray-50">
          <ScrollView className="flex-1">{pageContent}</ScrollView>
        </View>
      )}
    </>
  );
}
