import { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  useWindowDimensions,
} from "react-native";
import {
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { formatDate } from "@/components/farmer/farm-produce/utils";
import { useSubsidiesQuery } from "@/hooks/useSubsidy";
import { useAgencySubsidyStats } from "@/hooks/useDashboard";
import type { SubsidyResponseDto, SubsidyResponseDtoStatus } from "@/api";
import EthAmountDisplay from "@/components/common/EthAmountDisplay";
import { SubsidyFilter } from "@/components/agency/approvals/SubsidyFilter";
import { useAppLayout } from '@/components/layout';

export default function SubsidyApprovalQueueScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;
  useAppLayout({
    title: "Subsidy Approval Queue",
    subtitle: "Review and process pending subsidy claims",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [searchProgramName, setSearchProgramName] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    SubsidyResponseDtoStatus | "all"
  >("all");
  const [appliedDateFrom, setAppliedDateFrom] = useState("");
  const [appliedDateTo, setAppliedDateTo] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [subsidiesPage, setSubsidiesPage] = useState(1);
  const pageSize = 20;

  // Build query params from filters
  const subsidyQueryParams = useMemo(() => {
    const params: {
      page: number;
      limit: number;
      programName?: string;
      status?: SubsidyResponseDtoStatus;
      appliedDateFrom?: string;
      appliedDateTo?: string;
      amountMin?: number;
      amountMax?: number;
    } = {
      page: subsidiesPage,
      limit: pageSize,
    };

    if (searchProgramName.trim()) {
      params.programName = searchProgramName.trim();
    }

    if (statusFilter !== "all") {
      params.status = statusFilter;
    }

    if (appliedDateFrom) {
      params.appliedDateFrom = appliedDateFrom;
    }

    if (appliedDateTo) {
      params.appliedDateTo = appliedDateTo;
    }

    if (amountMin) {
      const min = parseFloat(amountMin);
      if (!isNaN(min)) {
        params.amountMin = min;
      }
    }

    if (amountMax) {
      const max = parseFloat(amountMax);
      if (!isNaN(max)) {
        params.amountMax = max;
      }
    }

    return params;
  }, [
    subsidiesPage,
    pageSize,
    searchProgramName,
    statusFilter,
    appliedDateFrom,
    appliedDateTo,
    amountMin,
    amountMax,
  ]);

  const { subsidies: subsidiesData, isLoading: isLoadingSubsidies } =
    useSubsidiesQuery(subsidyQueryParams);
  const { stats: agencySubsidyStats } = useAgencySubsidyStats();

  // Ensure subsidies is always an array
  const subsidies = useMemo(() => {
    if (!subsidiesData) return [];
    if (Array.isArray(subsidiesData)) {
      return subsidiesData;
    }
    return [];
  }, [subsidiesData]);

  // Helper functions
  const getClaimId = (subsidy: SubsidyResponseDto) => subsidy.id;

  const getProgramName = (subsidy: SubsidyResponseDto) => {
    return subsidy.programName || "Unknown Program";
  };

  const stats = useMemo(
    () => ({
      pending: agencySubsidyStats?.pending ?? 0,
      approved: agencySubsidyStats?.approved ?? 0,
      disbursed: agencySubsidyStats?.disbursed ?? 0,
      rejected: agencySubsidyStats?.rejected ?? 0,
    }),
    [agencySubsidyStats]
  );

  const getStatusColor = (status: SubsidyResponseDto["status"]) => {
    switch (status) {
      case "APPROVED":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
      case "DISBURSED":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
      case "PENDING":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300";
      case "REJECTED":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: SubsidyResponseDto["status"]) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle color="#2563eb" size={16} />;
      case "DISBURSED":
        return <CheckCircle color="#15803d" size={16} />;
      case "PENDING":
        return <Clock color="#b45309" size={16} />;
      case "REJECTED":
        return <XCircle color="#dc2626" size={16} />;
      default:
        return <FileText color="#2563eb" size={16} />;
    }
  };

  const getStatusLabel = (status: SubsidyResponseDto["status"]) => {
    switch (status) {
      case "APPROVED":
        return "approved";
      case "PENDING":
        return "pending";
      case "REJECTED":
        return "rejected";
      case "DISBURSED":
        return "disbursed";
      default:
        return String(status).toLowerCase();
    }
  };

  const SummaryCards = () => (
    <View className={isDesktop ? "flex-row gap-4 mb-6" : "gap-3 mb-6"}>
      <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg items-center justify-center">
            <Clock color="#b45309" size={20} />
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.pending}
          </Text>
        </View>
        <Text className="text-gray-600 dark:text-gray-400 text-sm font-medium">
          Pending Review
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">Awaiting approval</Text>
      </View>

      <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg items-center justify-center">
            <CheckCircle color="#2563eb" size={20} />
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.approved}
          </Text>
        </View>
        <Text className="text-gray-600 dark:text-gray-400 text-sm font-medium">Approved</Text>
        <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">Ready to disburse</Text>
      </View>

      <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-lg items-center justify-center">
            <CheckCircle color="#15803d" size={20} />
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.disbursed}
          </Text>
        </View>
        <Text className="text-gray-600 dark:text-gray-400 text-sm font-medium">Disbursed</Text>
        <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">Funds paid out</Text>
      </View>

      <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-red-50 dark:bg-red-900/30 rounded-lg items-center justify-center">
            <XCircle color="#dc2626" size={20} />
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.rejected}
          </Text>
        </View>
        <Text className="text-gray-600 dark:text-gray-400 text-sm font-medium">Rejected</Text>
        <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">Claims declined</Text>
      </View>
    </View>
  );

  const ClaimCard = ({ subsidy }: { subsidy: SubsidyResponseDto }) => {
    const claimId = getClaimId(subsidy);
    const programName = getProgramName(subsidy);

    return (
      <View className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-3">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <Text className="text-gray-900 dark:text-gray-100 text-base font-bold mb-1">
              {claimId}
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              {subsidy.farmer?.username || "Unknown Farmer"}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">
              {subsidy.farmer?.email || "No email"}
            </Text>
          </View>
          <View
            className={`flex-row items-center gap-1 px-3 py-1 rounded-full ${getStatusColor(
              subsidy.status
            )}`}
          >
            {getStatusIcon(subsidy.status)}
            <Text className="text-xs font-semibold capitalize">
              {getStatusLabel(subsidy.status)}
            </Text>
          </View>
        </View>

        <View className="gap-2 mb-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 dark:text-gray-400 text-sm">Program</Text>
            <Text className="text-gray-900 dark:text-gray-100 text-sm font-medium">
              {programName}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 dark:text-gray-400 text-sm">Claim Value</Text>
            <EthAmountDisplay
              ethAmount={subsidy.amount}
              textClassName="text-gray-900 dark:text-gray-100 text-sm font-bold"
              myrClassName="text-gray-500 dark:text-gray-400 text-xs"
            />
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 dark:text-gray-400 text-sm">Submitted</Text>
            <Text className="text-gray-900 dark:text-gray-100 text-sm font-medium">
              {formatDate(subsidy.createdAt)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() =>
            router.push(`/dashboard/agency/approvals/${subsidy.id}` as never)
          }
          className="rounded-lg overflow-hidden"
        >
          <LinearGradient
            colors={["#2563eb", "#1d4ed8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-row items-center justify-center gap-2 py-2.5"
          >
            <Eye color="#fff" size={18} />
            <Text className="text-white text-sm font-semibold">
              Review Claim
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  const ClaimsTable = () => (
    <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <View className="flex-row border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-t-xl">
        <Text className="w-64 text-gray-600 dark:text-gray-400 text-xs font-semibold">
          Claim ID
        </Text>
        <Text className="w-56 text-gray-600 dark:text-gray-400 text-xs font-semibold">Farmer</Text>
        <Text className="w-56 text-gray-600 dark:text-gray-400 text-xs font-semibold">
          Program
        </Text>
        <Text className="w-64 text-gray-600 dark:text-gray-400 text-xs font-semibold">
          Claim Value
        </Text>
        <Text className="w-56 text-gray-600 dark:text-gray-400 text-xs font-semibold">Status</Text>
        <Text className="w-24 text-gray-600 dark:text-gray-400 text-xs font-semibold">Action</Text>
      </View>

      <ScrollView className="max-h-[600px]">
        {subsidies?.map((subsidy) => {
          const claimId = getClaimId(subsidy);
          const programName = getProgramName(subsidy);

          return (
            <View
              key={subsidy.id}
              className="flex-row items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700"
            >
              <View className="w-64">
                <Text
                  className="text-gray-900 dark:text-gray-100 text-sm font-medium"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {claimId}
                </Text>
              </View>
              <View className="w-56">
                <Text
                  className="text-gray-900 dark:text-gray-100 text-sm font-medium"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {subsidy.farmer?.username || "Unknown Farmer"}
                </Text>
                <Text
                  className="text-gray-500 dark:text-gray-400 text-xs mt-0.5"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {subsidy.farmer?.email || "No email"}
                </Text>
              </View>
              <View className="w-56">
                <Text
                  className="text-gray-700 dark:text-gray-300 text-sm"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {programName}
                </Text>
              </View>
              <View className="w-64">
                <EthAmountDisplay
                  ethAmount={subsidy.amount}
                  textClassName="text-gray-900 dark:text-gray-100 text-sm font-semibold"
                  myrClassName="text-gray-500 dark:text-gray-400 text-[10px]"
                />
              </View>
              <View className="w-56">
                <View
                  className={`flex-row items-center gap-1 px-2 py-1 rounded-full self-start ${getStatusColor(
                    subsidy.status
                  )}`}
                >
                  {getStatusIcon(subsidy.status)}
                  <Text className="text-xs font-semibold capitalize">
                    {getStatusLabel(subsidy.status)}
                  </Text>
                </View>
              </View>
              <View className="w-24">
                <TouchableOpacity
                  onPress={() =>
                    router.push(
                      `/dashboard/agency/approvals/${subsidy.id}` as never
                    )
                  }
                  className="flex-row items-center justify-center gap-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg py-1.5 px-2"
                >
                  <Eye color="#2563eb" size={14} />
                  <Text className="text-blue-700 dark:text-blue-300 text-xs font-semibold">
                    Review
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

  const pageContent = (
    <View className="px-6 py-6">

      <SummaryCards />

      <SubsidyFilter
        searchProgramName={searchProgramName}
        onSearchChange={(value) => {
          setSearchProgramName(value);
          setSubsidiesPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
          setSubsidiesPage(1);
        }}
        appliedDateFrom={appliedDateFrom}
        appliedDateTo={appliedDateTo}
        normalizedAppliedDateFrom={appliedDateFrom.trim() || ""}
        normalizedAppliedDateTo={appliedDateTo.trim() || ""}
        onAppliedDateFromChange={(value) => {
          setAppliedDateFrom(value);
          setSubsidiesPage(1);
        }}
        onAppliedDateToChange={(value) => {
          setAppliedDateTo(value);
          setSubsidiesPage(1);
        }}
        amountMin={amountMin}
        amountMax={amountMax}
        onAmountMinChange={(value) => {
          setAmountMin(value);
          setSubsidiesPage(1);
        }}
        onAmountMaxChange={(value) => {
          setAmountMax(value);
          setSubsidiesPage(1);
        }}
        onClearStatusFilter={() => {
          setStatusFilter("all");
          setSubsidiesPage(1);
        }}
        onClearAppliedDateFrom={() => {
          setAppliedDateFrom("");
          setSubsidiesPage(1);
        }}
        onClearAppliedDateTo={() => {
          setAppliedDateTo("");
          setSubsidiesPage(1);
        }}
        onClearAmountMin={() => {
          setAmountMin("");
          setSubsidiesPage(1);
        }}
        onClearAmountMax={() => {
          setAmountMax("");
          setSubsidiesPage(1);
        }}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      {isLoadingSubsidies ? (
        <View className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <Text className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
            Loading subsidy claims...
          </Text>
        </View>
      ) : subsidies.length === 0 ? (
        <View className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <Text className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
            No subsidy claims found.
          </Text>
        </View>
      ) : isDesktop ? (
        <ClaimsTable />
      ) : (
        <View>
          {subsidies?.map((subsidy) => (
            <ClaimCard key={subsidy.id} subsidy={subsidy} />
          ))}
        </View>
      )}
    </View>
  );

  if (isDesktop) {
    return pageContent;
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1">{pageContent}</ScrollView>
    </View>
  );
}
