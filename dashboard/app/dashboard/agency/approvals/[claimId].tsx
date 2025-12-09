import { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
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
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useSubsidyQuery } from "@/hooks/useSubsidy";
import { useProgramsQuery } from "@/hooks/useProgram";
import type { SubsidyResponseDto } from "@/api";
import { formatDate } from "@/components/farmer/farm-produce/utils";
import EthAmountDisplay from "@/components/common/EthAmountDisplay";
import { useAgencyLayout } from "@/components/agency/layout/AgencyLayoutContext";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

function StatusBadge({ status }: { status: SubsidyResponseDto["status"] }) {
  const getStatusColor = (status: SubsidyResponseDto["status"]) => {
    switch (status) {
      case "APPROVED":
      case "DISBURSED":
        return "bg-green-100 text-green-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
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
  const { data: subsidyData, isLoading } = useSubsidyQuery(params.claimId);
  const { programs } = useProgramsQuery();
  const { isDesktop } = useResponsiveLayout();

  const subsidy = useMemo(() => subsidyData?.data, [subsidyData]);
  const claimId = useMemo(
    () => (subsidy ? `SUB-${subsidy.id.slice(0, 8).toUpperCase()}` : ""),
    [subsidy]
  );
  const program = useMemo(
    () =>
      subsidy?.programsId
        ? programs.find((p) => p.id === subsidy.programsId)
        : null,
    [subsidy, programs]
  );

  const [rejectReason, setRejectReason] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");

  useAgencyLayout({
    title: subsidy ? `Review ${claimId}` : "Review Claim",
    subtitle: "Verify evidence and approve or reject subsidy claims",
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-gray-600 text-sm">Loading claim details...</Text>
      </View>
    );
  }

  if (!subsidy) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-gray-900 text-xl font-bold mb-2">
          Claim not found
        </Text>
        <Text className="text-gray-600 text-sm mb-4">
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

  const handleApprove = () => {
    console.log("Approving claim:", subsidy?.id);
    router.push("/dashboard/agency/approvals");
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
      <Text className="text-gray-600 text-xs mb-1">{label}</Text>
      <View className="flex-row items-center bg-gray-50 border border-gray-300 rounded-lg px-4 py-3">
        {Icon && (
          <View className="mr-3">
            <Icon color="#6b7280" size={18} />
          </View>
        )}
        <View className="flex-1">
          {valueComponent || (
            <Text className="text-gray-900 text-sm">{value || "—"}</Text>
          )}
        </View>
      </View>
    </View>
  );

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
                Review Claim
              </Text>
              <Text className="text-gray-600 text-sm">{claimId}</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            <StatusBadge status={subsidy.status} />
            <View className="px-2 py-1 rounded-full bg-indigo-50">
              <Text className="text-indigo-700 text-xs font-semibold">
                {subsidy?.weatherEventId ? "Oracle" : "Manual"}
              </Text>
            </View>
          </View>
        </View>
      )}

      {isDesktop ? (
        <View className="px-6 pb-6 pt-4 flex-row gap-6">
          <View className="flex-1">
            {/* A. Claim Information */}
            <View className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
              <Text className="text-gray-900 text-base font-bold mb-4">
                A. Claim Information
              </Text>

              {/* Farmer Identity */}
              <View className="mb-6">
                <Text className="text-gray-700 text-sm font-semibold mb-3">
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

              {/* Program Details */}
              <View className="mb-6 pb-6 border-b border-gray-200">
                <Text className="text-gray-700 text-sm font-semibold mb-3">
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

              {/* Claim Details */}
              <View>
                <Text className="text-gray-700 text-sm font-semibold mb-3">
                  Claim Details
                </Text>
                <View className="gap-3">
                  <FormField
                    label="Claim Amount"
                    valueComponent={
                      <EthAmountDisplay
                        ethAmount={subsidy.amount}
                        textClassName="text-gray-900 text-sm"
                        myrClassName="text-gray-500 text-xs"
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
            </View>

            {/* B. Blockchain Information */}
            <View className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
              <Text className="text-gray-900 text-base font-bold mb-3">
                B. Blockchain Information
              </Text>
              <View className="gap-3">
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
            </View>

            {/* C. Evidence & Documentation */}
            <View className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
              <Text className="text-gray-900 text-base font-bold mb-3">
                C. Evidence & Documentation
              </Text>
              <View className="gap-3">
                {subsidy.metadataHash ? (
                  <View className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                    <View className="flex-row items-center gap-2 mb-1">
                      <CheckCircle color="#15803d" size={16} />
                      <Text className="text-green-800 text-sm font-semibold">
                        Metadata Available
                      </Text>
                    </View>
                    <Text className="text-green-700 text-xs font-mono mt-1">
                      {subsidy.metadataHash}
                    </Text>
                  </View>
                ) : (
                  <View className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                    <Text className="text-gray-500 text-sm">
                      No evidence available
                    </Text>
                  </View>
                )}
                {subsidy.rejectionReason && (
                  <View className="flex-row items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
                    <AlertTriangle color="#ea580c" size={16} />
                    <View className="flex-1">
                      <Text className="text-orange-800 text-xs font-semibold mb-1">
                        Rejection Reason
                      </Text>
                      <Text className="text-orange-700 text-xs">
                        {subsidy.rejectionReason}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* D. Review Notes */}
            <View className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
              <Text className="text-gray-900 text-base font-bold mb-3">
                D. Review Notes (Optional)
              </Text>
              <TextInput
                value={reviewNotes}
                onChangeText={setReviewNotes}
                placeholder="Add internal notes about this claim..."
                multiline
                numberOfLines={4}
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                placeholderTextColor="#9ca3af"
                style={{ textAlignVertical: "top" }}
              />
            </View>

            {/* E. Rejection Reason */}
            <View className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
              <Text className="text-gray-900 text-base font-bold mb-3">
                E. Rejection Reason
              </Text>
              <Text className="text-gray-500 text-xs mb-2">
                Required if rejecting this claim
              </Text>
              <TextInput
                value={rejectReason}
                onChangeText={setRejectReason}
                placeholder="Provide a reason if rejecting this claim"
                multiline
                numberOfLines={3}
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                placeholderTextColor="#9ca3af"
                style={{ textAlignVertical: "top" }}
              />
            </View>

            {/* Action Buttons */}
            <View className="gap-3">
              <TouchableOpacity
                onPress={handleApprove}
                className="rounded-lg overflow-hidden"
              >
                <LinearGradient
                  colors={["#22c55e", "#15803d"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="flex-row items-center justify-center gap-2 py-3"
                >
                  <CheckCircle color="#fff" size={20} />
                  <Text className="text-white text-[15px] font-bold">
                    Approve Claim
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleReject}
                className="flex-row items-center justify-center gap-2 bg-white border-2 border-red-500 rounded-lg py-3"
              >
                <XCircle color="#dc2626" size={20} />
                <Text className="text-red-600 text-[15px] font-bold">
                  Reject Claim
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleRequestDocs}
                className="flex-row items-center justify-center gap-2 bg-white border-2 border-blue-500 rounded-lg py-3"
              >
                <FileText color="#2563eb" size={20} />
                <Text className="text-blue-600 text-[15px] font-bold">
                  Request More Documents
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveDraft}
                className="flex-row items-center justify-center gap-2 bg-gray-100 border border-gray-300 rounded-lg py-3"
              >
                <Save color="#6b7280" size={20} />
                <Text className="text-gray-700 text-[15px] font-bold">
                  Save Draft Review
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sidebar - Status Summary */}
          <View className="w-[360px]">
            <View className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4">
              <Text className="text-gray-900 text-base font-bold mb-4">
                Claim Summary
              </Text>
              <View className="gap-4">
                <View>
                  <Text className="text-gray-500 text-xs mb-1">Status</Text>
                  <StatusBadge status={subsidy.status} />
                </View>
                <View>
                  <Text className="text-gray-500 text-xs mb-1">
                    Trigger Type
                  </Text>
                  <View className="px-2 py-1 rounded-full bg-indigo-50 self-start">
                    <Text className="text-indigo-700 text-xs font-semibold">
                      {subsidy?.weatherEventId ? "Oracle Triggered" : "Manual"}
                    </Text>
                  </View>
                </View>
                <View>
                  <Text className="text-gray-500 text-xs mb-1">Claim ID</Text>
                  <Text className="text-gray-900 text-sm font-semibold">
                    {claimId}
                  </Text>
                </View>
                <View>
                  <Text className="text-gray-500 text-xs mb-1">Farmer</Text>
                  <Text className="text-gray-900 text-sm">
                    {subsidy.farmer?.username || "Unknown"}
                  </Text>
                </View>
                <View>
                  <Text className="text-gray-500 text-xs mb-1">
                    Claim Amount
                  </Text>
                  <EthAmountDisplay
                    ethAmount={subsidy.amount}
                    textClassName="text-gray-900 text-sm font-semibold"
                    myrClassName="text-gray-500 text-xs"
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      ) : (
        <View className="px-6 pb-6 pt-4 gap-6">
          {/* A. Claim Information */}
          <View className="bg-white rounded-xl border border-gray-200 p-5">
            <Text className="text-gray-900 text-base font-bold mb-4">
              A. Claim Information
            </Text>

            {/* Farmer Identity */}
            <View className="mb-6">
              <Text className="text-gray-700 text-sm font-semibold mb-3">
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

            {/* Program Details */}
            <View className="mb-6 pb-6 border-b border-gray-200">
              <Text className="text-gray-700 text-sm font-semibold mb-3">
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

            {/* Claim Details */}
            <View>
              <Text className="text-gray-700 text-sm font-semibold mb-3">
                Claim Details
              </Text>
              <View className="gap-3">
                <FormField
                  label="Claim Amount"
                  valueComponent={
                    <EthAmountDisplay
                      ethAmount={subsidy.amount}
                      textClassName="text-gray-900 text-sm"
                      myrClassName="text-gray-500 text-xs"
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
          </View>

          {/* B. Blockchain Information */}
          <View className="bg-white rounded-xl border border-gray-200 p-5">
            <Text className="text-gray-900 text-base font-bold mb-3">
              B. Blockchain Information
            </Text>
            <View className="gap-3">
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
          </View>

          {/* C. Evidence & Documentation */}
          <View className="bg-white rounded-xl border border-gray-200 p-5">
            <Text className="text-gray-900 text-base font-bold mb-3">
              C. Evidence & Documentation
            </Text>
            <View className="gap-3">
              {subsidy.metadataHash ? (
                <View className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <View className="flex-row items-center gap-2 mb-1">
                    <CheckCircle color="#15803d" size={16} />
                    <Text className="text-green-800 text-sm font-semibold">
                      Metadata Available
                    </Text>
                  </View>
                  <Text className="text-green-700 text-xs font-mono mt-1">
                    {subsidy.metadataHash}
                  </Text>
                </View>
              ) : (
                <View className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                  <Text className="text-gray-500 text-sm">
                    No evidence available
                  </Text>
                </View>
              )}
              {subsidy.rejectionReason && (
                <View className="flex-row items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
                  <AlertTriangle color="#ea580c" size={16} />
                  <View className="flex-1">
                    <Text className="text-orange-800 text-xs font-semibold mb-1">
                      Rejection Reason
                    </Text>
                    <Text className="text-orange-700 text-xs">
                      {subsidy.rejectionReason}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* D. Review Notes */}
          <View className="bg-white rounded-xl border border-gray-200 p-5">
            <Text className="text-gray-900 text-base font-bold mb-3">
              D. Review Notes (Optional)
            </Text>
            <TextInput
              value={reviewNotes}
              onChangeText={setReviewNotes}
              placeholder="Add internal notes about this claim..."
              multiline
              numberOfLines={4}
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
              placeholderTextColor="#9ca3af"
              style={{ textAlignVertical: "top" }}
            />
          </View>

          {/* E. Rejection Reason */}
          <View className="bg-white rounded-xl border border-gray-200 p-5">
            <Text className="text-gray-900 text-base font-bold mb-3">
              E. Rejection Reason
            </Text>
            <Text className="text-gray-500 text-xs mb-2">
              Required if rejecting this claim
            </Text>
            <TextInput
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="Provide a reason if rejecting this claim"
              multiline
              numberOfLines={3}
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
              placeholderTextColor="#9ca3af"
              style={{ textAlignVertical: "top" }}
            />
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={handleApprove}
              className="rounded-lg overflow-hidden"
            >
              <LinearGradient
                colors={["#22c55e", "#15803d"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="flex-row items-center justify-center gap-2 py-3"
              >
                <CheckCircle color="#fff" size={20} />
                <Text className="text-white text-[15px] font-bold">
                  Approve Claim
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleReject}
              className="flex-row items-center justify-center gap-2 bg-white border-2 border-red-500 rounded-lg py-3"
            >
              <XCircle color="#dc2626" size={20} />
              <Text className="text-red-600 text-[15px] font-bold">
                Reject Claim
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleRequestDocs}
              className="flex-row items-center justify-center gap-2 bg-white border-2 border-blue-500 rounded-lg py-3"
            >
              <FileText color="#2563eb" size={20} />
              <Text className="text-blue-600 text-[15px] font-bold">
                Request More Documents
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSaveDraft}
              className="flex-row items-center justify-center gap-2 bg-gray-100 border border-gray-300 rounded-lg py-3"
            >
              <Save color="#6b7280" size={20} />
              <Text className="text-gray-700 text-[15px] font-bold">
                Save Draft Review
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
