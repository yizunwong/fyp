import { useCallback, useEffect, useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { z } from "zod";
import { Plus } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { formatEth } from "@/components/farmer/farm-produce/utils";
import { useFarmerProgramsQuery } from "@/hooks/useProgram";
import { useFarmsQuery } from "@/hooks/useFarm";
import { useSubsidyPayout } from "@/hooks/useBlockchain";
import {
  useRequestSubsidyMutation,
  useUploadSubsidyEvidenceMutation,
  useSubsidiesQuery,
} from "@/hooks/useSubsidy";
import { useSubsidyStats } from "@/hooks/useDashboard";
import { cleanupUploadedFiles } from "@/components/common/FileUploadPanel";
import type { UploadedDocument } from "@/validation/upload";
import type {
  ProgramResponseDto,
  SubsidyControllerListSubsidiesParams,
  SubsidyResponseDto,
} from "@/api";
import Toast from "react-native-toast-message";
import { useEthToMyr } from "@/hooks/useEthToMyr";
import StatsCards from "@/components/farmer/subsidy/StatsCards";
import TotalAmountCard from "@/components/farmer/subsidy/TotalAmountCard";
import SubsidyCard from "@/components/farmer/subsidy/SubsidyCard";
import SubsidiesTable from "@/components/farmer/subsidy/SubsidiesTable";
import EnrolledProgramsList from "@/components/farmer/subsidy/EnrolledProgramsList";
import SubsidyDetailsModal from "@/components/farmer/subsidy/SubsidyDetailsModal";
import SubmitSubsidyModal from "@/components/farmer/subsidy/SubmitSubsidyModal";
import SubsidyFilters from "@/components/farmer/subsidy/SubsidyFilters";
import Pagination from "@/components/common/Pagination";
import type { SubsidyStatusFilter } from "@/components/farmer/subsidy/helpers";
import type {
  ClaimValidationErrors,
  SubsidyStats,
} from "@/components/farmer/subsidy/types";
import { useAppLayout } from '@/components/layout';

export default function SubsidyManagementScreen() {
  const { isDesktop } = useResponsiveLayout();
  const [selectedSubsidy, setSelectedSubsidy] =
    useState<SubsidyResponseDto | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedProgram, setSelectedProgram] =
    useState<ProgramResponseDto | null>(null);
  const [claimAmount, setClaimAmount] = useState("");
  const [claimRemarks, setClaimRemarks] = useState("");
  const [claimEvidenceFiles, setClaimEvidenceFiles] = useState<
    UploadedDocument[]
  >([]);
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [validationErrors, setValidationErrors] =
    useState<ClaimValidationErrors>({});
  const [exceedMaxMessage, setExceedMaxMessage] = useState<string>("");
  const [subsidiesPage, setSubsidiesPage] = useState(1);
  const [farmerProgramsPage, setFarmerProgramsPage] = useState(1);
  const pageSize = 20;
  const [showSubsidyFilters, setShowSubsidyFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubsidyStatusFilter>("ALL");
  const [appliedDateFrom, setAppliedDateFrom] = useState("");
  const [appliedDateTo, setAppliedDateTo] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const { ethToMyr: ethToMyrRateRaw } = useEthToMyr();
  const ethToMyrRate = ethToMyrRateRaw ?? undefined;

  const minPayout = 0.00001;
  const incrementClaimAmount = () => {
    const current = parseFloat(claimAmount) || minPayout;
    const newAmount = current + 0.00001;
    const newAmountStr = newAmount.toFixed(5);

    if (
      selectedProgram?.payoutRule?.maxCap !== undefined &&
      selectedProgram.payoutRule?.maxCap !== null
    ) {
      const maxPayout = Number(selectedProgram.payoutRule.maxCap);
      if (newAmount > maxPayout) {
        setExceedMaxMessage(
          `You cannot exceed ${formatEth(maxPayout)} ETH (max payout)`
        );
        setClaimAmount(maxPayout.toString());
        return;
      }
    }
    setExceedMaxMessage("");
    setClaimAmount(newAmountStr);
  };

  const decrementClaimAmount = () => {
    const current = parseFloat(claimAmount) || minPayout;
    const newAmount = Math.max(minPayout, current - 0.00001);
    setClaimAmount(newAmount.toFixed(5));
    setExceedMaxMessage("");
  };

  const {
    programs: farmerPrograms,
    isLoading: isLoadingFarmerPrograms,
    total: totalFarmerPrograms,
  } = useFarmerProgramsQuery({
    page: farmerProgramsPage,
    limit: pageSize,
  });
  const { data: farmsData } = useFarmsQuery();
  // Build query params from filters
  const subsidyQueryParams =
    useMemo<SubsidyControllerListSubsidiesParams>(() => {
      const params: SubsidyControllerListSubsidiesParams = {
        page: subsidiesPage,
        limit: pageSize,
      };

      if (searchQuery) params.programName = searchQuery;
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (appliedDateFrom) params.appliedDateFrom = appliedDateFrom;
      if (appliedDateTo) params.appliedDateTo = appliedDateTo;
      if (amountMin) params.amountMin = Number(amountMin);
      if (amountMax) params.amountMax = Number(amountMax);
      return params;
    }, [
      subsidiesPage,
      searchQuery,
      statusFilter,
      appliedDateFrom,
      appliedDateTo,
      amountMin,
      amountMax,
    ]);
  useEffect(() => {
    setSubsidiesPage(1);
  }, [
    searchQuery,
    statusFilter,
    appliedDateFrom,
    appliedDateTo,
    amountMin,
    amountMax,
  ]);
  useEffect(() => {
    if (farmerProgramsPage > 1) {
      setFarmerProgramsPage(1);
    }
  }, [farmerProgramsPage]);
  const {
    subsidies: subsidiesData,
    isLoading: isLoadingSubsidies,
    refetch: refetchSubsidies,
    total: totalSubsidies,
  } = useSubsidiesQuery(subsidyQueryParams);

  const { stats: subsidyStatsData, refetch: refetchSubsidyStats } =
    useSubsidyStats();

  const farms = useMemo(() => farmsData?.data || [], [farmsData?.data]);
  const verifiedFarms = useMemo(
    () => farms.filter((farm) => farm.verificationStatus === "VERIFIED"),
    [farms]
  );

  const subsidies = subsidiesData || [];

  const stats: SubsidyStats = useMemo(
    () =>
      subsidyStatsData
        ? {
            total: subsidyStatsData.totalApplied,
            approved: subsidyStatsData.approved,
            pending: subsidyStatsData.pending,
            rejected: subsidyStatsData.rejected,
            totalAmount: subsidyStatsData.totalSubsidiesReceived,
          }
        : {
            total: 0,
            approved: 0,
            pending: 0,
            rejected: 0,
            totalAmount: 0,
          },
    [subsidyStatsData]
  );

  const {
    walletAddress,
    submitClaim,
    hashMetadata,
    isWriting,
    isWaitingReceipt,
  } = useSubsidyPayout();
  const { requestSubsidy } = useRequestSubsidyMutation();
  const { uploadSubsidyEvidence } = useUploadSubsidyEvidenceMutation();

  const handleViewDetails = (subsidy: SubsidyResponseDto) => {
    setSelectedSubsidy(subsidy);
    setShowDetailsModal(true);
  };

  const handleStartApplication = useCallback(() => {
    router.push("/dashboard/farmer/subsidies/apply");
  }, []);

  const handleOpenClaimModal = (programs: ProgramResponseDto) => {
    setSelectedProgram(programs);
    setClaimAmount("");
    setClaimRemarks("");
    setValidationErrors({});
    setClaimEvidenceFiles([]);
    setExceedMaxMessage("");
    setShowClaimModal(true);
  };

  const handleClaimEvidenceAdded = (incoming: UploadedDocument[]) => {
    if (!incoming.length) return;
    const firstSupported = incoming.find(
      (file) => file.kind === "image" || file.kind === "pdf"
    );
    if (!firstSupported) {
      Toast.show({
        type: "info",
        text1: "Unsupported file",
        text2: "Please upload an image or PDF file.",
      });
      return;
    }
    setClaimEvidenceFiles((prev) => {
      cleanupUploadedFiles(prev);
      return [firstSupported];
    });
    setValidationErrors((prev) => ({ ...prev, evidence: undefined }));
  };

  const handleClaimEvidenceRemoved = (fileId: string) => {
    setClaimEvidenceFiles((prev) => {
      const remaining = prev.filter((doc) => doc.id !== fileId);
      const removed = prev.filter((doc) => doc.id === fileId);
      cleanupUploadedFiles(removed);
      if (remaining.length === 0) {
        setValidationErrors((errors) => ({
          ...errors,
          evidence: "Evidence is required. Please upload at least one file.",
        }));
      }
      return remaining;
    });
  };

  const claimFormSchema = useMemo(
    () =>
      z.object({
        amount: z
          .string()
          .min(1, "Payout amount is required")
          .refine(
            (val) => {
              const num = Number(val);
              return !Number.isNaN(num) && num > 0;
            },
            {
              message: "Payout amount must be a number greater than 0",
            }
          )
          .refine(
            (val) => {
              if (!selectedProgram) return true;
              const num = Number(val);
              const maxPayoutEth =
                selectedProgram.payoutRule?.maxCap !== undefined &&
                selectedProgram.payoutRule?.maxCap !== null
                  ? Number(selectedProgram.payoutRule.maxCap)
                  : null;
              if (maxPayoutEth && maxPayoutEth > 0) {
                return num <= maxPayoutEth;
              }
              return true;
            },
            (val) => {
              const maxPayoutEth =
                selectedProgram?.payoutRule?.maxCap !== undefined &&
                selectedProgram.payoutRule?.maxCap !== null
                  ? Number(selectedProgram.payoutRule.maxCap)
                  : null;
              const maxEthFormatted = maxPayoutEth
                ? formatEth(maxPayoutEth)
                : "N/A";
              return {
                message: `Requested amount exceeds max payout of ${maxEthFormatted} ETH`,
              };
            }
          ),
        evidence: z
          .array(z.any())
          .min(1, "Evidence is required. Please upload at least one file."),
      }),
    [selectedProgram]
  );

  const handleClaimAmountChange = (text: string) => {
    let sanitized = text
      .replace(/[^0-9.]/g, "")
      .replace(/\./g, (match, offset) =>
        text.indexOf(".") === offset ? match : ""
      );

    const numValue = parseFloat(sanitized);
    if (!Number.isNaN(numValue) && numValue < minPayout) {
      sanitized = minPayout.toFixed(5);
    }

    if (
      selectedProgram?.payoutRule?.maxCap !== undefined &&
      selectedProgram.payoutRule?.maxCap !== null
    ) {
      const maxPayout = Number(selectedProgram.payoutRule.maxCap);
      const enteredValue = Number(sanitized);

      if (!Number.isNaN(enteredValue) && enteredValue > maxPayout) {
        sanitized = maxPayout.toString();
        setExceedMaxMessage(
          `You cannot exceed ${formatEth(maxPayout)} ETH (max payout)`
        );
      } else {
        setExceedMaxMessage("");
      }
    } else {
      setExceedMaxMessage("");
    }

    setClaimAmount(sanitized);
    if (validationErrors.amount) {
      setValidationErrors((prev) => ({ ...prev, amount: undefined }));
    }
  };

  const handleSubmitClaim = async () => {
    if (!selectedProgram) return;
    if (!walletAddress) {
      Toast.show({
        type: "error",
        text1: "Connect your wallet to submit a claim.",
      });
      return;
    }

    if (!ethToMyrRate) {
      Toast.show({
        type: "error",
        text1: "Unable to fetch ETH price. Please try again.",
      });
      return;
    }

    const validation = claimFormSchema.safeParse({
      amount: claimAmount,
      evidence: claimEvidenceFiles,
    });

    if (!validation.success) {
      const errors: ClaimValidationErrors = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0] === "amount") {
          errors.amount = err.message;
        } else if (err.path[0] === "evidence") {
          errors.evidence = err.message;
        }
      });
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    const parsedEthAmount = Number(claimAmount);
    const parsedAmount = parsedEthAmount;

    if (!verifiedFarms.length) {
      Toast.show({
        type: "error",
        text1: "No verified farms available for this claim.",
      });
      return;
    }

    try {
      setIsSubmittingClaim(true);
      const onChainId = selectedProgram.onchainId;
      let programsIdBigInt: bigint;
      try {
        programsIdBigInt = BigInt(onChainId);
      } catch {
        Toast.show({
          type: "error",
          text1: "Program on-chain ID is not valid for claim submission.",
        });
        return;
      }

      const metadataPayload = JSON.stringify({
        amount: parsedAmount,
        remarks: claimRemarks ?? "",
        programsId: selectedProgram.id,
        programsOnChainId: onChainId,
        timestamp: Date.now(),
      });
      const metadataHash = hashMetadata(metadataPayload);

      const { claimId, txHash } = await submitClaim(
        programsIdBigInt,
        metadataHash
      );

      if (claimId === undefined || claimId === null || !txHash) {
        Toast.show({
          type: "error",
          text1: "Failed to retrieve on-chain claim details.",
        });
        return;
      }

      const subsidy = await requestSubsidy({
        onChainTxHash: txHash,
        onChainClaimId: Number(claimId),
        amount: parsedAmount,
        programsId: selectedProgram.id,
        metadataHash,
      });

      const evidenceFile = claimEvidenceFiles[0];
      if (subsidy?.data?.id && evidenceFile?.file) {
        await uploadSubsidyEvidence(subsidy.data.id, {
          file: evidenceFile.file as Blob,
        });
      }

      cleanupUploadedFiles(claimEvidenceFiles);
      setClaimEvidenceFiles([]);
      setShowClaimModal(false);

      await Promise.all([refetchSubsidies(), refetchSubsidyStats()]);

      Toast.show({
        type: "success",
        text1: "Claim submitted",
        text2: "Your subsidy claim has been submitted successfully.",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Submission failed",
        text2: (error as Error)?.message ?? "Please try again",
      });
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  const handleCloseClaimModal = () => {
    cleanupUploadedFiles(claimEvidenceFiles);
    setClaimEvidenceFiles([]);
    setClaimAmount("");
    setValidationErrors({});
    setExceedMaxMessage("");
    setShowClaimModal(false);
  };

  // Filter handlers
  const handleClearStatusFilter = () => {
    setStatusFilter("ALL");
    setSubsidiesPage(1);
  };

  const handleClearAppliedDateFrom = () => {
    setAppliedDateFrom("");
    setSubsidiesPage(1);
  };

  const handleClearAppliedDateTo = () => {
    setAppliedDateTo("");
    setSubsidiesPage(1);
  };

  const handleClearAmountMin = () => {
    setAmountMin("");
    setSubsidiesPage(1);
  };

  const handleClearAmountMax = () => {
    setAmountMax("");
    setSubsidiesPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setSubsidiesPage(1);
  };

  const handleStatusChange = (status: SubsidyStatusFilter) => {
    setStatusFilter(status);
    setSubsidiesPage(1);
  };

  // Normalize dates for display
  const normalizedAppliedDateFrom = appliedDateFrom.trim() || undefined;
  const normalizedAppliedDateTo = appliedDateTo.trim() || undefined;

  const pageContent = (
    <View className="px-6 py-6">
      <StatsCards stats={stats} isDesktop={isDesktop} />
      <TotalAmountCard
        totalAmount={stats.totalAmount}
        ethToMyrRate={ethToMyrRate}
      />

      {/* Enrolled Programs Section */}
      <View className="mb-8">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-gray-900 dark:text-gray-100 text-xl font-bold">
              Enrolled Programs
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              View and submit claims for your enrolled subsidy programs
            </Text>
          </View>
        </View>
        <EnrolledProgramsList
          programs={farmerPrograms ?? []}
          isLoading={isLoadingFarmerPrograms}
          onOpenClaim={handleOpenClaimModal}
          isActionDisabled={isWriting || isWaitingReceipt || isSubmittingClaim}
        />
        {farmerPrograms && farmerPrograms.length > 0 && (
          <Pagination
            page={farmerProgramsPage}
            pageSize={pageSize}
            total={totalFarmerPrograms}
            isLoading={isLoadingFarmerPrograms}
            hasNext={farmerProgramsPage * pageSize < totalFarmerPrograms}
            onPageChange={setFarmerProgramsPage}
          />
        )}
      </View>

      {/* Active Subsidies Section */}
      <View>
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-gray-900 dark:text-gray-100 text-xl font-bold">
              Active Subsidies
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              Track and manage your subsidy applications
            </Text>
          </View>
        </View>

        <SubsidyFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          showFilters={showSubsidyFilters}
          onToggleFilters={() => setShowSubsidyFilters(!showSubsidyFilters)}
          appliedDateFrom={appliedDateFrom}
          appliedDateTo={appliedDateTo}
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
          normalizedAppliedDateFrom={normalizedAppliedDateFrom}
          normalizedAppliedDateTo={normalizedAppliedDateTo}
          onClearAppliedDateFrom={handleClearAppliedDateFrom}
          onClearAppliedDateTo={handleClearAppliedDateTo}
          onClearStatusFilter={handleClearStatusFilter}
          onClearAmountMin={handleClearAmountMin}
          onClearAmountMax={handleClearAmountMax}
        />

        {isDesktop ? (
          <>
            <SubsidiesTable
              subsidies={subsidies}
              isLoading={isLoadingSubsidies}
              onViewDetails={handleViewDetails}
              farmerPrograms={farmerPrograms}
            />
            <Pagination
              page={subsidiesPage}
              pageSize={pageSize}
              total={totalSubsidies}
              isLoading={isLoadingSubsidies}
              hasNext={subsidiesPage * pageSize < totalSubsidies}
              onPageChange={setSubsidiesPage}
            />
          </>
        ) : (
          <>
            {isLoadingSubsidies ? (
              <Text className="text-gray-500 text-sm">
                Loading subsidies...
              </Text>
            ) : subsidies.length === 0 ? (
              <View className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 items-center">
                <Text className="text-gray-500 text-sm text-center">
                  No subsidies found. Submit a claim to get started.
                </Text>
              </View>
            ) : (
              <>
                {subsidies.map((subsidy) => (
                  <SubsidyCard
                    key={subsidy.id}
                    subsidy={subsidy}
                    onViewDetails={handleViewDetails}
                    farmerPrograms={farmerPrograms}
                  />
                ))}
                <Pagination
                  page={subsidiesPage}
                  pageSize={pageSize}
                  total={totalSubsidies}
                  isLoading={isLoadingSubsidies}
                  hasNext={subsidiesPage * pageSize < totalSubsidies}
                  onPageChange={setSubsidiesPage}
                />
              </>
            )}
          </>
        )}
      </View>
    </View>
  );

  const desktopActionButton = useMemo(
    () => (
      <TouchableOpacity
        onPress={handleStartApplication}
        className="rounded-lg overflow-hidden"
      >
        <LinearGradient
          colors={["#22c55e", "#059669"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex-row items-center gap-2 px-5 py-3"
        >
          <Plus color="#fff" size={20} />
          <Text className="text-white text-[15px] font-semibold">
            Apply for Subsidy
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    ),
    [handleStartApplication]
  );

  const layoutMeta = useMemo(
    () => ({
      title: "My Subsidies",
      subtitle: "Track and apply for farming subsidies securely",
      rightHeaderButton: isDesktop ? desktopActionButton : undefined,
    }),
    [desktopActionButton, isDesktop]
  );

  useAppLayout(layoutMeta);

  const isIncrementDisabled =
    selectedProgram?.payoutRule?.maxCap !== undefined &&
    selectedProgram.payoutRule?.maxCap !== null &&
    parseFloat(claimAmount || "0") >= Number(selectedProgram.payoutRule.maxCap);

  return (
    <>
      {pageContent}

      <SubsidyDetailsModal
        visible={showDetailsModal}
        isDesktop={isDesktop}
        subsidy={selectedSubsidy}
        onClose={() => setShowDetailsModal(false)}
        farmerPrograms={farmerPrograms}
      />

      <SubmitSubsidyModal
        visible={showClaimModal}
        isDesktop={isDesktop}
        selectedProgram={selectedProgram}
        verifiedFarms={verifiedFarms}
        claimAmount={claimAmount}
        validationErrors={validationErrors}
        exceedMaxMessage={exceedMaxMessage}
        ethToMyrRate={ethToMyrRate}
        claimEvidenceFiles={claimEvidenceFiles}
        minPayout={minPayout}
        isSubmitting={isSubmittingClaim}
        isWriting={isWriting}
        isWaitingReceipt={isWaitingReceipt}
        isIncrementDisabled={!!isIncrementDisabled}
        onClose={handleCloseClaimModal}
        onAmountChange={handleClaimAmountChange}
        onIncrement={incrementClaimAmount}
        onDecrement={decrementClaimAmount}
        onSubmit={handleSubmitClaim}
        onFilesAdded={(files) => {
          handleClaimEvidenceAdded(files);
          if (validationErrors.evidence) {
            setValidationErrors((prev) => ({ ...prev, evidence: undefined }));
          }
        }}
        onRemoveFile={handleClaimEvidenceRemoved}
      />
    </>
  );
}
