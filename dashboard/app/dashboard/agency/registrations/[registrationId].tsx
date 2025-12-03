import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { CheckCircle, Eye, FileText, MapPin, XCircle } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useAgencyLayout } from "@/components/agency/layout/AgencyLayoutContext";
import { usePendingFarmQuery } from "@/hooks/useFarmReview";
import type {
  PendingFarmResponseDtoSizeUnit,
  PendingFarmResponseDtoVerificationStatus,
} from "@/api";

const STATUS_STYLES: Record<
  PendingFarmResponseDtoVerificationStatus,
  { badge: string; text: string; label: string }
> = {
  PENDING: {
    badge: "bg-yellow-100 border border-yellow-200",
    text: "text-yellow-800",
    label: "Pending review",
  },
  VERIFIED: {
    badge: "bg-green-100 border border-green-200",
    text: "text-green-800",
    label: "Verified",
  },
  REJECTED: {
    badge: "bg-red-100 border border-red-200",
    text: "text-red-800",
    label: "Rejected",
  },
};

const formatSizeUnit = (unit?: PendingFarmResponseDtoSizeUnit) => {
  switch (unit) {
    case "HECTARE":
      return "ha";
    case "ACRE":
      return "acre";
    case "SQUARE_METER":
      return "m2";
    default:
      return unit ?? "";
  }
};

const formatDate = (value?: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function RegistrationReviewPage() {
  const params = useLocalSearchParams<{ registrationId?: string }>();
  const registrationId = Array.isArray(params.registrationId)
    ? params.registrationId[0] ?? ""
    : params.registrationId ?? "";
  const { data, isLoading, error, refetch } = usePendingFarmQuery(registrationId);
  const farm = data?.data;

  useAgencyLayout({
    title: farm ? `Review ${farm.name}` : "Review Registration",
    subtitle: "Deep dive into the farm submission and approve or reject",
  });

  if (!registrationId) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-gray-900 text-xl font-bold mb-2">No registration id provided</Text>
        <TouchableOpacity
          onPress={() => router.push("/dashboard/agency/registrations" as never)}
          className="px-4 py-2 bg-blue-600 rounded-lg"
        >
          <Text className="text-white font-semibold">Back to list</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-gray-900 text-xl font-bold mb-2">Loading registration…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-gray-900 text-xl font-bold mb-2">Failed to load registration</Text>
        <Text className="text-gray-600 text-sm mb-4">{error as string}</Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="px-4 py-2 bg-blue-600 rounded-lg"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!farm) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-gray-900 text-xl font-bold mb-2">Registration not found</Text>
        <TouchableOpacity
          onPress={() => router.push("/dashboard/agency/registrations" as never)}
          className="px-4 py-2 bg-blue-600 rounded-lg"
        >
          <Text className="text-white font-semibold">Back to list</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusStyle = STATUS_STYLES[farm.verificationStatus];

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="px-6 py-6">
        <View className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-1">
              <Text className="text-gray-900 text-xl font-bold">{farm.name}</Text>
              <Text className="text-gray-600 text-sm">
                {farm.farmer.username} — #{farm.id}
              </Text>
              <View className="flex-row items-center gap-2 mt-2">
                <View className={`px-2 py-0.5 rounded-full ${statusStyle.badge}`}>
                  <Text className={`text-xs font-semibold ${statusStyle.text}`}>
                    {statusStyle.label}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/dashboard/agency/registrations" as never)}
              className="px-3 py-2 rounded-lg bg-white border border-gray-200"
            >
              <Text className="text-gray-700 text-xs font-semibold">Back to list</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center gap-3 mt-2">
            <MapPin color="#6b7280" size={16} />
            <Text className="text-gray-700 text-sm flex-1">{farm.location}</Text>
          </View>

          <View className="flex-row flex-wrap gap-4 mt-4">
            <View className="flex-row items-center gap-2">
              <Text className="text-gray-500 text-xs">Size</Text>
              <Text className="text-gray-900 text-sm font-semibold">
                {farm.size} {formatSizeUnit(farm.sizeUnit)}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-gray-500 text-xs">Crops</Text>
              <Text className="text-gray-900 text-sm font-semibold">
                {farm.produceCategories.join(", ")}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-gray-500 text-xs">Submitted</Text>
              <Text className="text-gray-900 text-sm font-semibold">
                {formatDate(farm.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <Text className="text-gray-900 text-base font-bold mb-3">Farmer Information</Text>
          <View className="gap-2">
            <Text className="text-gray-700 text-sm font-semibold">{farm.farmer.username}</Text>
            <Text className="text-gray-600 text-xs">Email: {farm.farmer.email}</Text>
            <Text className="text-gray-600 text-xs">NRIC: {farm.farmer.nric}</Text>
            <Text className="text-gray-600 text-xs">
              Phone: {farm.farmer.phone ? String(farm.farmer.phone) : "Not provided"}
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <Text className="text-gray-900 text-base font-bold mb-3">Documentation</Text>
          <View className="gap-3">
            {farm.farmDocuments.map((doc) => (
              <View
                key={doc.id}
                className="flex-row items-start justify-between border border-gray-200 rounded-lg px-4 py-3"
              >
                <View className="flex-1 pr-3">
                  <Text className="text-gray-900 text-sm font-semibold">{doc.type}</Text>
                  <Text className="text-gray-500 text-xs mt-0.5">
                    Uploaded: {formatDate(doc.createdAt)}
                  </Text>
                  {doc.fileName && (
                    <Text className="text-gray-500 text-xs mt-0.5">{String(doc.fileName)}</Text>
                  )}
                  <Text className="text-gray-600 text-xs mt-1" numberOfLines={1}>
                    {doc.ipfsUrl}
                  </Text>
                </View>
                <TouchableOpacity className="flex-row items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 border border-blue-200">
                  <Eye color="#2563eb" size={14} />
                  <Text className="text-blue-700 text-xs font-semibold">View</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View className="bg-white rounded-xl border border-gray-200 p-5">
          <Text className="text-gray-900 text-base font-bold mb-3">Officer Decision</Text>
          <View className="gap-3">
            <TouchableOpacity
              onPress={() => console.log("Approve pending farm", farm.id)}
              className="rounded-lg overflow-hidden"
            >
              <LinearGradient
                colors={["#22c55e", "#15803d"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="flex-row items-center justify-center gap-2 py-3"
              >
                <CheckCircle color="#fff" size={20} />
                <Text className="text-white text-[15px] font-bold">Approve Registration</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => console.log("Reject pending farm", farm.id)}
              className="flex-row items-center justify-center gap-2 bg-white border-2 border-red-500 rounded-lg py-3"
            >
              <XCircle color="#dc2626" size={20} />
              <Text className="text-red-600 text-[15px] font-bold">Reject Registration</Text>
            </TouchableOpacity>

            <View className="mt-4">
              <Text className="text-gray-600 text-xs mb-1">Internal Notes</Text>
              <TextInput
                placeholder="Add internal notes about this registration..."
                multiline
                numberOfLines={3}
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                placeholderTextColor="#9ca3af"
                style={{ textAlignVertical: "top" }}
              />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
