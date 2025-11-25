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
  MapPin,
  AlertTriangle,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { mockClaims, type SubsidyClaim } from "../approvals-data";
import { useAgencyLayout } from "@/components/agency/layout/AgencyLayoutContext";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: SubsidyClaim["status"] }) {
  const map: Record<SubsidyClaim["status"], string> = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    docs_required: "bg-blue-100 text-blue-700",
    flagged: "bg-orange-100 text-orange-700",
  };
  return (
    <View className={`px-2 py-0.5 rounded-full ${map[status]}`}>
      <Text className="text-xs font-semibold capitalize">
        {status.replace("_", " ")}
      </Text>
    </View>
  );
}

export default function ClaimReviewPage() {
  const params = useLocalSearchParams<{ claimId?: string }>();
  const claim = useMemo<SubsidyClaim | undefined>(
    () => mockClaims.find((c) => c.id === params.claimId),
    [params.claimId]
  );

  useAgencyLayout({
    title: claim ? `Review ${claim.claimId}` : "Claim not found",
    subtitle: "Verify evidence and approve or reject subsidy claims",
  });

  const [rejectReason, setRejectReason] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");

  if (!claim) {
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
    console.log("Approving claim:", claim.claimId);
    router.push("/dashboard/agency/approvals" as never);
  };

  const handleReject = () => {
    console.log("Rejecting claim:", claim.claimId, rejectReason);
    router.push("/dashboard/agency/approvals" as never);
  };

  const handleRequestDocs = () => {
    console.log("Requesting docs for claim:", claim.claimId);
    router.push("/dashboard/agency/approvals" as never);
  };

  const handleSaveDraft = () => {
    console.log("Saving draft for claim:", claim.claimId, reviewNotes);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="px-6 py-6">
        <View className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-1">
              <Text className="text-gray-900 text-xl font-bold">
                {claim.claimId}
              </Text>
              <Text className="text-gray-600 text-sm">
                {claim.farmerName} • {claim.farmName}
              </Text>
              <View className="flex-row items-center gap-2 mt-2">
                <StatusBadge status={claim.status} />
                <View className="px-2 py-0.5 rounded-full bg-indigo-50">
                  <Text className="text-indigo-700 text-xs font-semibold">
                    {claim.triggerType === "oracle" ? "Oracle Triggered" : "Manual"}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/dashboard/agency/approvals" as never)}
              className="px-3 py-2 rounded-lg bg-white border border-gray-200"
            >
              <Text className="text-gray-700 text-xs font-semibold">
                Back to queue
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center gap-3 mt-2">
            <MapPin color="#6b7280" size={16} />
            <Text className="text-gray-700 text-sm flex-1">{claim.location}</Text>
          </View>

          <View className="flex-row flex-wrap gap-4 mt-4">
            <View className="flex-row items-center gap-2">
              <Text className="text-gray-500 text-xs">Policy</Text>
              <Text className="text-gray-900 text-sm font-semibold">
                {claim.policy}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-gray-500 text-xs">Claim Value</Text>
              <Text className="text-emerald-700 text-sm font-semibold">
                RM {claim.claimValue.toLocaleString()}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-gray-500 text-xs">Submitted</Text>
              <Text className="text-gray-900 text-sm font-semibold">
                {formatDate(claim.submittedDate)}
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <Text className="text-gray-900 text-base font-bold mb-3">
            A. Claim Evidence
          </Text>
          <View className="gap-3">
            {claim.documents.map((doc, idx) => (
              <View
                key={`${doc.name}-${idx}`}
                className="flex-row items-center justify-between border border-gray-200 rounded-lg px-4 py-3"
              >
                <View className="flex-1">
                  <Text className="text-gray-900 text-sm font-semibold">
                    {doc.name}
                  </Text>
                  <Text className="text-gray-500 text-xs capitalize">
                    Status: {doc.status}
                  </Text>
                </View>
                <View
                  className={`px-2 py-0.5 rounded-full ${
                    doc.status === "verified"
                      ? "bg-green-100 text-green-700"
                      : doc.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <Text className="text-xs font-semibold capitalize">
                    {doc.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {claim.flagReason && (
            <View className="flex-row items-start gap-2 mt-3 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
              <AlertTriangle color="#ea580c" size={16} />
              <Text className="text-orange-800 text-xs flex-1">
                Flagged: {claim.flagReason}
              </Text>
            </View>
          )}
        </View>

        <View className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <Text className="text-gray-900 text-base font-bold mb-3">
            B. On-chain Reference
          </Text>
          <View className="gap-2">
            <Text className="text-gray-700 text-sm font-semibold">
              {claim.onChainRef}
            </Text>
            <Text className="text-gray-500 text-xs">
              Blockchain TX: {claim.blockchainHash}
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <Text className="text-gray-900 text-base font-bold mb-3">
            C. Review Notes (Optional)
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

        <View className="bg-white rounded-xl border border-gray-200 p-5">
          <Text className="text-gray-900 text-base font-bold mb-3">
            D. Officer Decision
          </Text>
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

          <View className="mt-4">
            <Text className="text-gray-600 text-xs mb-1">Rejection Reason</Text>
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
        </View>
      </View>
    </ScrollView>
  );
}
