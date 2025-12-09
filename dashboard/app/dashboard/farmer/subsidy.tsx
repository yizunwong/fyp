import { useCallback, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import { z } from "zod";
import {
  DollarSign,
  CircleCheck as CheckCircle,
  Clock,
  Circle as XCircle,
  Plus,
  Eye,
  FileText,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TextInput } from "react-native";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useFarmerLayout } from "@/components/farmer/layout/FarmerLayoutContext";
import {
  formatCurrency,
  formatDate,
  formatEth,
  ethToMyr,
} from "@/components/farmer/farm-produce/utils";
import { router } from "expo-router";
import { useFarmerProgramsQuery } from "@/hooks/useProgram";
import { useFarmsQuery } from "@/hooks/useFarm";
import { useSubsidyPayout } from "@/hooks/useBlockchain";
import {
  useRequestSubsidyMutation,
  useUploadSubsidyEvidenceMutation,
  useSubsidiesQuery,
} from "@/hooks/useSubsidy";
import FileUploadPanel, {
  cleanupUploadedFiles,
} from "@/components/common/FileUploadPanel";
import type { UploadedDocument } from "@/validation/upload";
import type {
  ProgramResponseDto,
  FarmListRespondDto,
  SubsidyResponseDto,
} from "@/api";
import { formatFarmLocation } from "@/utils/farm";
import Toast from "react-native-toast-message";
import { useEthToMyr } from "@/hooks/useEthToMyr";
import EthAmountDisplay from "@/components/common/EthAmountDisplay";

interface Subsidy {
  id: string;
  programName: string;
  applicationDate: string;
  amount: number;
  status: "approved" | "pending" | "rejected";
  description: string;
  farmName: string;
  produceBatch?: string;
  approvalDate?: string;
  paymentStatus?: "paid" | "processing" | "pending";
}

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
  const [validationErrors, setValidationErrors] = useState<{
    amount?: string;
    evidence?: string;
  }>({});
  const [exceedMaxMessage, setExceedMaxMessage] = useState<string>("");
  const { ethToMyr: ethToMyrRate } = useEthToMyr();

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

  // Map SubsidyResponseDto to Subsidy interface
  const subsidies = useMemo(() => {
    // Handle both direct array and wrapped response
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

      // Map status: PENDING -> pending, APPROVED -> approved, REJECTED -> rejected, DISBURSED -> approved
      let status: "approved" | "pending" | "rejected" = "pending";
      if (subsidy.status === "APPROVED" || subsidy.status === "DISBURSED") {
        status = "approved";
      } else if (subsidy.status === "REJECTED") {
        status = "rejected";
      }

      // Determine payment status
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

  const {
    walletAddress,
    submitClaim,
    hashMetadata,
    enrollInProgram,
    isWriting,
    isWaitingReceipt,
  } = useSubsidyPayout();
  const { requestSubsidy } = useRequestSubsidyMutation();
  const { uploadSubsidyEvidence } = useUploadSubsidyEvidenceMutation();

  const stats = {
    total: subsidies.length,
    approved: subsidies.filter((s) => s.status === "approved").length,
    pending: subsidies.filter((s) => s.status === "pending").length,
    rejected: subsidies.filter((s) => s.status === "rejected").length,
    totalAmount: subsidies
      .filter((s) => s.status === "approved")
      .reduce((sum, s) => sum + s.amount, 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle color="#15803d" size={16} />;
      case "pending":
        return <Clock color="#b45309" size={16} />;
      case "rejected":
        return <XCircle color="#dc2626" size={16} />;
      default:
        return null;
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "pending":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

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
    setClaimEvidenceFiles([]);
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
  };

  const handleClaimEvidenceRemoved = (fileId: string) => {
    setClaimEvidenceFiles((prev) => {
      const remaining = prev.filter((doc) => doc.id !== fileId);
      const removed = prev.filter((doc) => doc.id === fileId);
      cleanupUploadedFiles(removed);
      return remaining;
    });
  };

  // Zod validation schema for submit subsidy form
  const claimFormSchema = z.object({
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
  });

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

    // Validate form with Zod
    const validation = claimFormSchema.safeParse({
      amount: claimAmount,
      evidence: claimEvidenceFiles,
    });

    if (!validation.success) {
      const errors: { amount?: string; evidence?: string } = {};
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

    // Clear validation errors
    setValidationErrors({});

    const parsedEthAmount = Number(claimAmount);

    // Store ETH amount directly (no conversion needed)
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

      // Refetch subsidies to show the new claim
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

  const StatsCards = () => {
    if (isDesktop) {
      return (
        <View className="gap-3 mb-6 flex-row">
          <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
            <View className="items-center">
              <View className="w-12 h-12 bg-emerald-50 rounded-full items-center justify-center mb-2">
                <FileText color="#059669" size={24} />
              </View>
              <Text className="text-gray-600 text-xs font-semibold mb-1">
                Total Applied
              </Text>
              <Text className="text-gray-900 text-2xl font-bold">
                {stats.total}
              </Text>
            </View>
          </View>

          <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
            <View className="items-center">
              <View className="w-12 h-12 bg-green-50 rounded-full items-center justify-center mb-2">
                <CheckCircle color="#15803d" size={24} />
              </View>
              <Text className="text-gray-600 text-xs font-semibold mb-1">
                Approved
              </Text>
              <Text className="text-gray-900 text-2xl font-bold">
                {stats.approved}
              </Text>
            </View>
          </View>

          <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
            <View className="items-center">
              <View className="w-12 h-12 bg-yellow-50 rounded-full items-center justify-center mb-2">
                <Clock color="#b45309" size={24} />
              </View>
              <Text className="text-gray-600 text-xs font-semibold mb-1">
                Pending
              </Text>
              <Text className="text-gray-900 text-2xl font-bold">
                {stats.pending}
              </Text>
            </View>
          </View>

          <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
            <View className="items-center">
              <View className="w-12 h-12 bg-red-50 rounded-full items-center justify-center mb-2">
                <XCircle color="#dc2626" size={24} />
              </View>
              <Text className="text-gray-600 text-xs font-semibold mb-1">
                Rejected
              </Text>
              <Text className="text-gray-900 text-2xl font-bold">
                {stats.rejected}
              </Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-6 -mx-6 px-6"
      >
        <View className="flex-row gap-3">
          <View className="bg-white rounded-xl p-4 border border-gray-200 w-32">
            <View className="items-center">
              <View className="w-10 h-10 bg-emerald-50 rounded-full items-center justify-center mb-2">
                <FileText color="#059669" size={20} />
              </View>
              <Text className="text-gray-600 text-[10px] font-semibold mb-1">
                Total Applied
              </Text>
              <Text className="text-gray-900 text-xl font-bold">
                {stats.total}
              </Text>
            </View>
          </View>

          <View className="bg-white rounded-xl p-4 border border-gray-200 w-32">
            <View className="items-center">
              <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center mb-2">
                <CheckCircle color="#15803d" size={20} />
              </View>
              <Text className="text-gray-600 text-[10px] font-semibold mb-1">
                Approved
              </Text>
              <Text className="text-gray-900 text-xl font-bold">
                {stats.approved}
              </Text>
            </View>
          </View>

          <View className="bg-white rounded-xl p-4 border border-gray-200 w-32">
            <View className="items-center">
              <View className="w-10 h-10 bg-yellow-50 rounded-full items-center justify-center mb-2">
                <Clock color="#b45309" size={20} />
              </View>
              <Text className="text-gray-600 text-[10px] font-semibold mb-1">
                Pending
              </Text>
              <Text className="text-gray-900 text-xl font-bold">
                {stats.pending}
              </Text>
            </View>
          </View>

          <View className="bg-white rounded-xl p-4 border border-gray-200 w-32">
            <View className="items-center">
              <View className="w-10 h-10 bg-red-50 rounded-full items-center justify-center mb-2">
                <XCircle color="#dc2626" size={20} />
              </View>
              <Text className="text-gray-600 text-[10px] font-semibold mb-1">
                Rejected
              </Text>
              <Text className="text-gray-900 text-xl font-bold">
                {stats.rejected}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  const TotalAmountCard = () => (
    <LinearGradient
      colors={["#22c55e", "#059669"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="rounded-xl p-6 mb-6"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-white/90 text-sm font-semibold mb-1">
            Total Subsidies Received
          </Text>
          <View>
            <Text className="text-white text-3xl font-bold">
              {formatEth(stats.totalAmount)}
            </Text>
            {ethToMyrRate && (
              <Text className="text-white/80 text-sm mt-1">
                (
                {formatCurrency(ethToMyr(stats.totalAmount, ethToMyrRate) ?? 0)}
                )
              </Text>
            )}
          </View>
        </View>
        <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center">
          <DollarSign color="#fff" size={32} />
        </View>
      </View>
    </LinearGradient>
  );

  const SubsidyCard = ({ subsidy }: { subsidy: Subsidy }) => (
    <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-gray-900 text-base font-bold mb-1">
            {subsidy.programName}
          </Text>
          <Text className="text-gray-500 text-xs">{subsidy.id}</Text>
        </View>
        <View
          className={`flex-row items-center gap-1 px-3 py-1 rounded-full ${getStatusColor(
            subsidy.status
          )}`}
        >
          {getStatusIcon(subsidy.status)}
          <Text className="text-xs font-semibold capitalize">
            {subsidy.status}
          </Text>
        </View>
      </View>

      <View className="gap-2 mb-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">Application Date</Text>
          <Text className="text-gray-900 text-sm font-medium">
            {formatDate(subsidy.applicationDate)}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">Amount</Text>
          <EthAmountDisplay
            ethAmount={subsidy.amount}
            textClassName="text-gray-900 text-sm font-bold"
            myrClassName="text-gray-500 text-xs"
          />
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">Farm</Text>
          <Text className="text-gray-900 text-sm font-medium">
            {subsidy.farmName}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => handleViewDetails(subsidy)}
        className="flex-row items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg py-2"
      >
        <Eye color="#059669" size={18} />
        <Text className="text-emerald-700 text-sm font-semibold">
          View Details
        </Text>
      </TouchableOpacity>
    </View>
  );

  const SubsidiesTable = () => (
    <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <View className="flex-row items-center justify-between bg-gray-50 px-6 py-4 border-b border-gray-200">
        <Text className="text-gray-900 text-lg font-bold">
          Active Subsidies
        </Text>
      </View>

      {isLoadingSubsidies ? (
        <View className="px-6 py-8">
          <Text className="text-gray-500 text-sm text-center">
            Loading subsidies...
          </Text>
        </View>
      ) : subsidies.length === 0 ? (
        <View className="px-6 py-8">
          <Text className="text-gray-500 text-sm text-center">
            No subsidies found. Submit a claim to get started.
          </Text>
        </View>
      ) : (
        <>
          <View className="flex-row bg-gray-50 px-6 py-4">
            <Text className="flex-[2] text-gray-500 text-xs font-semibold uppercase tracking-wide">
              Program Name
            </Text>
            <Text className="flex-[2] text-gray-500 text-xs font-semibold uppercase tracking-wide">
              Applied Date
            </Text>
            <Text className="flex-[2] text-gray-500 text-xs font-semibold uppercase tracking-wide">
              Amount
            </Text>
            <Text className="flex-[1.6] text-gray-500 text-xs font-semibold uppercase tracking-wide">
              Status
            </Text>
            <View className="flex-[0.55] items-end">
              <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide">
                Actions
              </Text>
            </View>
          </View>

          {subsidies.map((subsidy, index) => (
            <View
              key={subsidy.id}
              className={`flex-row items-center px-6 py-5 ${
                index !== 0 ? "border-t border-gray-100" : ""
              }`}
            >
              <View className="flex-[2]">
                <Text className="text-gray-900 text-base font-semibold">
                  {subsidy.programName}
                </Text>
                <Text className="text-gray-500 text-xs mt-1">{subsidy.id}</Text>
              </View>
              <View className="flex-[2]">
                <Text className="text-gray-700 text-sm">
                  {formatDate(subsidy.applicationDate)}
                </Text>
              </View>
              <View className="flex-[2]">
                <EthAmountDisplay
                  ethAmount={subsidy.amount}
                  textClassName="text-gray-900 text-sm font-semibold"
                  myrClassName="text-gray-500 text-[10px]"
                />
              </View>
              <View className="flex-[1.6]">
                <View
                  className={`flex-row items-center gap-1 px-2 py-1 rounded-full self-start ${getStatusColor(
                    subsidy.status
                  )}`}
                >
                  {getStatusIcon(subsidy.status)}
                  <Text className="text-xs font-semibold capitalize">
                    {subsidy.status}
                  </Text>
                </View>
              </View>
              <View className="flex-[0.6] items-end justify-end">
                <TouchableOpacity
                  onPress={() => handleViewDetails(subsidy)}
                  className="flex-row items-center justify-center gap-1 bg-emerald-50 border border-emerald-200 rounded-lg py-2 px-3"
                >
                  <Eye color="#059669" size={16} />
                  <Text className="text-emerald-700 text-xs font-semibold">
                    View
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </>
      )}
    </View>
  );

  const pageContent = (
    <View className="px-6 py-6">
      <StatsCards />
      <TotalAmountCard />

      <View className="bg-white rounded-xl p-5 border border-gray-200 mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-gray-900 text-lg font-bold">
            Enrolled Programs
          </Text>
        </View>
        {isLoadingFarmerPrograms ? (
          <Text className="text-gray-500 text-sm">
            Loading enrolled programs...
          </Text>
        ) : !farmerPrograms.length ? (
          <Text className="text-gray-500 text-sm">
            You have not enrolled in any programs yet.
          </Text>
        ) : (
          <View className="gap-3">
            {farmerPrograms.map((programs) => (
              <View
                key={programs.id}
                className="border border-gray-200 rounded-lg p-4 flex-row items-center justify-between"
              >
                <View className="flex-1 mr-3">
                  <Text className="text-gray-900 text-sm font-semibold">
                    {programs.name}
                  </Text>
                  <Text className="text-gray-500 text-xs mt-1">
                    Active: {formatDate(programs.startDate)} -{" "}
                    {formatDate(programs.endDate)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleOpenClaimModal(programs)}
                  disabled={isWriting || isWaitingReceipt || isSubmittingClaim}
                  className="rounded-lg overflow-hidden"
                  style={
                    isWriting || isWaitingReceipt || isSubmittingClaim
                      ? { opacity: 0.7 }
                      : undefined
                  }
                >
                  <LinearGradient
                    colors={["#22c55e", "#059669"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="flex-row items-center gap-2 px-4 py-2"
                  >
                    <Plus color="#fff" size={16} />
                    <Text className="text-white text-xs font-semibold">
                      Submit Subsidy
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {isDesktop ? (
        <SubsidiesTable />
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
              <SubsidyCard key={subsidy.id} subsidy={subsidy} />
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

  return (
    <>
      {pageContent}

      <Modal
        visible={showDetailsModal}
        transparent
        animationType={isDesktop ? "fade" : "slide"}
      >
        <View
          className={`flex-1 bg-black/50 ${
            isDesktop ? "justify-center items-center" : "justify-end"
          }`}
        >
          <View
            className={`bg-white p-6 max-h-[80%] ${
              isDesktop ? "rounded-xl w-full max-w-2xl mx-4" : "rounded-t-3xl"
            }`}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 text-xl font-bold">
                Subsidy Details
              </Text>
              <TouchableOpacity
                onPress={() => setShowDetailsModal(false)}
                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
              >
                <Text className="text-gray-600 text-lg">├ù</Text>
              </TouchableOpacity>
            </View>

            {selectedSubsidy && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="gap-4">
                  <View className="bg-gray-50 rounded-lg p-4">
                    <Text className="text-gray-600 text-xs mb-1">
                      Program Name
                    </Text>
                    <Text className="text-gray-900 text-[15px] font-semibold">
                      {selectedSubsidy.programName}
                    </Text>
                  </View>

                  <View className="bg-gray-50 rounded-lg p-4">
                    <Text className="text-gray-600 text-xs mb-1">ID</Text>
                    <Text className="text-gray-900 text-[15px] font-medium">
                      {selectedSubsidy.id}
                    </Text>
                  </View>

                  <View className="flex-row gap-3">
                    <View className="flex-1 bg-gray-50 rounded-lg p-4">
                      <Text className="text-gray-600 text-xs mb-1">Amount</Text>
                      <EthAmountDisplay
                        ethAmount={selectedSubsidy.amount}
                        textClassName="text-gray-900 text-[15px] font-bold"
                        myrClassName="text-gray-500 text-xs"
                      />
                    </View>
                    <View className="flex-1 bg-gray-50 rounded-lg p-4">
                      <Text className="text-gray-600 text-xs mb-1">Status</Text>
                      <View
                        className={`flex-row items-center gap-1 px-2 py-1 rounded-full self-start ${getStatusColor(
                          selectedSubsidy.status
                        )}`}
                      >
                        {getStatusIcon(selectedSubsidy.status)}
                        <Text className="text-xs font-semibold capitalize">
                          {selectedSubsidy.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="bg-gray-50 rounded-lg p-4">
                    <Text className="text-gray-600 text-xs mb-1">Farm</Text>
                    <Text className="text-gray-900 text-[15px] font-medium">
                      {selectedSubsidy.farmName}
                    </Text>
                  </View>

                  {selectedSubsidy.produceBatch && (
                    <View className="bg-gray-50 rounded-lg p-4">
                      <Text className="text-gray-600 text-xs mb-1">
                        Produce Batch
                      </Text>
                      <Text className="text-gray-900 text-[15px] font-medium">
                        {selectedSubsidy.produceBatch}
                      </Text>
                    </View>
                  )}

                  <View className="bg-gray-50 rounded-lg p-4">
                    <Text className="text-gray-600 text-xs mb-1">
                      Application Date
                    </Text>
                    <Text className="text-gray-900 text-[15px] font-medium">
                      {formatDate(selectedSubsidy.applicationDate)}
                    </Text>
                  </View>

                  {selectedSubsidy.approvalDate && (
                    <View className="bg-gray-50 rounded-lg p-4">
                      <Text className="text-gray-600 text-xs mb-1">
                        Approval Date
                      </Text>
                      <Text className="text-gray-900 text-[15px] font-medium">
                        {formatDate(selectedSubsidy.approvalDate)}
                      </Text>
                    </View>
                  )}

                  {selectedSubsidy.paymentStatus && (
                    <View className="bg-gray-50 rounded-lg p-4">
                      <Text className="text-gray-600 text-xs mb-1">
                        Payment Status
                      </Text>
                      <Text
                        className={`text-xs font-semibold capitalize px-3 py-1 rounded-full self-start ${getPaymentStatusColor(
                          selectedSubsidy.paymentStatus
                        )}`}
                      >
                        {selectedSubsidy.paymentStatus}
                      </Text>
                    </View>
                  )}

                  <View className="bg-gray-50 rounded-lg p-4">
                    <Text className="text-gray-600 text-xs mb-1">
                      Description
                    </Text>
                    <Text className="text-gray-900 text-sm">
                      {selectedSubsidy.description}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showClaimModal}
        transparent
        animationType={isDesktop ? "fade" : "slide"}
      >
        <View
          className={`flex-1 bg-black/50 ${
            isDesktop ? "justify-center items-center" : "justify-end"
          }`}
        >
          <View
            className={`bg-white p-6 max-h-[80%] ${
              isDesktop ? "rounded-xl w-full max-w-2xl mx-4" : "rounded-t-3xl"
            }`}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 text-xl font-bold">
                Submit Subsidy
              </Text>
              <TouchableOpacity
                onPress={() => {
                  cleanupUploadedFiles(claimEvidenceFiles);
                  setClaimEvidenceFiles([]);
                  setClaimAmount("");
                  setValidationErrors({});
                  setExceedMaxMessage("");
                  setShowClaimModal(false);
                }}
                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
              >
                <Text className="text-gray-600 text-lg">×</Text>
              </TouchableOpacity>
            </View>

            {selectedProgram && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="gap-4">
                  <View className="bg-gray-50 rounded-lg p-4">
                    <Text className="text-gray-600 text-xs mb-1">Program</Text>
                    <Text className="text-gray-900 text-[15px] font-semibold">
                      {selectedProgram.name}
                    </Text>
                    <Text className="text-gray-500 text-xs mt-1">
                      Active: {formatDate(selectedProgram.startDate)} -{" "}
                      {formatDate(selectedProgram.endDate)}
                    </Text>
                  </View>

                  <View className="bg-gray-50 rounded-lg p-4">
                    <Text className="text-gray-600 text-xs mb-1">
                      Select Farm
                    </Text>
                    {verifiedFarms.length === 0 ? (
                      <Text className="text-gray-500 text-xs">
                        No verified farms available. Verify a farm to proceed.
                      </Text>
                    ) : (
                      <View className="gap-2">
                        {verifiedFarms.map((farm) => (
                          <View
                            key={farm.id}
                            className="flex-row items-center justify-between"
                          >
                            <View className="flex-1 mr-2">
                              <Text className="text-gray-900 text-xs font-semibold">
                                {farm.name}
                              </Text>
                              <Text className="text-gray-500 text-[11px]">
                                {formatFarmLocation(farm) ||
                                  "Location unavailable"}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  <View className="bg-gray-50 rounded-lg p-4">
                    <Text className="text-gray-600 text-xs mb-1">
                      Requested Payout Amount (ETH)
                    </Text>
                    <TextInput
                      value={claimAmount}
                      onChangeText={(text) => {
                        // Only allow numbers and a single decimal point
                        let sanitized = text
                          .replace(/[^0-9.]/g, "")
                          .replace(/\./g, (match, offset) => {
                            // Only allow first decimal point
                            return text.indexOf(".") === offset ? match : "";
                          });

                        // Auto-correct if exceeds max payout
                        if (
                          selectedProgram?.payoutRule?.maxCap !== undefined &&
                          selectedProgram.payoutRule?.maxCap !== null
                        ) {
                          const maxPayout = Number(
                            selectedProgram.payoutRule.maxCap
                          );
                          const enteredValue = Number(sanitized);

                          if (
                            !Number.isNaN(enteredValue) &&
                            enteredValue > maxPayout
                          ) {
                            sanitized = maxPayout.toString();
                            setExceedMaxMessage(
                              `You cannot exceed ${formatEth(
                                maxPayout
                              )} ETH (max payout)`
                            );
                          } else {
                            setExceedMaxMessage("");
                          }
                        } else {
                          setExceedMaxMessage("");
                        }

                        setClaimAmount(sanitized);
                        // Clear validation error when user types
                        if (validationErrors.amount) {
                          setValidationErrors({});
                        }
                      }}
                      placeholder="e.g., 0.5"
                      keyboardType="numeric"
                      className={`bg-white border rounded-lg px-3 py-2 text-gray-900 text-sm ${
                        validationErrors.amount || exceedMaxMessage
                          ? "border-red-400"
                          : "border-gray-300"
                      }`}
                      placeholderTextColor="#9ca3af"
                    />
                    {exceedMaxMessage && (
                      <Text className="text-red-500 text-xs mt-1">
                        {exceedMaxMessage}
                      </Text>
                    )}
                    {validationErrors.amount && (
                      <Text className="text-red-500 text-xs mt-1">
                        {validationErrors.amount}
                      </Text>
                    )}
                    {claimAmount &&
                      ethToMyrRate &&
                      !Number.isNaN(Number(claimAmount)) && (
                        <Text className="text-gray-500 text-[11px] mt-1">
                          ≈{" "}
                          {formatCurrency(
                            ethToMyr(Number(claimAmount), ethToMyrRate) ?? 0
                          )}
                        </Text>
                      )}
                    <Text className="text-gray-500 text-[11px] mt-1">
                      Max payout for this program:{" "}
                      {selectedProgram.payoutRule?.maxCap !== undefined &&
                      selectedProgram.payoutRule?.maxCap !== null
                        ? ethToMyrRate
                          ? `${formatEth(
                              selectedProgram.payoutRule.maxCap
                            )} (${formatCurrency(
                              ethToMyr(
                                selectedProgram.payoutRule.maxCap,
                                ethToMyrRate
                              ) ?? 0
                            )})`
                          : formatEth(selectedProgram.payoutRule.maxCap)
                        : formatEth(0)}
                    </Text>
                  </View>

                  <View className="bg-gray-50 rounded-lg p-4">
                    <Text className="text-gray-600 text-xs mb-1">
                      Evidence *
                    </Text>
                    <FileUploadPanel
                      title="Upload Evidence"
                      subtitle="Supported formats: JPG, PNG, HEIC, HEIF or PDF"
                      helperLines={[
                        "Only one file can be attached for this claim.",
                        "For the best review speed, attach clear photos or scanned documents.",
                      ]}
                      buttonLabel="Add Evidence"
                      files={claimEvidenceFiles}
                      onFilesAdded={(files) => {
                        handleClaimEvidenceAdded(files);
                        // Clear validation error when file is added
                        if (validationErrors.evidence) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            evidence: undefined,
                          }));
                        }
                      }}
                      onRemoveFile={(fileId) => {
                        handleClaimEvidenceRemoved(fileId);
                        // Set validation error if no files remain
                        if (claimEvidenceFiles.length === 1) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            evidence:
                              "Evidence is required. Please upload at least one file.",
                          }));
                        }
                      }}
                    />
                    {validationErrors.evidence && (
                      <Text className="text-red-500 text-xs mt-1">
                        {validationErrors.evidence}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={handleSubmitClaim}
                    disabled={
                      isSubmittingClaim || isWriting || isWaitingReceipt
                    }
                    className="rounded-lg overflow-hidden mt-2"
                    style={
                      isSubmittingClaim || isWriting || isWaitingReceipt
                        ? { opacity: 0.7 }
                        : undefined
                    }
                  >
                    <LinearGradient
                      colors={["#22c55e", "#059669"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="py-3 items-center"
                    >
                      <Text className="text-white text-[15px] font-semibold">
                        {isSubmittingClaim ? "Submitting..." : "Submit Subsidy"}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}
