import { useCallback, useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { z } from "zod";
import { Plus } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useFarmerLayout } from "@/components/farmer/layout/FarmerLayoutContext";
import { formatEth } from "@/components/farmer/farm-produce/utils";
import { useFarmerProgramsQuery } from "@/hooks/useProgram";
import { useFarmsQuery } from "@/hooks/useFarm";
import { useSubsidyPayout } from "@/hooks/useBlockchain";
import {
  useRequestSubsidyMutation,
  useUploadSubsidyEvidenceMutation,
  useSubsidiesQuery,
} from "@/hooks/useSubsidy";
import { cleanupUploadedFiles } from "@/components/common/FileUploadPanel";
import type { UploadedDocument } from "@/validation/upload";
import type {
  ProgramResponseDto,
  FarmListRespondDto,
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
import {
  getPaymentStatusColor,
  getStatusColor,
  getStatusIcon,
} from "@/components/farmer/subsidy/statusHelpers";
import type {
  ClaimValidationErrors,
  Subsidy,
  SubsidyStats,
} from "@/components/farmer/subsidy/types";

export default function SubsidyManagementScreen() {
  const { isDesktop } = useResponsiveLayout();
  const [selectedSubsidy, setSelectedSubsidy] = useState<Subsidy | null>(null);
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
  const [validationErrors, setValidationErrors] = useState<ClaimValidationErrors>({});
  const [exceedMaxMessage, setExceedMaxMessage] = useState<string>("");
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

  const { programs: farmerPrograms, isLoading: isLoadingFarmerPrograms } =
    useFarmerProgramsQuery();
  const { data: farmsData } = useFarmsQuery();
  const {
    data: subsidiesData,
    isLoading: isLoadingSubsidies,
    refetch: refetchSubsidies,
  } = useSubsidiesQuery();

  const farms = useMemo(
    () =>
      Array.isArray(farmsData?.data)
        ? (farmsData.data as FarmListRespondDto[])
        : [],
    [farmsData?.data]
  );
  const verifiedFarms = useMemo(
    () => farms.filter((farm) => farm.verificationStatus === "VERIFIED"),
    [farms]
  );

  const subsidies = useMemo(() => {
    const subsidiesArray = Array.isArray(subsidiesData)
      ? subsidiesData
      : (subsidiesData as any)?.data
      ? (subsidiesData as any).data
      : [];

    if (!subsidiesArray || !Array.isArray(subsidiesArray)) {
      return [];
    }

    const programMap = new Map(farmerPrograms.map((p) => [p.id, p]));
    const defaultFarm = verifiedFarms[0] || farms[0];

    return (subsidiesArray as SubsidyResponseDto[]).map((subsidy) => {
      const program = subsidy.programsId
        ? programMap.get(subsidy.programsId)
        : null;

      let status: "approved" | "pending" | "rejected" = "pending";
      if (subsidy.status === "APPROVED" || subsidy.status === "DISBURSED") {
        status = "approved";
      } else if (subsidy.status === "REJECTED") {
        status = "rejected";
      }

      let paymentStatus: "paid" | "processing" | "pending" | undefined;
      if (subsidy.paidAt) {
        paymentStatus = "paid";
      } else if (subsidy.approvedAt) {
        paymentStatus = "processing";
      } else {
        paymentStatus = "pending";
      }

      return {
        id: subsidy.id,
        programName: program?.name || "Unknown Program",
        applicationDate: subsidy.createdAt,
        amount: subsidy.amount,
        status,
        description:
          program?.description || subsidy.rejectionReason || "Subsidy request",
        farmName: defaultFarm?.name || "No Farm",
        approvalDate: subsidy.approvedAt || undefined,
        paymentStatus,
      } as Subsidy;
    });
  }, [subsidiesData, farmerPrograms, verifiedFarms, farms]);

  const stats: SubsidyStats = useMemo(
    () => ({
      total: subsidies.length,
      approved: subsidies.filter((s) => s.status === "approved").length,
      pending: subsidies.filter((s) => s.status === "pending").length,
      rejected: subsidies.filter((s) => s.status === "rejected").length,
      totalAmount: subsidies
        .filter((s) => s.status === "approved")
        .reduce((sum, s) => sum + s.amount, 0),
    }),
    [subsidies]
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

  const handleViewDetails = (subsidy: Subsidy) => {
    setSelectedSubsidy(subsidy);
    setShowDetailsModal(true);
  };

  const handleStartApplication = useCallback(() => {
    router.push("/dashboard/farmer/subsidy/apply");
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

      await refetchSubsidies();

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

  const pageContent = (
    <View className="px-6 py-6">
      <StatsCards stats={stats} isDesktop={isDesktop} />
      <TotalAmountCard
        totalAmount={stats.totalAmount}
        ethToMyrRate={ethToMyrRate}
      />

      <EnrolledProgramsList
        programs={farmerPrograms}
        isLoading={isLoadingFarmerPrograms}
        onOpenClaim={handleOpenClaimModal}
        isActionDisabled={isWriting || isWaitingReceipt || isSubmittingClaim}
      />

      {isDesktop ? (
        <SubsidiesTable
          subsidies={subsidies}
          isLoading={isLoadingSubsidies}
          onViewDetails={handleViewDetails}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
        />
      ) : (
        <View>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-900 text-lg font-bold">
              Active Subsidies
            </Text>
          </View>

          {isLoadingSubsidies ? (
            <Text className="text-gray-500 text-sm">Loading subsidies...</Text>
          ) : subsidies.length === 0 ? (
            <Text className="text-gray-500 text-sm">
              No subsidies found. Submit a claim to get started.
            </Text>
          ) : (
            subsidies.map((subsidy) => (
              <SubsidyCard
                key={subsidy.id}
                subsidy={subsidy}
                onViewDetails={handleViewDetails}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
              />
            ))
          )}
        </View>
      )}
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
      title: "Subsidy Management",
      subtitle: "Track and apply for farming subsidies securely",
      rightHeaderButton: isDesktop ? desktopActionButton : undefined,
      mobile: {
        contentContainerStyle: {
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 32,
        },
      },
    }),
    [desktopActionButton, isDesktop]
  );

  useFarmerLayout(layoutMeta);

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
        getStatusColor={getStatusColor}
        getStatusIcon={getStatusIcon}
        getPaymentStatusColor={getPaymentStatusColor}
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
