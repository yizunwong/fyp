import { Text, TouchableOpacity, View } from "react-native";
import { Eye } from "lucide-react-native";
import type { PendingFarmDocumentDto } from "@/api";
import { formatDate } from '@/components/farmer/farm-produce/utils';

export function DocumentsList({
  documents,
  onView,
}: {
  documents: PendingFarmDocumentDto[];
  onView: (url?: string) => void;
}) {
  return (
    <View className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
      <Text className="text-gray-900 text-base font-bold mb-3">Documentation</Text>
      <View className="gap-3">
        {documents.map((doc) => (
          <View
            key={doc.id}
            className="flex-row items-start justify-between border border-gray-200 rounded-lg px-4 py-3"
          >
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
            <TouchableOpacity
              onPress={() => onView(doc.ipfsUrl)}
              className="flex-row items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 border border-blue-200"
            >
              <Eye color="#2563eb" size={14} />
              <Text className="text-blue-700 text-xs font-semibold">View</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}
