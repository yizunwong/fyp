import { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Linking,
} from "react-native";
import { Image } from "expo-image";
import {
  CheckCircle,
  XCircle,
  FileText,
  Save,
  AlertTriangle,
  ArrowLeft,
  User,
  Calendar,
  DollarSign,
  Hash,
  Link as LinkIcon,
  ChevronUp,
  ChevronDown,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import {
  useSubsidyQuery,
  useApproveSubsidyMutation,
  useDisburseSubsidyMutation,
} from "@/hooks/useSubsidy";
import { useProgramsQuery } from "@/hooks/useProgram";
import { useSubsidyPayout } from "@/hooks/useBlockchain";
import type { SubsidyResponseDto } from "@/api";
import {
  formatDate,
  formatCurrency,
  ethToMyr,
} from "@/components/farmer/farm-produce/utils";
import EthAmountDisplay from "@/components/common/EthAmountDisplay";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useEthToMyr } from "@/hooks/useEthToMyr";
import { useAppLayout } from '@/components/layout';

function StatusBadge({ status }: { status: SubsidyResponseDto["status"] }) {
  const getStatusColor = (status: SubsidyResponseDto["status"]) => {
    switch (status) {
      case "APPROVED":
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

  return (
    <View className={`px-2 py-0.5 rounded-full ${getStatusColor(status)}`}>
      <Text className="text-xs font-semibold capitalize">
        {getStatusLabel(status)}
      </Text>
    </View>
  );
}

export default function ClaimReviewPage() {
  const params = useLocalSearchParams<{ claimId?: string }>();
  const {
    data: subsidyData,
    isLoading,
    refetch: refetchSubsidy,
  } = useSubsidyQuery(params.claimId);
  const { programs } = useProgramsQuery();
  const { isDesktop } = useResponsiveLayout();
  const {
    approveClaim,
    disburseClaim,
    isWriting,
    isWaitingReceipt,
    publicClient,
  } = useSubsidyPayout();
  const { approveSubsidy, isPending: isApprovingSubsidy } =
    useApproveSubsidyMutation();
  const { disburseSubsidy, isPending: isDisbursingSubsidy } =
    useDisburseSubsidyMutation();

  const subsidy = useMemo(() => subsidyData?.data, [subsidyData]);
  const claimId = useMemo(() => (subsidy ? subsidy.id : ""), [subsidy]);
  const program = useMemo(
    () =>
      subsidy?.programsId && programs
        ? programs.find((p) => p.id === subsidy.programsId) ?? null
        : null,
    [subsidy, programs]
  );

  const [rejectReason, setRejectReason] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [payoutAmount, setPayoutAmount] = useState<string>("0.00001");
  const { ethToMyr: ethToMyrRate } = useEthToMyr();

  const isApproving = isWriting || isWaitingReceipt || isApprovingSubsidy;
  const isDisbursing = isWriting || isWaitingReceipt || isDisbursingSubsidy;

  const minPayout = 0.00001;
  const incrementPayout = () => {
    const current = parseFloat(payoutAmount) || minPayout;
    const newAmount = current + 0.00001;
    setPayoutAmount(newAmount.toFixed(5));
  };

  const decrementPayout = () => {
    const current = parseFloat(payoutAmount) || minPayout;
    const newAmount = Math.max(minPayout, current - 0.00001);
    setPayoutAmount(newAmount.toFixed(5));
  };

  useAppLayout({
    title: subsidy ? `Review ${claimId}` : "Review Claim",
    subtitle: "Verify evidence and approve or reject subsidy claims",
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900 px-6">
        <Text className="text-gray-600 dark:text-gray-400 text-sm">Loading claim details...</Text>
      </View>
    );
  }

  if (!subsidy) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900 px-6">
        <Text className="text-gray-900 dark:text-gray-100 text-xl font-bold mb-2">
          Claim not found
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          The requested claim could not be located.
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/dashboard/agency/approvals" as never)}
          className="px-4 py-2 bg-blue-600 rounded-lg"
        >
          <Text className="text-white font-semibold">Back to queue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleApprove = async () => {
    if (!subsidy) return;

    // Check if onChainClaimId exists
    if (!subsidy.onChainClaimId) {
      Toast.show({
        type: "error",
        text1: "Cannot approve",
        text2: "This claim does not have an on-chain claim ID",
      });
      return;
    }

    // Check if already approved
    if (subsidy.status !== "PENDING") {
      Toast.show({
        type: "error",
        text1: "Cannot approve",
        text2: `This claim is already ${subsidy.status.toLowerCase()}`,
      });
      return;
    }

    try {
      // Step 1: Approve on blockchain
      Toast.show({
        type: "info",
        text1: "Approving on blockchain...",
        text2: "Please confirm the transaction in your wallet",
      });

      const txHash = await approveClaim(BigInt(subsidy.onChainClaimId));

      // Wait for transaction receipt
      Toast.show({
        type: "info",
        text1: "Waiting for confirmation...",
        text2: "Transaction is being processed on the blockchain",
      });

      // Wait for receipt using publicClient
      await publicClient.waitForTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      // Step 2: Update database after blockchain approval
      Toast.show({
        type: "info",
        text1: "Updating database...",
        text2: "Syncing approval status",
      });

      await approveSubsidy(subsidy.id);

      // Step 3: Refresh data and show success
      await refetchSubsidy();

      Toast.show({
        type: "success",
        text1: "Claim approved",
        text2: "The subsidy has been approved and processed",
      });

      // Navigate back to approvals list after a short delay
      setTimeout(() => {
        router.push("/dashboard/agency/approvals");
      }, 1500);
    } catch (error: any) {
      console.error("Error approving claim:", error);

      // Extract error message from various error formats
      let errorMessage = "";
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.shortMessage) {
        errorMessage = error.shortMessage;
      } else if (error?.reason) {
        errorMessage = error.reason;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else {
        errorMessage = "Something went wrong";
      }

      let userMessage = errorMessage;
      let title = "Approval failed";

      // Check for specific error cases
      if (
        errorMessage.includes("Insufficient contract balance") ||
        errorMessage.includes("Insufficient balance") ||
        errorMessage.toLowerCase().includes("insufficient")
      ) {
        title = "Insufficient Contract Balance";
        userMessage =
          "The contract does not have enough funds to pay out this subsidy. Please deposit funds to the contract before approving claims.";
      } else if (errorMessage.includes("reverted")) {
        title = "Transaction Reverted";
        // Try to extract the reason string from the error
        const reasonMatch = errorMessage.match(
          /reason string ['"]([^'"]+)['"]/
        );
        if (reasonMatch && reasonMatch[1]) {
          userMessage = reasonMatch[1];
        } else if (errorMessage.includes("reason string")) {
          userMessage =
            errorMessage
              .split("reason string")[1]
              ?.replace(/['"]/g, "")
              .trim() || "Transaction was reverted";
        } else {
          userMessage =
            "The transaction was reverted. Please check the contract state.";
        }
      } else if (
        errorMessage.includes("User rejected") ||
        errorMessage.includes("user rejected") ||
        errorMessage.includes("User denied") ||
        errorMessage.includes("user denied")
      ) {
        title = "Transaction Cancelled";
        userMessage = "You cancelled the transaction in your wallet.";
      } else if (errorMessage.includes("insufficient funds")) {
        title = "Insufficient Funds";
        userMessage =
          "Your wallet does not have enough funds to pay for the transaction gas fees.";
      }

      Toast.show({
        type: "error",
        text1: title,
        text2: userMessage,
      });
    }
  };

  const handleDisburse = async () => {
    if (!subsidy) return;

    // Check if onChainClaimId exists
    if (!subsidy.onChainClaimId) {
      Toast.show({
        type: "error",
        text1: "Cannot disburse",
        text2: "This claim does not have an on-chain claim ID",
      });
      return;
    }

    // Check if already disbursed
    if (subsidy.status !== "APPROVED") {
      Toast.show({
        type: "error",
        text1: "Cannot disburse",
        text2: `This claim must be approved before disbursement. Current status: ${subsidy.status.toLowerCase()}`,
      });
      return;
    }

    try {
      // Step 1: Disburse on blockchain
      Toast.show({
        type: "info",
        text1: "Disbursing on blockchain...",
        text2: "Please confirm the transaction in your wallet",
      });

      const txHash = await disburseClaim(BigInt(subsidy.onChainClaimId));

      // Wait for transaction receipt
      Toast.show({
        type: "info",
        text1: "Waiting for confirmation...",
        text2: "Transaction is being processed on the blockchain",
      });

      // Wait for receipt using publicClient
      await publicClient.waitForTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      // Step 2: Update database after blockchain disbursement
      Toast.show({
        type: "info",
        text1: "Updating database...",
        text2: "Syncing disbursement status",
      });

      await disburseSubsidy(subsidy.id);

      // Step 3: Refresh data and show success
      await refetchSubsidy();

      Toast.show({
        type: "success",
        text1: "Claim disbursed",
        text2: "The subsidy has been disbursed successfully",
      });

      // Navigate back to approvals list after a short delay
      setTimeout(() => {
        router.push("/dashboard/agency/approvals");
      }, 1500);
    } catch (error: any) {
      console.error("Error disbursing claim:", error);

      // Extract error message from various error formats
      let errorMessage = "";
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.shortMessage) {
        errorMessage = error.shortMessage;
      } else if (error?.reason) {
        errorMessage = error.reason;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else {
        errorMessage = "Something went wrong";
      }

      let userMessage = errorMessage;
      let title = "Disbursement failed";

      // Check for specific error cases
      if (
        errorMessage.includes("Insufficient contract balance") ||
        errorMessage.includes("Insufficient balance") ||
        errorMessage.toLowerCase().includes("insufficient")
      ) {
        title = "Insufficient Contract Balance";
        userMessage =
          "The contract does not have enough funds to disburse this subsidy. Please deposit funds to the contract before disbursing claims.";
      } else if (errorMessage.includes("reverted")) {
        title = "Transaction Reverted";
        const reasonMatch = errorMessage.match(
          /reason string ['"]([^'"]+)['"]/
        );
        if (reasonMatch && reasonMatch[1]) {
          userMessage = reasonMatch[1];
        } else {
          userMessage =
            "The transaction was reverted. Please check the contract state.";
        }
      } else if (
        errorMessage.includes("User rejected") ||
        errorMessage.includes("user rejected") ||
        errorMessage.includes("User denied") ||
        errorMessage.includes("user denied")
      ) {
        title = "Transaction Cancelled";
        userMessage = "You cancelled the transaction in your wallet.";
      } else if (errorMessage.includes("insufficient funds")) {
        title = "Insufficient Funds";
        userMessage =
          "Your wallet does not have enough funds to pay for the transaction gas fees.";
      }

      Toast.show({
        type: "error",
        text1: title,
        text2: userMessage,
      });
    }
  };

  const handleReject = () => {
    console.log("Rejecting claim:", subsidy?.id, rejectReason);
    router.push("/dashboard/agency/approvals");
  };

  const handleRequestDocs = () => {
    console.log("Requesting docs for claim:", subsidy?.id);
    router.push("/dashboard/agency/approvals");
  };

  const handleSaveDraft = () => {
    console.log("Saving draft for claim:", subsidy?.id, reviewNotes);
  };

  const FormField = ({
    label,
    value,
    icon: Icon,
    valueComponent,
  }: {
    label: string;
    value?: string | null;
    icon?: React.ComponentType<{ color: string; size: number }>;
    valueComponent?: React.ReactNode;
  }) => (
    <View className="mb-4">
      <Text className="text-gray-600 dark:text-gray-400 text-xs mb-1">{label}</Text>
      <View className="flex-row items-center bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3">
        {Icon && (
          <View className="mr-3">
            <Icon color="#6b7280" size={18} />
          </View>
        )}
        <View className="flex-1">
          {valueComponent || (
            <Text className="text-gray-900 dark:text-gray-100 text-sm">{value || "—"}</Text>
          )}
        </View>
      </View>
    </View>
  );

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
                Review Claim
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">{claimId}</Text>
            </View>
          </View>
          <StatusBadge status={subsidy.status} />
        </View>
      )}

      {isDesktop ? (
        <View className="px-6 pb-6 pt-4 flex-row gap-6">
          <View className="flex-1">
            <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              {/* A. Claim Information */}
              <Text className="text-gray-900 dark:text-gray-100 text-base font-bold mb-4">
                Claim Information
              </Text>

              {/* Farmer Identity */}
              <View className="mb-4">
                <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
                  Farmer Identity
                </Text>
                <View className="gap-3">
                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <FormField
                        label="Farmer Name"
                        value={subsidy.farmer?.username || undefined}
                        icon={User}
                      />
                    </View>
                    <View className="flex-1">
                      <FormField
                        label="NRIC"
                        value={subsidy.farmer?.nric || undefined}
                      />
                    </View>
                  </View>
                  <FormField
                    label="Email Address"
                    value={subsidy.farmer?.email || undefined}
                  />
                </View>
              </View>

              <View className="border-b border-gray-200 dark:border-gray-700 mb-4" />

              {/* Program Details */}
              <View className="mb-4">
                <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
                  Program Details
                </Text>
                <View className="gap-3">
                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <FormField
                        label="Program"
                        value={program?.name || undefined}
                      />
                    </View>
                    <View className="flex-1">
                      <FormField label="Claim ID" value={claimId} icon={Hash} />
                    </View>
                  </View>
                </View>
              </View>

              <View className="border-b border-gray-200 dark:border-gray-700 mb-4" />

              {/* Claim Details */}
              <View className="mb-4">
                <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
                  Claim Details
                </Text>
                <View className="gap-3">
                  <FormField
                    label="Claim Amount"
                    valueComponent={
                      <EthAmountDisplay
                        ethAmount={subsidy.amount}
                        textClassName="text-gray-900 dark:text-gray-100 text-sm"
                        myrClassName="text-gray-500 dark:text-gray-400 text-xs"
                      />
                    }
                    icon={DollarSign}
                  />
                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <FormField
                        label="Submission Date"
                        value={formatDate(subsidy.createdAt)}
                        icon={Calendar}
                      />
                    </View>
                    {subsidy.approvedAt && (
                      <View className="flex-1">
                        <FormField
                          label="Approved Date"
                          value={formatDate(subsidy.approvedAt)}
                          icon={Calendar}
                        />
                      </View>
                    )}
                  </View>
                  {subsidy.paidAt && (
                    <FormField
                      label="Paid Date"
                      value={formatDate(subsidy.paidAt)}
                      icon={Calendar}
                    />
                  )}
                </View>
              </View>

              <View className="border-b border-gray-200 dark:border-gray-700 mb-4" />

              {/* B. Blockchain Information */}
              <Text className="text-gray-900 dark:text-gray-100 text-base font-bold mb-3">
                Blockchain Information
              </Text>
              <View className="gap-3 mb-4">
                <FormField
                  label="Transaction Hash"
                  value={subsidy.onChainTxHash || undefined}
                  icon={LinkIcon}
                />
                {subsidy.onChainClaimId && (
                  <FormField
                    label="On-chain Claim ID"
                    value={String(subsidy.onChainClaimId)}
                    icon={Hash}
                  />
                )}
                <FormField
                  label="Metadata Hash"
                  value={subsidy.metadataHash || undefined}
                  icon={Hash}
                />
              </View>

              <View className="border-b border-gray-200 dark:border-gray-700 mb-4" />

              {/* C. Evidence & Documentation */}
              <Text className="text-gray-900 dark:text-gray-100 text-base font-bold mb-3">
                Evidence & Documentation
              </Text>
              <View className="gap-3 mb-4">
                {subsidy.metadataHash && (
                  <View className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3">
                    <View className="flex-row items-center gap-2 mb-1">
                      <CheckCircle color="#15803d" size={16} />
                      <Text className="text-green-800 dark:text-green-300 text-sm font-semibold">
                        Metadata Available
                      </Text>
                    </View>
                    <Text className="text-green-700 dark:text-green-400 text-xs font-mono mt-1">
                      {subsidy.metadataHash}
                    </Text>
                  </View>
                )}

                {/* Evidence Documents */}
                {subsidy.evidences && subsidy.evidences.length > 0 ? (
                  <View className="gap-3">
                    <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold">
                      Uploaded Evidence ({subsidy.evidences.length})
                    </Text>
                    {subsidy.evidences.map((evidence) => {
                      const isPhoto = evidence.type === "PHOTO";
                      const isPdf = evidence.type === "PDF";
                      const isImage =
                        isPhoto ||
                        (evidence.mimeType?.startsWith("image/") ?? false);

                      return (
                        <View
                          key={evidence.id}
                          className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                        >
                          <View className="flex-row gap-4">
                            {/* Preview/Icon */}
                            <View className="w-32">
                              {isImage && evidence.storageUrl ? (
                                <View className="h-40 w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-600">
                                  <Image
                                    source={{ uri: evidence.storageUrl }}
                                    style={{ width: "100%", height: "100%" }}
                                    contentFit="cover"
                                  />
                                </View>
                              ) : (
                                <View className="h-40 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 items-center justify-center">
                                  <FileText color="#6b7280" size={32} />
                                  <Text className="text-gray-600 dark:text-gray-400 text-xs mt-2 font-semibold">
                                    {isPdf ? "PDF" : "DOCUMENT"}
                                  </Text>
                                </View>
                              )}
                            </View>

                            {/* Details */}
                            <View className="flex-1 gap-2">
                              <View>
                                <Text className="text-gray-900 dark:text-gray-100 text-sm font-semibold">
                                  {evidence.fileName ||
                                    `Evidence ${evidence.type}`}
                                </Text>
                                <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                                  {evidence.type === "PHOTO"
                                    ? "Photo"
                                    : "PDF Document"}
                                </Text>
                                {evidence.fileSize && (
                                  <Text className="text-gray-500 dark:text-gray-400 text-xs">
                                    {(evidence.fileSize / 1024).toFixed(2)} KB
                                  </Text>
                                )}
                              </View>

                              {/* View Button */}
                              <TouchableOpacity
                                onPress={() => {
                                  if (evidence.storageUrl) {
                                    Linking.openURL(evidence.storageUrl);
                                  }
                                }}
                                className="self-start mt-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg"
                                disabled={!evidence.storageUrl}
                              >
                                <View className="flex-row items-center gap-2">
                                  <LinkIcon color="#2563eb" size={14} />
                                  <Text className="text-blue-700 dark:text-blue-300 text-xs font-semibold">
                                    {isImage ? "View Image" : "Open Document"}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <View className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3">
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                      No evidence documents uploaded
                    </Text>
                  </View>
                )}

                {subsidy.rejectionReason && (
                  <View className="flex-row items-start gap-2 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg px-4 py-3">
                    <AlertTriangle color="#ea580c" size={16} />
                    <View className="flex-1">
                      <Text className="text-orange-800 dark:text-orange-300 text-xs font-semibold mb-1">
                        Rejection Reason
                      </Text>
                      <Text className="text-orange-700 dark:text-orange-400 text-xs">
                        {subsidy.rejectionReason}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              <View className="border-b border-gray-200 dark:border-gray-700 mb-4" />

              <View className="border-b border-gray-200 dark:border-gray-700 mb-4" />

              {/* Payout Amount Adjustment - Only show for pending claims */}
              {subsidy.status === "PENDING" && (
                <View className="mb-4">
                  <Text className="text-gray-900 dark:text-gray-100 text-base font-bold mb-3">
                    Adjust Payout Amount
                  </Text>
                  <View className="gap-2">
                    <Text className="text-gray-600 dark:text-gray-400 text-xs mb-1">
                      Payout Amount (ETH)
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <View className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg flex-row items-center">
                        <TextInput
                          value={payoutAmount}
                          onChangeText={(text) => {
                            // Only allow numbers and a single decimal point
                            let sanitized = text
                              .replace(/[^0-9.]/g, "")
                              .replace(/\./g, (match, offset) => {
                                // Only allow first decimal point
                                return text.indexOf(".") === offset
                                  ? match
                                  : "";
                              });
                            const numValue = parseFloat(sanitized);
                            // Ensure minimum value
                            if (!isNaN(numValue) && numValue < minPayout) {
                              sanitized = minPayout.toFixed(5);
                            }
                            setPayoutAmount(sanitized);
                          }}
                          placeholder="0.00001"
                          keyboardType="decimal-pad"
                          className="flex-1 px-4 py-3 text-gray-900 dark:text-gray-100 text-base"
                          placeholderTextColor="#9ca3af"
                        />
                        <View className="flex-col pr-2">
                          <TouchableOpacity
                            onPress={incrementPayout}
                            className="p-1"
                          >
                            <ChevronUp color="#6b7280" size={18} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={decrementPayout}
                            disabled={parseFloat(payoutAmount) <= minPayout}
                            className="p-1"
                            style={{
                              opacity:
                                parseFloat(payoutAmount) <= minPayout ? 0.4 : 1,
                            }}
                          >
                            <ChevronDown color="#6b7280" size={18} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                    {payoutAmount &&
                      !isNaN(parseFloat(payoutAmount)) &&
                      ethToMyrRate && (
                        <Text className="text-gray-500 dark:text-gray-400 text-xs">
                          ≈{" "}
                          {formatCurrency(
                            ethToMyr(parseFloat(payoutAmount), ethToMyrRate) ??
                              0
                          )}
                        </Text>
                      )}
                    <Text className="text-gray-500 dark:text-gray-400 text-xs">
                      Minimum payout: {minPayout} ETH
                    </Text>
                  </View>
                </View>
              )}

              <View className="border-b border-gray-200 dark:border-gray-700 mb-4" />

              {/* Rejection Reason */}
              <Text className="text-gray-900 dark:text-gray-100 text-base font-bold mb-3">
                Rejection Reason
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-xs mb-2">
                Required if rejecting this claim
              </Text>
              <TextInput
                value={rejectReason}
                onChangeText={setRejectReason}
                placeholder="Provide a reason if rejecting this claim"
                multiline
                numberOfLines={3}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100 text-sm"
                placeholderTextColor="#9ca3af"
                style={{ textAlignVertical: "top" }}
              />
            </View>

            {/* Action Buttons - Show different buttons based on status */}
            {subsidy.status === "PENDING" && (
              <View className="gap-3">
                <TouchableOpacity
                  onPress={handleApprove}
                  disabled={isApproving}
                  className="rounded-lg overflow-hidden"
                >
                  <LinearGradient
                    colors={["#22c55e", "#15803d"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className={`flex-row items-center justify-center gap-2 py-3 ${
                      isApproving ? "opacity-50" : ""
                    }`}
                  >
                    <CheckCircle color="#fff" size={20} />
                    <Text className="text-white text-[15px] font-bold">
                      {isApproving ? "Approving..." : "Approve Claim"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleReject}
                  className="flex-row items-center justify-center gap-2 bg-white dark:bg-gray-700 border-2 border-red-500 dark:border-red-600 rounded-lg py-3"
                >
                  <XCircle color="#dc2626" size={20} />
                  <Text className="text-red-600 dark:text-red-400 text-[15px] font-bold">
                    Reject Claim
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleRequestDocs}
                  className="flex-row items-center justify-center gap-2 bg-white dark:bg-gray-700 border-2 border-blue-500 dark:border-blue-600 rounded-lg py-3"
                >
                  <FileText color="#2563eb" size={20} />
                  <Text className="text-blue-600 dark:text-blue-400 text-[15px] font-bold">
                    Request More Documents
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSaveDraft}
                  className="flex-row items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-3"
                >
                  <Save color="#6b7280" size={20} />
                  <Text className="text-gray-700 dark:text-gray-300 text-[15px] font-bold">
                    Save Draft Review
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Disburse Button - Show for approved claims */}
            {subsidy.status === "APPROVED" && (
              <View className="gap-3">
                <TouchableOpacity
                  onPress={handleDisburse}
                  disabled={isDisbursing}
                  className="rounded-lg overflow-hidden"
                >
                  <LinearGradient
                    colors={["#2563eb", "#1d4ed8"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className={`flex-row items-center justify-center gap-2 py-3 ${
                      isDisbursing ? "opacity-50" : ""
                    }`}
                  >
                    <DollarSign color="#fff" size={20} />
                    <Text className="text-white text-[15px] font-bold">
                      {isDisbursing ? "Disbursing..." : "Disburse Claim"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Sidebar - Status Summary */}
          <View className="w-[360px]">
            <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 sticky top-4">
              <Text className="text-gray-900 dark:text-gray-100 text-base font-bold mb-4">
                Claim Summary
              </Text>
              <View className="gap-4">
                <View>
                  <Text className="text-gray-500 dark:text-gray-400 text-xs mb-1">Status</Text>
                  <StatusBadge status={subsidy.status} />
                </View>
                <View>
                  <Text className="text-gray-500 dark:text-gray-400 text-xs mb-1">Claim ID</Text>
                  <Text className="text-gray-900 dark:text-gray-100 text-sm font-semibold">
                    {claimId}
                  </Text>
                </View>
                <View>
                  <Text className="text-gray-500 dark:text-gray-400 text-xs mb-1">Farmer</Text>
                  <Text className="text-gray-900 dark:text-gray-100 text-sm">
                    {subsidy.farmer?.username || "Unknown"}
                  </Text>
                </View>
                <View>
                  <Text className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                    Claim Amount
                  </Text>
                  <EthAmountDisplay
                    ethAmount={subsidy.amount}
                    textClassName="text-gray-900 dark:text-gray-100 text-sm font-semibold"
                    myrClassName="text-gray-500 dark:text-gray-400 text-xs"
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      ) : (
        <View className="px-6 pb-6 pt-4">
          <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            {/* A. Claim Information */}
            <Text className="text-gray-900 dark:text-gray-100 text-base font-bold mb-4">
              A. Claim Information
            </Text>

            {/* Farmer Identity */}
            <View className="mb-4">
              <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
                Farmer Identity
              </Text>
              <View className="gap-3">
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <FormField
                      label="Farmer Name"
                      value={subsidy.farmer?.username || undefined}
                      icon={User}
                    />
                  </View>
                  <View className="flex-1">
                    <FormField
                      label="NRIC"
                      value={subsidy.farmer?.nric || undefined}
                    />
                  </View>
                </View>
                <FormField
                  label="Email Address"
                  value={subsidy.farmer?.email || undefined}
                />
              </View>
            </View>

            <View className="border-b border-gray-200 dark:border-gray-700 mb-4" />

            {/* Program Details */}
            <View className="mb-4">
              <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
                Program Details
              </Text>
              <View className="gap-3">
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <FormField
                      label="Program"
                      value={program?.name || undefined}
                    />
                  </View>
                  <View className="flex-1">
                    <FormField label="Claim ID" value={claimId} icon={Hash} />
                  </View>
                </View>
              </View>
            </View>

            <View className="border-b border-gray-200 dark:border-gray-700 mb-4" />

            {/* Claim Details */}
            <View className="mb-4">
              <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
                Claim Details
              </Text>
              <View className="gap-3">
                <FormField
                  label="Claim Amount"
                  valueComponent={
                    <EthAmountDisplay
                      ethAmount={subsidy.amount}
                      textClassName="text-gray-900 dark:text-gray-100 text-sm"
                      myrClassName="text-gray-500 dark:text-gray-400 text-xs"
                    />
                  }
                  icon={DollarSign}
                />
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <FormField
                      label="Submission Date"
                      value={formatDate(subsidy.createdAt)}
                      icon={Calendar}
                    />
                  </View>
                  {subsidy.approvedAt && (
                    <View className="flex-1">
                      <FormField
                        label="Approved Date"
                        value={formatDate(subsidy.approvedAt)}
                        icon={Calendar}
                      />
                    </View>
                  )}
                </View>
                {subsidy.paidAt && (
                  <FormField
                    label="Paid Date"
                    value={formatDate(subsidy.paidAt)}
                    icon={Calendar}
                  />
                )}
              </View>
            </View>

            <View className="border-b border-gray-200 dark:border-gray-700 mb-4" />

            {/* B. Blockchain Information */}
            <Text className="text-gray-900 dark:text-gray-100 text-base font-bold mb-3">
              B. Blockchain Information
            </Text>
            <View className="gap-3 mb-4">
              <FormField
                label="Transaction Hash"
                value={subsidy.onChainTxHash || undefined}
                icon={LinkIcon}
              />
              {subsidy.onChainClaimId && (
                <FormField
                  label="On-chain Claim ID"
                  value={String(subsidy.onChainClaimId)}
                  icon={Hash}
                />
              )}
              <FormField
                label="Metadata Hash"
                value={subsidy.metadataHash || undefined}
                icon={Hash}
              />
            </View>

            <View className="border-b border-gray-200 dark:border-gray-700 mb-4" />

            {/* C. Evidence & Documentation */}
            <Text className="text-gray-900 dark:text-gray-100 text-base font-bold mb-3">
              C. Evidence & Documentation
            </Text>
            <View className="gap-3 mb-4">
              {subsidy.metadataHash && (
                <View className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3">
                  <View className="flex-row items-center gap-2 mb-1">
                    <CheckCircle color="#15803d" size={16} />
                    <Text className="text-green-800 dark:text-green-300 text-sm font-semibold">
                      Metadata Available
                    </Text>
                  </View>
                  <Text className="text-green-700 dark:text-green-400 text-xs font-mono mt-1">
                    {subsidy.metadataHash}
                  </Text>
                </View>
              )}

              {/* Evidence Documents */}
              {subsidy.evidences && subsidy.evidences.length > 0 ? (
                <View className="gap-3">
                  <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold">
                    Uploaded Evidence ({subsidy.evidences.length})
                  </Text>
                  {subsidy.evidences.map((evidence) => {
                    const isPhoto = evidence.type === "PHOTO";
                    const isPdf = evidence.type === "PDF";
                    const isImage =
                      isPhoto ||
                      (evidence.mimeType?.startsWith("image/") ?? false);

                    return (
                      <View
                        key={evidence.id}
                        className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                      >
                        <View className="flex-row gap-4">
                          {/* Preview/Icon */}
                          <View className="w-32">
                            {isImage && evidence.storageUrl ? (
                              <View className="h-40 w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-600">
                                <Image
                                  source={{ uri: evidence.storageUrl }}
                                  style={{ width: "100%", height: "100%" }}
                                  contentFit="cover"
                                />
                              </View>
                            ) : (
                              <View className="h-40 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 items-center justify-center">
                                <FileText color="#6b7280" size={32} />
                                <Text className="text-gray-600 dark:text-gray-400 text-xs mt-2 font-semibold">
                                  {isPdf ? "PDF" : "DOCUMENT"}
                                </Text>
                              </View>
                            )}
                          </View>

                          {/* Details */}
                          <View className="flex-1 gap-2">
                            <View>
                              <Text className="text-gray-900 dark:text-gray-100 text-sm font-semibold">
                                {evidence.fileName ||
                                  `Evidence ${evidence.type}`}
                              </Text>
                              <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                                {evidence.type === "PHOTO"
                                  ? "Photo"
                                  : "PDF Document"}
                              </Text>
                              {evidence.fileSize && (
                                <Text className="text-gray-500 dark:text-gray-400 text-xs">
                                  {(evidence.fileSize / 1024).toFixed(2)} KB
                                </Text>
                              )}
                            </View>

                            {/* View Button */}
                            <TouchableOpacity
                              onPress={() => {
                                if (evidence.storageUrl) {
                                  Linking.openURL(evidence.storageUrl);
                                }
                              }}
                              className="self-start mt-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg"
                              disabled={!evidence.storageUrl}
                            >
                              <View className="flex-row items-center gap-2">
                                <LinkIcon color="#2563eb" size={14} />
                                <Text className="text-blue-700 dark:text-blue-300 text-xs font-semibold">
                                  {isImage ? "View Image" : "Open Document"}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3">
                  <Text className="text-gray-500 dark:text-gray-400 text-sm">
                    No evidence documents uploaded
                  </Text>
                </View>
              )}

              {subsidy.rejectionReason && (
                <View className="flex-row items-start gap-2 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg px-4 py-3">
                  <AlertTriangle color="#ea580c" size={16} />
                  <View className="flex-1">
                    <Text className="text-orange-800 dark:text-orange-300 text-xs font-semibold mb-1">
                      Rejection Reason
                    </Text>
                    <Text className="text-orange-700 dark:text-orange-400 text-xs">
                      {subsidy.rejectionReason}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View className="border-b border-gray-200 dark:border-gray-700 mb-4" />

            {/* Payout Amount Adjustment - Only show for pending claims */}
            {subsidy.status === "PENDING" && (
              <View className="mb-4">
                <Text className="text-gray-900 dark:text-gray-100 text-base font-bold mb-3">
                  Adjust Payout Amount
                </Text>
                <View className="gap-2">
                  <Text className="text-gray-600 dark:text-gray-400 text-xs mb-1">
                    Payout Amount (ETH)
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <View className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg flex-row items-center">
                      <TextInput
                        value={payoutAmount}
                        onChangeText={(text) => {
                          // Only allow numbers and a single decimal point
                          let sanitized = text
                            .replace(/[^0-9.]/g, "")
                            .replace(/\./g, (match, offset) => {
                              // Only allow first decimal point
                              return text.indexOf(".") === offset ? match : "";
                            });
                          const numValue = parseFloat(sanitized);
                          // Ensure minimum value
                          if (!isNaN(numValue) && numValue < minPayout) {
                            sanitized = minPayout.toFixed(5);
                          }
                          setPayoutAmount(sanitized);
                        }}
                        placeholder="0.00001"
                        keyboardType="decimal-pad"
                        className="flex-1 px-4 py-3 text-gray-900 dark:text-gray-100 text-base"
                        placeholderTextColor="#9ca3af"
                      />
                      <View className="flex-col pr-2">
                        <TouchableOpacity
                          onPress={incrementPayout}
                          className="p-1"
                        >
                          <ChevronUp color="#6b7280" size={18} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={decrementPayout}
                          disabled={parseFloat(payoutAmount) <= minPayout}
                          className="p-1"
                          style={{
                            opacity:
                              parseFloat(payoutAmount) <= minPayout ? 0.4 : 1,
                          }}
                        >
                          <ChevronDown color="#6b7280" size={18} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                  {payoutAmount &&
                    !isNaN(parseFloat(payoutAmount)) &&
                    ethToMyrRate && (
                      <Text className="text-gray-500 dark:text-gray-400 text-xs">
                        ≈{" "}
                        {formatCurrency(
                          ethToMyr(parseFloat(payoutAmount), ethToMyrRate) ?? 0
                        )}
                      </Text>
                    )}
                  <Text className="text-gray-500 dark:text-gray-400 text-xs">
                    Minimum payout: {minPayout} ETH
                  </Text>
                </View>
              </View>
            )}

            <View className="border-b border-gray-200 dark:border-gray-700 mb-4" />

            {/* D. Review Notes */}
            <Text className="text-gray-900 dark:text-gray-100 text-base font-bold mb-3">
              D. Review Notes (Optional)
            </Text>
            <View className="mb-4">
              <TextInput
                value={reviewNotes}
                onChangeText={setReviewNotes}
                placeholder="Add internal notes about this claim..."
                multiline
                numberOfLines={4}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100 text-sm"
                placeholderTextColor="#9ca3af"
                style={{ textAlignVertical: "top" }}
              />
            </View>

            <View className="border-b border-gray-200 dark:border-gray-700 mb-4" />

            {/* E. Rejection Reason */}
            <Text className="text-gray-900 dark:text-gray-100 text-base font-bold mb-3">
              E. Rejection Reason
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-xs mb-2">
              Required if rejecting this claim
            </Text>
            <TextInput
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="Provide a reason if rejecting this claim"
              multiline
              numberOfLines={3}
              className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100 text-sm"
              placeholderTextColor="#9ca3af"
              style={{ textAlignVertical: "top" }}
            />
          </View>

          {/* Action Buttons - Show different buttons based on status */}
          {subsidy.status === "PENDING" && (
            <View className="gap-3">
              <TouchableOpacity
                onPress={handleApprove}
                disabled={isApproving}
                className="rounded-lg overflow-hidden"
              >
                <LinearGradient
                  colors={["#22c55e", "#15803d"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className={`flex-row items-center justify-center gap-2 py-3 ${
                    isApproving ? "opacity-50" : ""
                  }`}
                >
                  <CheckCircle color="#fff" size={20} />
                  <Text className="text-white text-[15px] font-bold">
                    {isApproving ? "Approving..." : "Approve Claim"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleReject}
                className="flex-row items-center justify-center gap-2 bg-white dark:bg-gray-700 border-2 border-red-500 dark:border-red-600 rounded-lg py-3"
              >
                <XCircle color="#dc2626" size={20} />
                <Text className="text-red-600 dark:text-red-400 text-[15px] font-bold">
                  Reject Claim
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleRequestDocs}
                className="flex-row items-center justify-center gap-2 bg-white dark:bg-gray-700 border-2 border-blue-500 dark:border-blue-600 rounded-lg py-3"
              >
                <FileText color="#2563eb" size={20} />
                <Text className="text-blue-600 dark:text-blue-400 text-[15px] font-bold">
                  Request More Documents
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveDraft}
                className="flex-row items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-3"
              >
                <Save color="#6b7280" size={20} />
                <Text className="text-gray-700 dark:text-gray-300 text-[15px] font-bold">
                  Save Draft Review
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Disburse Button - Show for approved claims */}
          {subsidy.status === "APPROVED" && (
            <View className="gap-3">
              <TouchableOpacity
                onPress={handleDisburse}
                disabled={isDisbursing}
                className="rounded-lg overflow-hidden"
              >
                <LinearGradient
                  colors={["#2563eb", "#1d4ed8"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className={`flex-row items-center justify-center gap-2 py-3 ${
                    isDisbursing ? "opacity-50" : ""
                  }`}
                >
                  <DollarSign color="#fff" size={20} />
                  <Text className="text-white text-[15px] font-bold">
                    {isDisbursing ? "Disbursing..." : "Disburse Claim"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
