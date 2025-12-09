import { useCallback, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
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
} from "@/components/farmer/farm-produce/utils";
import { router } from "expo-router";
import { useFarmerPoliciesQuery } from "@/hooks/usePolicy";
import { useFarmsQuery } from "@/hooks/useFarm";
import { useSubsidyPayout } from "@/hooks/useBlockchain";
import {
  useRequestSubsidyMutation,
  useUploadSubsidyEvidenceMutation,
} from "@/hooks/useSubsidy";
import FileUploadPanel, {
  cleanupUploadedFiles,
} from "@/components/common/FileUploadPanel";
import type { UploadedDocument } from "@/validation/upload";
import type { PolicyResponseDto, FarmListRespondDto } from "@/api";
import { formatFarmLocation } from "@/utils/farm";
import Toast from "react-native-toast-message";

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
  referenceId: string;
}

const mockSubsidies: Subsidy[] = [
  {
    id: "1",
    programName: "Paddy Fertilizer Aid 2025",
    applicationDate: "2025-10-01",
    amount: 2500,
    status: "approved",
    description:
      "Financial assistance for purchasing organic fertilizers for paddy cultivation",
    farmName: "Green Valley Farm",
    produceBatch: "FARM-BCH-0017",
    approvalDate: "2025-10-05",
    paymentStatus: "paid",
    referenceId: "SUB-2025-0017",
  },
  {
    id: "2",
    programName: "Organic Farming Support Grant",
    applicationDate: "2025-10-08",
    amount: 3500,
    status: "pending",
    description:
      "Support grant for farmers transitioning to organic farming practices",
    farmName: "Green Valley Farm",
    produceBatch: "FARM-BCH-0016",
    paymentStatus: "pending",
    referenceId: "SUB-2025-0024",
  },
  {
    id: "3",
    programName: "Smart Farming Technology Subsidy",
    applicationDate: "2025-09-20",
    amount: 5000,
    status: "approved",
    description: "Subsidy for adopting IoT and smart farming technologies",
    farmName: "Green Valley Farm",
    produceBatch: "FARM-BCH-0015",
    approvalDate: "2025-09-25",
    paymentStatus: "processing",
    referenceId: "SUB-2025-0012",
  },
  {
    id: "4",
    programName: "Crop Insurance Support",
    applicationDate: "2025-09-10",
    amount: 1800,
    status: "rejected",
    description: "Subsidized crop insurance for rice farmers",
    farmName: "Green Valley Farm",
    produceBatch: "FARM-BCH-0014",
    referenceId: "SUB-2025-0008",
  },
  {
    id: "5",
    programName: "Irrigation Modernization Grant",
    applicationDate: "2025-08-15",
    amount: 4200,
    status: "approved",
    description: "Grant for upgrading irrigation systems and water management",
    farmName: "Green Valley Farm",
    produceBatch: "FARM-BCH-0012",
    approvalDate: "2025-08-22",
    paymentStatus: "paid",
    referenceId: "SUB-2025-0003",
  },
];

export default function SubsidyManagementScreen() {
  const { isDesktop } = useResponsiveLayout();

  const [subsidies] = useState<Subsidy[]>(mockSubsidies);
  const [selectedSubsidy, setSelectedSubsidy] = useState<Subsidy | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] =
    useState<PolicyResponseDto | null>(null);
  const [claimAmount, setClaimAmount] = useState("");
  const [claimRemarks, setClaimRemarks] = useState("");
  const [claimEvidenceFiles, setClaimEvidenceFiles] = useState<
    UploadedDocument[]
  >([]);
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);

  const { policies: farmerPolicies, isLoading: isLoadingFarmerPolicies } =
    useFarmerPoliciesQuery();
  const { data: farmsData } = useFarmsQuery();
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

  const {
    walletAddress,
    submitClaim,
    hashMetadata,
    enrollInPolicy,
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

  const handleOpenClaimModal = (policy: PolicyResponseDto) => {
    setSelectedPolicy(policy);
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

  const handleSubmitClaim = async () => {
    if (!selectedPolicy) return;
    if (!walletAddress) {
      Toast.show({
        type: "error",
        text1: "Connect your wallet to submit a claim.",
      });
      return;
    }

    const parsedAmount = Number(claimAmount);
    const maxPayoutAmount =
      selectedPolicy.payoutRule?.amount !== undefined &&
      selectedPolicy.payoutRule?.amount !== null
        ? Number(selectedPolicy.payoutRule.amount)
        : null;

    if (!claimAmount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      Toast.show({
        type: "error",
        text1: "Enter a payout amount greater than 0.",
      });
      return;
    }
    if (
      maxPayoutAmount &&
      maxPayoutAmount > 0 &&
      parsedAmount > maxPayoutAmount
    ) {
      Toast.show({
        type: "error",
        text1: `Requested amount exceeds max payout of ${formatCurrency(
          maxPayoutAmount
        )}.`,
      });
      return;
    }

    if (!verifiedFarms.length) {
      Toast.show({
        type: "error",
        text1: "No verified farms available for this claim.",
      });
      return;
    }

    try {
      setIsSubmittingClaim(true);
      const onChainId = selectedPolicy.onchainId;
      let policyIdBigInt: bigint;
      try {
        policyIdBigInt = BigInt(onChainId);
      } catch {
        Toast.show({
          type: "error",
          text1: "Policy on-chain ID is not valid for claim submission.",
        });
        return;
      }

      const metadataPayload = JSON.stringify({
        amount: parsedAmount,
        remarks: claimRemarks ?? "",
        policyId: selectedPolicy.id,
        policyOnChainId: onChainId,
        timestamp: Date.now(),
      });
      const metadataHash = hashMetadata(metadataPayload);

      const { claimId, txHash } = await submitClaim(
        policyIdBigInt,
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
        policyId: selectedPolicy.id,
        metadataHash,
      });

      const evidenceFile = claimEvidenceFiles[0];
      if (subsidy?.id && evidenceFile?.file) {
        try {
          await uploadSubsidyEvidence(subsidy.id, {
            file: evidenceFile.file as Blob,
          });
        } catch (error) {
          Toast.show({
            type: "error",
            text1: "Evidence upload failed",
            text2:
              (error as Error)?.message ??
              "Your claim was submitted, but the evidence upload did not complete.",
          });
        }
      }

      cleanupUploadedFiles(claimEvidenceFiles);
      setClaimEvidenceFiles([]);
      setShowClaimModal(false);

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
          <Text className="text-white text-3xl font-bold">
            {formatCurrency(stats.totalAmount)}
          </Text>
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
          <Text className="text-gray-500 text-xs">
            Ref: {subsidy.referenceId}
          </Text>
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
          <Text className="text-gray-900 text-sm font-bold">
            {formatCurrency(subsidy.amount)}
          </Text>
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
    <View className="bg-white rounded-xl p-6 border border-gray-200">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-gray-900 text-lg font-bold">
          Active Subsidies
        </Text>
      </View>

      <View className="flex-row border-b border-gray-200 pb-3 mb-3">
        <Text className="flex-1 text-gray-600 text-xs font-semibold">
          Program Name
        </Text>
        <Text className="w-28 text-gray-600 text-xs font-semibold">
          Applied Date
        </Text>
        <Text className="w-24 text-gray-600 text-xs font-semibold">Amount</Text>
        <Text className="w-24 text-gray-600 text-xs font-semibold">Status</Text>
        <Text className="w-20 text-gray-600 text-xs font-semibold">Action</Text>
      </View>

      <ScrollView className="max-h-[400px]">
        {subsidies.map((subsidy) => (
          <View
            key={subsidy.id}
            className="flex-row items-center py-3 border-b border-gray-100"
          >
            <View className="flex-1">
              <Text className="text-gray-900 text-sm font-medium">
                {subsidy.programName}
              </Text>
              <Text className="text-gray-500 text-xs mt-0.5">
                Ref: {subsidy.referenceId}
              </Text>
            </View>
            <Text className="w-28 text-gray-700 text-sm">
              {formatDate(subsidy.applicationDate)}
            </Text>
            <Text className="w-24 text-gray-900 text-sm font-semibold">
              {formatCurrency(subsidy.amount)}
            </Text>
            <View className="w-24">
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
            <View className="w-20">
              <TouchableOpacity
                onPress={() => handleViewDetails(subsidy)}
                className="flex-row items-center justify-center gap-1 bg-emerald-50 border border-emerald-200 rounded-lg py-1.5 px-2"
              >
                <Eye color="#059669" size={14} />
                <Text className="text-emerald-700 text-xs font-semibold">
                  View
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const pageContent = (
    <View className="px-6 py-6">
      <StatsCards />
      <TotalAmountCard />

      <View className="bg-white rounded-xl p-5 border border-gray-200 mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-gray-900 text-lg font-bold">
            Enrolled Policies
          </Text>
        </View>
        {isLoadingFarmerPolicies ? (
          <Text className="text-gray-500 text-sm">
            Loading enrolled policies...
          </Text>
        ) : !farmerPolicies.length ? (
          <Text className="text-gray-500 text-sm">
            You have not enrolled in any policies yet.
          </Text>
        ) : (
          <View className="gap-3">
            {farmerPolicies.map((policy) => (
              <View
                key={policy.id}
                className="border border-gray-200 rounded-lg p-4 flex-row items-center justify-between"
              >
                <View className="flex-1 mr-3">
                  <Text className="text-gray-900 text-sm font-semibold">
                    {policy.name}
                  </Text>
                  <Text className="text-gray-500 text-xs mt-1">
                    Active: {formatDate(policy.startDate)} -{" "}
                    {formatDate(policy.endDate)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleOpenClaimModal(policy)}
                  disabled={isWriting || isWaitingReceipt || isSubmittingClaim}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600"
                  style={
                    isWriting || isWaitingReceipt || isSubmittingClaim
                      ? { opacity: 0.7 }
                      : undefined
                  }
                >
                  <Text className="text-white text-xs font-semibold">
                    Submit Subsidy
                  </Text>
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

          {subsidies.map((subsidy) => (
            <SubsidyCard key={subsidy.id} subsidy={subsidy} />
          ))}
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

      <Modal visible={showDetailsModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
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
                    <Text className="text-gray-600 text-xs mb-1">
                      Reference ID
                    </Text>
                    <Text className="text-gray-900 text-[15px] font-medium">
                      {selectedSubsidy.referenceId}
                    </Text>
                  </View>

                  <View className="flex-row gap-3">
                    <View className="flex-1 bg-gray-50 rounded-lg p-4">
                      <Text className="text-gray-600 text-xs mb-1">Amount</Text>
                      <Text className="text-gray-900 text-[15px] font-bold">
                        {formatCurrency(selectedSubsidy.amount)}
                      </Text>
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

      <Modal visible={showClaimModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 text-xl font-bold">
                Submit Subsidy
              </Text>
              <TouchableOpacity
                onPress={() => {
                  cleanupUploadedFiles(claimEvidenceFiles);
                  setClaimEvidenceFiles([]);
                  setShowClaimModal(false);
                }}
                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
              >
                <Text className="text-gray-600 text-lg">×</Text>
              </TouchableOpacity>
            </View>

            {selectedPolicy && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="gap-4">
                  <View className="bg-gray-50 rounded-lg p-4">
                    <Text className="text-gray-600 text-xs mb-1">Policy</Text>
                    <Text className="text-gray-900 text-[15px] font-semibold">
                      {selectedPolicy.name}
                    </Text>
                    <Text className="text-gray-500 text-xs mt-1">
                      Active: {formatDate(selectedPolicy.startDate)} -{" "}
                      {formatDate(selectedPolicy.endDate)}
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
                      Requested Payout Amount (RM)
                    </Text>
                    <TextInput
                      value={claimAmount}
                      onChangeText={(text) => {
                        const sanitized = text.replace(/[^0-9.]/g, "");
                        setClaimAmount(sanitized);
                      }}
                      placeholder="e.g., 5000"
                      keyboardType="numeric"
                      className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm"
                      placeholderTextColor="#9ca3af"
                    />
                    <Text className="text-gray-500 text-[11px] mt-1">
                      Max payout for this program:{" "}
                      {formatCurrency(selectedPolicy.payoutRule?.maxCap ?? 0)}
                    </Text>
                  </View>

                  <View className="bg-gray-50 rounded-lg p-4">
                    <Text className="text-gray-600 text-xs mb-1">
                      Evidence (Optional)
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
                      onFilesAdded={handleClaimEvidenceAdded}
                      onRemoveFile={handleClaimEvidenceRemoved}
                    />
                  </View>

                  <View className="bg-gray-50 rounded-lg p-4">
                    <Text className="text-gray-600 text-xs mb-1">
                      Remarks (Optional)
                    </Text>
                    <TextInput
                      value={claimRemarks}
                      onChangeText={setClaimRemarks}
                      placeholder="Add any additional notes..."
                      multiline
                      numberOfLines={3}
                      className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm"
                      placeholderTextColor="#9ca3af"
                      style={{ textAlignVertical: "top" }}
                    />
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
