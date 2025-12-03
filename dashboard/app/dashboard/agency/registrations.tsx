import { useMemo } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { CheckCircle, Clock, Eye, FileText, Filter, MapPin, XCircle } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAgencyLayout } from "@/components/agency/layout/AgencyLayoutContext";
import { usePendingFarmsQuery } from "@/hooks/useFarmReview";
import type {
  PendingFarmResponseDto,
  PendingFarmResponseDtoSizeUnit,
  PendingFarmResponseDtoVerificationStatus,
} from "@/api";

type StatusStyle = {
  badge: string;
  text: string;
  label: string;
};

const STATUS_STYLES: Record<PendingFarmResponseDtoVerificationStatus, StatusStyle> = {
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

function SummaryCards({
  stats,
}: {
  stats: { pending: number; verified: number; rejected: number; documents: number };
}) {
  return (
    <View className="flex-row flex-wrap gap-4 mb-6">
      <View className="flex-1 min-w-[180px] bg-white rounded-xl p-4 border border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-yellow-50 rounded-lg items-center justify-center">
            <Clock color="#b45309" size={20} />
          </View>
          <Text className="text-2xl font-bold text-gray-900">{stats.pending}</Text>
        </View>
        <Text className="text-gray-600 text-sm font-medium">Pending Review</Text>
        <Text className="text-gray-500 text-xs mt-1">Awaiting verification</Text>
      </View>

      <View className="flex-1 min-w-[180px] bg-white rounded-xl p-4 border border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-green-50 rounded-lg items-center justify-center">
            <CheckCircle color="#15803d" size={20} />
          </View>
          <Text className="text-2xl font-bold text-gray-900">{stats.verified}</Text>
        </View>
        <Text className="text-gray-600 text-sm font-medium">Verified</Text>
        <Text className="text-gray-500 text-xs mt-1">Completed checks</Text>
      </View>

      <View className="flex-1 min-w-[180px] bg-white rounded-xl p-4 border border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-red-50 rounded-lg items-center justify-center">
            <XCircle color="#dc2626" size={20} />
          </View>
          <Text className="text-2xl font-bold text-gray-900">{stats.rejected}</Text>
        </View>
        <Text className="text-gray-600 text-sm font-medium">Rejected</Text>
        <Text className="text-gray-500 text-xs mt-1">Requires resubmission</Text>
      </View>

      <View className="flex-1 min-w-[180px] bg-white rounded-xl p-4 border border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-blue-50 rounded-lg items-center justify-center">
            <FileText color="#2563eb" size={20} />
          </View>
          <Text className="text-2xl font-bold text-gray-900">{stats.documents}</Text>
        </View>
        <Text className="text-gray-600 text-sm font-medium">Documents</Text>
        <Text className="text-gray-500 text-xs mt-1">Uploaded for review</Text>
      </View>
    </View>
  );
}

function RegistrationRow({ farm }: { farm: PendingFarmResponseDto }) {
  const statusStyle = STATUS_STYLES[farm.verificationStatus];
  return (
    <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
      <View className="flex-1">
        <Text className="text-gray-900 text-sm font-semibold">{farm.name}</Text>
        <Text className="text-gray-500 text-xs mt-0.5">#{farm.id}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 text-sm font-medium">{farm.farmer.username}</Text>
        <Text className="text-gray-500 text-xs mt-0.5">{farm.farmer.email}</Text>
      </View>
      <Text className="w-40 text-gray-700 text-sm">{farm.location}</Text>
      <Text className="w-24 text-gray-900 text-sm font-medium">
        {farm.size} {formatSizeUnit(farm.sizeUnit)}
      </Text>
      <View className="w-40">
        <Text className="text-gray-700 text-xs" numberOfLines={2}>
          {farm.produceCategories.join(", ")}
        </Text>
      </View>
      <View className="w-28 items-start">
        <View className={`px-2 py-0.5 rounded-full ${statusStyle.badge}`}>
          <Text className={`text-xs font-semibold ${statusStyle.text}`}>{statusStyle.label}</Text>
        </View>
      </View>
      <View className="w-24">
        <TouchableOpacity
          onPress={() => router.push(`/dashboard/agency/registrations/${farm.id}` as never)}
          className="flex-row items-center justify-center gap-1 bg-blue-50 border border-blue-200 rounded-lg py-1.5 px-2"
        >
          <Eye color="#2563eb" size={14} />
          <Text className="text-blue-700 text-xs font-semibold">Review</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function RegistrationCard({ farm }: { farm: PendingFarmResponseDto }) {
  const statusStyle = STATUS_STYLES[farm.verificationStatus];
  return (
    <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-gray-900 text-base font-bold">{farm.name}</Text>
            <View className={`px-2 py-0.5 rounded-full ${statusStyle.badge}`}>
              <Text className={`text-xs font-semibold ${statusStyle.text}`}>{statusStyle.label}</Text>
            </View>
          </View>
          <Text className="text-gray-600 text-sm">{farm.farmer.username}</Text>
          <Text className="text-gray-500 text-xs mt-1">#{farm.id}</Text>
        </View>
      </View>

      <View className="gap-2 mb-4">
        <View className="flex-row items-center gap-2">
          <MapPin color="#6b7280" size={16} />
          <Text className="text-gray-700 text-sm flex-1">{farm.location}</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">Size</Text>
          <Text className="text-gray-900 text-sm font-medium">
            {farm.size} {formatSizeUnit(farm.sizeUnit)}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">Crops</Text>
          <Text className="text-gray-900 text-sm font-medium" numberOfLines={1}>
            {farm.produceCategories.join(", ")}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">Documents</Text>
          <Text className="text-gray-900 text-sm font-medium">{farm.farmDocuments.length}</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => router.push(`/dashboard/agency/registrations/${farm.id}` as never)}
        className="rounded-lg overflow-hidden"
      >
        <LinearGradient
          colors={["#2563eb", "#1d4ed8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex-row items-center justify-center gap-2 py-2.5"
        >
          <Eye color="#fff" size={18} />
          <Text className="text-white text-sm font-semibold">Review Registration</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

export default function FarmRegistrationReviewScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;

  useAgencyLayout({
    title: "Farm Registration Review",
    subtitle: "Validate and approve farm registrations",
  });

  const { data, error, isLoading, isFetching, refetch } = usePendingFarmsQuery();
  const farms = data?.data ?? [];

  const stats = useMemo(
    () => ({
      pending: farms.filter((farm) => farm.verificationStatus === "PENDING").length,
      verified: farms.filter((farm) => farm.verificationStatus === "VERIFIED").length,
      rejected: farms.filter((farm) => farm.verificationStatus === "REJECTED").length,
      documents: farms.reduce((total, farm) => total + farm.farmDocuments.length, 0),
    }),
    [farms],
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-700 mt-3">Loading registrations...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-gray-900 text-xl font-bold mb-2">Failed to load registrations</Text>
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

  const pageContent = (
    <View className="px-6 py-6">
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-gray-900 text-xl font-bold">Farm Registration Review</Text>
          <Text className="text-gray-600 text-sm">Validate and approve farm registrations</Text>
        </View>
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => refetch()}
            className="flex-row items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg"
          >
            <Filter color="#6b7280" size={18} />
            <Text className="text-gray-700 text-sm font-semibold">
              {isFetching ? "Refreshing..." : "Refresh"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <SummaryCards stats={stats} />

      {isDesktop ? (
        <View className="bg-white rounded-xl border border-gray-200">
          <View className="flex-row border-b border-gray-200 px-6 py-4 bg-gray-50 rounded-t-xl">
            <Text className="flex-1 text-gray-600 text-xs font-semibold">Farm</Text>
            <Text className="flex-1 text-gray-600 text-xs font-semibold">Farmer</Text>
            <Text className="w-40 text-gray-600 text-xs font-semibold">Location</Text>
            <Text className="w-24 text-gray-600 text-xs font-semibold">Size</Text>
            <Text className="w-40 text-gray-600 text-xs font-semibold">Produce Categories</Text>
            <Text className="w-28 text-gray-600 text-xs font-semibold">Status</Text>
            <Text className="w-24 text-gray-600 text-xs font-semibold">Action</Text>
          </View>

          <ScrollView className="max-h-[600px]">
            {farms.map((farm) => (
              <RegistrationRow key={farm.id} farm={farm} />
            ))}
          </ScrollView>
        </View>
      ) : (
        <View>
          {farms.map((farm) => (
            <RegistrationCard key={farm.id} farm={farm} />
          ))}
        </View>
      )}
    </View>
  );

  return isDesktop ? (
    pageContent
  ) : (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">{pageContent}</ScrollView>
    </View>
  );
}
