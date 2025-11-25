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
  Shield,
  MapPin,
  ExternalLink,
  AlertTriangle,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
  mockRegistrations,
  type FarmRegistration,
} from "../registrations-data";
import { useAgencyLayout } from "@/components/agency/layout/AgencyLayoutContext";

function getStatusColor(status: string) {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-700";
    case "pending_review":
      return "bg-yellow-100 text-yellow-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    case "docs_required":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getDocStatusColor(status: string) {
  switch (status) {
    case "verified":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    case "missing":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getBlockchainStatusColor(status: string) {
  switch (status) {
    case "on-chain":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "failed":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function RegistrationReviewPage() {
  const params = useLocalSearchParams<{ registrationId?: string }>();
  const registration = useMemo<FarmRegistration | undefined>(
    () => mockRegistrations.find((r) => r.id === params.registrationId),
    [params.registrationId]
  );

  useAgencyLayout({
    title: registration
      ? `Review ${registration.farmId}`
      : "Registration not found",
    subtitle: "Deep dive into the farm submission and approve or reject",
  });

  const [reviewNotes, setReviewNotes] = useState("");
  const [documentVerifications, setDocumentVerifications] = useState<
    Record<string, boolean>
  >({});
  const [rejectReason, setRejectReason] = useState("");

  if (!registration) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-gray-900 text-xl font-bold mb-2">
          Registration not found
        </Text>
        <Text className="text-gray-600 text-sm mb-4">
          The requested farm registration could not be located.
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/dashboard/agency/registrations" as never)}
          className="px-4 py-2 bg-blue-600 rounded-lg"
        >
          <Text className="text-white font-semibold">Back to list</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const verifiedDocs = registration.documents.filter(
    (d) => d.status === "verified" || documentVerifications[d.id]
  ).length;
  const totalDocs = registration.documents.length;

  const handleToggleDoc = (docId: string) => {
    setDocumentVerifications((prev) => ({ ...prev, [docId]: !prev[docId] }));
  };

  const handleApprove = () => {
    console.log("Approving registration:", registration.farmId);
    router.push("/dashboard/agency/registrations" as never);
  };

  const handleReject = () => {
    console.log("Rejecting registration:", registration.farmId, rejectReason);
    router.push("/dashboard/agency/registrations" as never);
  };

  const handleRequestDocs = () => {
    console.log("Requesting additional documents for:", registration.farmId);
    router.push("/dashboard/agency/registrations" as never);
  };

  const handleSaveDraft = () => {
    console.log("Saving draft review for:", registration.farmId, reviewNotes);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="px-6 py-6">
        <View className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-1">
              <Text className="text-gray-900 text-xl font-bold">
                {registration.farmId}
              </Text>
              <Text className="text-gray-600 text-sm">
                {registration.farmerName} • {registration.location.state}
              </Text>
              <View className="flex-row items-center gap-2 mt-2">
                <View
                  className={`px-2 py-0.5 rounded-full ${getStatusColor(
                    registration.status
                  )}`}
                >
                  <Text className="text-xs font-semibold capitalize">
                    {registration.status.replace("_", " ")}
                  </Text>
                </View>
                <View
                  className={`px-2 py-0.5 rounded-full ${getBlockchainStatusColor(
                    registration.blockchainStatus
                  )}`}
                >
                  <Text className="text-xs font-semibold capitalize">
                    {registration.blockchainStatus.replace("-", " ")}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() =>
                router.push("/dashboard/agency/registrations" as never)
              }
              className="px-3 py-2 rounded-lg bg-white border border-gray-200"
            >
              <Text className="text-gray-700 text-xs font-semibold">
                Back to list
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center gap-3 mt-2">
            <MapPin color="#6b7280" size={16} />
            <Text className="text-gray-700 text-sm flex-1">
              {registration.location.address}
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-4 mt-4">
            <View className="flex-row items-center gap-2">
              <Text className="text-gray-500 text-xs">Size</Text>
              <Text className="text-gray-900 text-sm font-semibold">
                {registration.size} ha
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-gray-500 text-xs">Crops</Text>
              <Text className="text-gray-900 text-sm font-semibold">
                {registration.cropType.join(", ")}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-gray-500 text-xs">Submitted</Text>
              <Text className="text-gray-900 text-sm font-semibold">
                {formatDate(registration.submittedDate)}
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <Text className="text-gray-900 text-base font-bold mb-3">
            A. Document Verification
          </Text>
          <View className="gap-3">
            {registration.documents.map((doc) => (
              <View
                key={doc.id}
                className="flex-row items-center justify-between border border-gray-200 rounded-lg px-4 py-3"
              >
                <View className="flex-1 pr-3">
                  <Text className="text-gray-900 text-sm font-semibold">
                    {doc.name}
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    Uploaded: {formatDate(doc.uploadedDate)}
                  </Text>
                </View>
                <View className="items-end gap-2">
                  <View
                    className={`px-2 py-0.5 rounded-full ${getDocStatusColor(
                      doc.status
                    )}`}
                  >
                    <Text className="text-xs font-semibold capitalize">
                      {doc.status}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleToggleDoc(doc.id)}
                    className={`px-3 py-1 rounded-lg border ${
                      documentVerifications[doc.id]
                        ? "bg-green-50 border-green-500"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        documentVerifications[doc.id]
                          ? "text-green-700"
                          : "text-gray-700"
                      }`}
                    >
                      {documentVerifications[doc.id]
                        ? "Marked verified"
                        : "Mark verified"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
          <Text className="text-gray-600 text-xs mt-3">
            Verified {verifiedDocs}/{totalDocs} documents
          </Text>
        </View>

        <View className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <Text className="text-gray-900 text-base font-bold mb-3">
            B. Blockchain Status
          </Text>
          <View className="gap-2">
            <View
              className={`px-3 py-2 rounded-lg ${getBlockchainStatusColor(
                registration.blockchainStatus
              )}`}
            >
              <Text className="text-sm font-semibold">
                {registration.blockchainStatus === "on-chain"
                  ? "On-chain verification complete"
                  : "Pending on-chain confirmation"}
              </Text>
            </View>
            {registration.blockchainHash ? (
              <View className="gap-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600 text-xs">Transaction Hash</Text>
                  <TouchableOpacity>
                    <ExternalLink color="#2563eb" size={14} />
                  </TouchableOpacity>
                </View>
                <Text className="text-xs font-mono text-gray-900">
                  {registration.blockchainHash}
                </Text>
                <Text className="text-gray-500 text-xs">
                  {formatDate(registration.submittedDate)}
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center gap-2">
                <AlertTriangle color="#d97706" size={16} />
                <Text className="text-amber-800 text-xs">
                  Blockchain transaction will initiate after approval.
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <Text className="text-gray-900 text-base font-bold mb-3">
            C. Review Notes (Optional)
          </Text>
          <TextInput
            value={reviewNotes}
            onChangeText={setReviewNotes}
            placeholder="Add internal notes about this registration..."
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
                  Approve Registration
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleReject}
              className="flex-row items-center justify-center gap-2 bg-white border-2 border-red-500 rounded-lg py-3"
            >
              <XCircle color="#dc2626" size={20} />
              <Text className="text-red-600 text-[15px] font-bold">
                Reject Registration
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
              placeholder="Provide a reason if rejecting this registration"
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
