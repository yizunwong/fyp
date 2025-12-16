import { Text, TouchableOpacity, View } from "react-native";
import { Eye, CheckCircle, XCircle, Clock } from "lucide-react-native";
import type { PendingFarmDocumentDto } from "@/api";
import { formatDate } from '@/components/farmer/farm-produce/utils';

type DocumentStatus = "PENDING" | "VERIFIED" | "REJECTED";

export function DocumentsList({
  documents,
  onView,
  onVerify,
  onReject,
  isUpdatingDocument,
}: {
  documents: PendingFarmDocumentDto[];
  onView: (url?: string) => void;
  onVerify?: (documentId: string) => void;
  onReject?: (documentId: string) => void;
  isUpdatingDocument?: (documentId: string) => boolean;
}) {
  const getStatusColor = (status?: string | null) => {
    switch (status) {
      case "VERIFIED":
        return "bg-green-100 text-green-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusIcon = (status?: string | null) => {
    switch (status) {
      case "VERIFIED":
        return <CheckCircle color="#15803d" size={14} />;
      case "REJECTED":
        return <XCircle color="#dc2626" size={14} />;
      default:
        return <Clock color="#b45309" size={14} />;
    }
  };

  const getStatusLabel = (status?: string | null) => {
    switch (status) {
      case "VERIFIED":
        return "Verified";
      case "REJECTED":
        return "Rejected";
      default:
        return "Pending";
    }
  };

  return (
    <View className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
      <Text className="text-gray-900 text-base font-bold mb-3">Documentation</Text>
      <View className="gap-3">
        {documents.map((doc) => {
          const status = (doc as any).verificationStatus as DocumentStatus | undefined;
          const isUpdating = isUpdatingDocument?.(doc.id) ?? false;
          const isVerified = status === "VERIFIED";
          const isRejected = status === "REJECTED";
          const isPending = !status || status === "PENDING";

          return (
            <View
              key={doc.id}
              className="border border-gray-200 rounded-lg px-4 py-3"
            >
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1 pr-3">
                  <Text className="text-gray-900 text-sm font-semibold">{doc.type}</Text>
                  <Text className="text-gray-500 text-xs mt-0.5">Uploaded: {formatDate(doc.createdAt)}</Text>
                  {doc.fileName && (
                    <Text className="text-gray-500 text-xs mt-0.5">{String(doc.fileName)}</Text>
                  )}
                  <Text className="text-gray-600 text-xs mt-1" numberOfLines={1}>
                    {doc.ipfsUrl}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  {status && (
                    <View
                      className={`flex-row items-center gap-1 px-2 py-1 rounded-full ${getStatusColor(status)}`}
                    >
                      {getStatusIcon(status)}
                      <Text className="text-xs font-semibold">
                        {getStatusLabel(status)}
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => onView(doc.ipfsUrl)}
                    className="flex-row items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 border border-blue-200"
                  >
                    <Eye color="#2563eb" size={14} />
                    <Text className="text-blue-700 text-xs font-semibold">View</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {onVerify && onReject && isPending && (
                <View className="flex-row gap-2 mt-2 pt-2 border-t border-gray-200">
                  <TouchableOpacity
                    disabled={isUpdating}
                    onPress={() => onVerify(doc.id)}
                    className={`flex-1 flex-row items-center justify-center gap-1 px-3 py-2 rounded-lg bg-green-50 border border-green-200 ${
                      isUpdating ? "opacity-60" : ""
                    }`}
                  >
                    <CheckCircle color="#15803d" size={14} />
                    <Text className="text-green-700 text-xs font-semibold">
                      {isUpdating ? "Verifying..." : "Verify"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    disabled={isUpdating}
                    onPress={() => onReject(doc.id)}
                    className={`flex-1 flex-row items-center justify-center gap-1 px-3 py-2 rounded-lg bg-red-50 border border-red-200 ${
                      isUpdating ? "opacity-60" : ""
                    }`}
                  >
                    <XCircle color="#dc2626" size={14} />
                    <Text className="text-red-700 text-xs font-semibold">
                      {isUpdating ? "Rejecting..." : "Reject"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
