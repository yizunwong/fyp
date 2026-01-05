import { useEffect, useMemo, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import {
  useProgramsQuery,
  useUpdateProgramStatusMutation,
} from "@/hooks/useProgram";
import {
  ProgramResponseDtoStatus,
  type ProgramResponseDto,
  type CreateProgramDto,
  type ProgramControllerGetProgramsParams,
} from "@/api";
import { ProgramsTable } from "@/components/agency/programs-management/ProgramsTable";
import { ProgramCard } from "@/components/agency/programs-management/ProgramCard";
import {
  ProgramSummaryCards,
  ProgramStats,
} from "@/components/agency/programs-management/ProgramSummaryCards";
import { ProgramFilter } from "@/components/agency/programs-management/ProgramFilter";
import { ProgramStatusModal } from "@/components/agency/programs-management/ProgramStatusModal";
import { formatDate } from "@/components/farmer/farm-produce/utils";
import Toast from "react-native-toast-message";
import { parseError } from "@/utils/format-error";
import { useSubsidyProgramCreation } from "@/hooks/useBlockchain";
import { ProgramType } from "@/components/agency/create-programs/types";
import Pagination from "@/components/common/Pagination";
import { useProgramStats } from "@/hooks/useDashboard";
import { RightHeaderButton } from "@/components/ui/RightHeaderButton";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useAppLayout } from '@/components/layout';

export default function ProgramManagementScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;
  const { isDesktop: isDesktopLayout } = useResponsiveLayout();

  const handleCreateProgram = useCallback(() => {
    router.push("/dashboard/agency/programs/create");
  }, []);

  const layoutMeta = useMemo(
    () => ({
      title: "Program Management",
      subtitle: "Create and manage subsidy programs",
      rightHeaderButton: isDesktopLayout ? (
        <RightHeaderButton
          onPress={handleCreateProgram}
          label="Create Program"
          icon={<Plus color="#fff" size={18} />}
          colors={["#2563eb", "#1e40af"]}
        />
      ) : undefined,
      mobile: {
        floatingAction: (
          <FloatingActionButton
            onPress={handleCreateProgram}
            icon={<Plus color="#fff" size={18} />}
            colors={["#2563eb", "#1e40af"]}
          />
        ),
      },
    }),
    [handleCreateProgram, isDesktopLayout]
  );

  useAppLayout(layoutMeta);

  const PAGE_SIZE = 10;
  const [searchName, setSearchName] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    ProgramResponseDtoStatus | "all"
  >("all");
  const [activeFrom, setActiveFrom] = useState("");
  const [activeTo, setActiveTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const queryParams = useMemo<ProgramControllerGetProgramsParams>(() => {
    const params: ProgramControllerGetProgramsParams = {
      page,
      limit: PAGE_SIZE,
    };
    const trimmedName = searchName.trim();
    if (trimmedName) params.name = trimmedName;
    if (statusFilter !== "all") params.status = statusFilter;
    const trimmedActiveFrom = activeFrom.trim();
    const trimmedActiveTo = activeTo.trim();
    if (trimmedActiveFrom) params.activeFrom = trimmedActiveFrom;
    if (trimmedActiveTo) params.activeTo = trimmedActiveTo;
    return params;
  }, [page, searchName, statusFilter, activeFrom, activeTo]);

  const {
    programs: programsDtos,
    isLoading: isLoadingPrograms,
    isFetching: isFetchingPrograms,
    error: programsError,
    refetch: refetchPrograms,
    total,
  } = useProgramsQuery(queryParams);
  const {
    stats: programStats,
    isLoading: isLoadingProgramStats,
    refetch: refetchProgramStats,
  } = useProgramStats();
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
    () =>
      programStats
        ? {
            active: programStats.activePrograms ?? 0,
            draft: programStats.draftPrograms ?? 0,
            total: programStats.totalPrograms ?? 0,
          }
        : {
            active: programs.filter(
              (p) => (p.status ?? "").toString().toLowerCase() === "active"
            ).length,
            draft: programs.filter(
              (p) => (p.status ?? "").toString().toLowerCase() === "draft"
            ).length,
            total: programs.length,
          },
    [programStats, programs]
  );

  const getStatusColor = (status: string | undefined | null) => {
    const statusValue = (status ?? "").toString().toLowerCase();
    switch (statusValue) {
      case "active":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
      case "draft":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
    }
  };

  const getTypeColor = (type: string | undefined | null) => {
    const typeValue = (type ?? "").toString().toLowerCase();
    switch (typeValue) {
      case "drought":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300";
      case "flood":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
      case "crop_loss":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
    }
  };

  const statusOrder: ProgramResponseDtoStatus[] = [
    ProgramResponseDtoStatus.draft,
    ProgramResponseDtoStatus.active,
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

  const handleStatusFilterChange = (
    status: ProgramResponseDtoStatus | "all"
  ) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchName(value);
    setPage(1);
  };

  const handleActiveFromChange = (value: string) => {
    setActiveFrom(value);
    setPage(1);
  };

  const handleActiveToChange = (value: string) => {
    setActiveTo(value);
    setPage(1);
  };

  const clearStatusFilter = () => handleStatusFilterChange("all");
  const clearActiveFrom = () => handleActiveFromChange("");
  const clearActiveTo = () => handleActiveToChange("");

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
      let nextOnchainId: number | undefined = undefined;

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
          onchainId: Number(program.onchainId ?? 1), // Placeholder, contract generates its own ID
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

      await updateProgramStatus(programsId, { 
        status: targetStatus,
        ...(nextOnchainId !== undefined && { onchainId: nextOnchainId })
      });
      setPrograms((prev) =>
        prev.map((p) =>
          p.id === programsId
            ? { 
                ...p, 
                status: targetStatus, 
                ...(nextOnchainId !== undefined && { onchainId: nextOnchainId })
              }
            : p
        )
      );
      refetchProgramStats();
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
  const normalizedActiveFrom = activeFrom.trim();
  const normalizedActiveTo = activeTo.trim();
  const hasNextPage = page * PAGE_SIZE < total;

  if (isInitialLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-700 dark:text-gray-300 mt-3">Loading programs...</Text>
      </View>
    );
  }

  if (programsError && programs.length > 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900 px-6">
        <Text className="text-gray-900 dark:text-gray-100 text-xl font-bold mb-2">
          Failed to load programs
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 text-sm mb-4">
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
      <ProgramSummaryCards
        stats={stats}
        isDesktop={isDesktop}
        isFetchingPrograms={isFetchingPrograms || isLoadingProgramStats}
      />

      <ProgramFilter
        searchName={searchName}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        activeFrom={activeFrom}
        activeTo={activeTo}
        normalizedActiveFrom={normalizedActiveFrom}
        normalizedActiveTo={normalizedActiveTo}
        onActiveFromChange={handleActiveFromChange}
        onActiveToChange={handleActiveToChange}
        onClearStatusFilter={clearStatusFilter}
        onClearActiveFrom={clearActiveFrom}
        onClearActiveTo={clearActiveTo}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
      />

      {shouldShowEmptyState ? (
        <View className="bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 items-center justify-center">
          <Text className="text-gray-900 dark:text-gray-100 text-base font-semibold">
            No programs found
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-sm mt-1 text-center">
            Create a new programs to get started or refresh to fetch the latest
            records.
          </Text>
          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
              onPress={() => refetchPrograms()}
              className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <Text className="text-gray-800 dark:text-gray-200 text-sm font-semibold">
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
      {!shouldShowEmptyState && (
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          isLoading={isLoadingPrograms || isFetchingPrograms}
          hasNext={hasNextPage}
          total={total}
        />
      )}
    </View>
  );

  return (
    <>
      <ProgramStatusModal
        program={statusPickerProgram}
        visible={Boolean(statusPickerProgram)}
        onClose={() => setStatusPickerProgram(null)}
        getStatusColor={getStatusColor}
        getTypeColor={getTypeColor}
        getAvailableStatuses={getAvailableStatuses}
        onSelectStatus={handleSelectStatus}
        formatDate={formatDate}
        formatList={formatList}
        formatEthFixed={formatEthFixed}
        isProcessingStatusChange={isProcessingStatusChange}
      />
      {isDesktop ? (
        pageContent
      ) : (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
          <ScrollView className="flex-1">{pageContent}</ScrollView>
        </View>
      )}
    </>
  );
}
