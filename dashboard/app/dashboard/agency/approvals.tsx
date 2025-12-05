import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  useWindowDimensions,
} from "react-native";
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Download,
  Clock,
  TrendingUp,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAgencyLayout } from "@/components/agency/layout/AgencyLayoutContext";
import { mockClaims, type SubsidyClaim } from "./approvals-data";
import { formatCurrency, formatDate } from '@/components/farmer/farm-produce/utils';

export default function SubsidyApprovalQueueScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;
  useAgencyLayout({
    title: "Subsidy Approval Queue",
    subtitle: "Review and process pending subsidy claims",
  });

  const [claims] = useState<SubsidyClaim[]>(mockClaims);
  const [showFilters, setShowFilters] = useState(false);

  const stats = {
    pendingManual: claims.filter(
      (c) => c.triggerType === "manual" && c.status === "pending"
    ).length,
    autoTriggered: claims.filter(
      (c) => c.triggerType === "oracle" && c.status === "pending"
    ).length,
    docsRequired: claims.filter((c) => c.status === "docs_required").length,
    flagged: claims.filter((c) => c.status === "flagged").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "flagged":
        return "bg-orange-100 text-orange-700";
      case "docs_required":
        return "bg-blue-100 text-blue-700";
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
      case "flagged":
        return <AlertTriangle color="#ea580c" size={16} />;
      default:
        return <FileText color="#2563eb" size={16} />;
    }
  };

  const SummaryCards = () => (
    <View className={isDesktop ? "flex-row gap-4 mb-6" : "gap-3 mb-6"}>
      <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-emerald-50 rounded-lg items-center justify-center">
            <FileText color="#059669" size={20} />
          </View>
          <Text className="text-2xl font-bold text-gray-900">
            {stats.pendingManual}
          </Text>
        </View>
        <Text className="text-gray-600 text-sm font-medium">
          Pending Manual Claims
        </Text>
        <Text className="text-gray-500 text-xs mt-1">Farmer-submitted</Text>
      </View>

      <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-blue-50 rounded-lg items-center justify-center">
            <TrendingUp color="#2563eb" size={20} />
          </View>
          <Text className="text-2xl font-bold text-gray-900">
            {stats.autoTriggered}
          </Text>
        </View>
        <Text className="text-gray-600 text-sm font-medium">
          Auto-Triggered Claims
        </Text>
        <Text className="text-gray-500 text-xs mt-1">Oracle-generated</Text>
      </View>

      <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-yellow-50 rounded-lg items-center justify-center">
            <Clock color="#b45309" size={20} />
          </View>
          <Text className="text-2xl font-bold text-gray-900">
            {stats.docsRequired}
          </Text>
        </View>
        <Text className="text-gray-600 text-sm font-medium">
          Additional Docs
        </Text>
        <Text className="text-gray-500 text-xs mt-1">
          Incomplete submissions
        </Text>
      </View>

      <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-orange-50 rounded-lg items-center justify-center">
            <AlertTriangle color="#ea580c" size={20} />
          </View>
          <Text className="text-2xl font-bold text-gray-900">
            {stats.flagged}
          </Text>
        </View>
        <Text className="text-gray-600 text-sm font-medium">
          Flagged Claims
        </Text>
        <Text className="text-gray-500 text-xs mt-1">Anomaly detected</Text>
      </View>
    </View>
  );

  const ClaimCard = ({ claim }: { claim: SubsidyClaim }) => (
    <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-gray-900 text-base font-bold">
              {claim.claimId}
            </Text>
            <View
              className={`px-2 py-0.5 rounded-full ${
                claim.triggerType === "oracle"
                  ? "bg-blue-100"
                  : "bg-emerald-100"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  claim.triggerType === "oracle"
                    ? "text-blue-700"
                    : "text-emerald-700"
                }`}
              >
                {claim.triggerType === "oracle" ? "ORACLE" : "MANUAL"}
              </Text>
            </View>
          </View>
          <Text className="text-gray-600 text-sm">{claim.farmerName}</Text>
          <Text className="text-gray-500 text-xs mt-1">
            {claim.farmName} • {claim.location}
          </Text>
        </View>
        <View
          className={`flex-row items-center gap-1 px-3 py-1 rounded-full ${getStatusColor(
            claim.status
          )}`}
        >
          {getStatusIcon(claim.status)}
          <Text className="text-xs font-semibold capitalize">
            {claim.status.replace("_", " ")}
          </Text>
        </View>
      </View>

      <View className="gap-2 mb-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">Policy</Text>
          <Text className="text-gray-900 text-sm font-medium">
            {claim.policy}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">Claim Value</Text>
          <Text className="text-gray-900 text-sm font-bold">
            {formatCurrency(claim.claimValue)}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">Submitted</Text>
          <Text className="text-gray-900 text-sm font-medium">
            {formatDate(claim.submittedDate)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() =>
          router.push(`/dashboard/agency/approvals/${claim.id}` as never)
        }
        className="rounded-lg overflow-hidden"
      >
        <LinearGradient
          colors={["#2563eb", "#1d4ed8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex-row items-center justify-center gap-2 py-2.5"
        >
          <Eye color="#fff" size={18} />
          <Text className="text-white text-sm font-semibold">Review Claim</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const ClaimsTable = () => (
    <View className="bg-white rounded-xl border border-gray-200">
      <View className="flex-row border-b border-gray-200 px-6 py-4 bg-gray-50 rounded-t-xl">
        <Text className="w-32 text-gray-600 text-xs font-semibold">
          Claim ID
        </Text>
        <Text className="flex-1 text-gray-600 text-xs font-semibold">
          Farmer / Farm
        </Text>
        <Text className="w-24 text-gray-600 text-xs font-semibold">
          Trigger
        </Text>
        <Text className="flex-1 text-gray-600 text-xs font-semibold">
          Policy
        </Text>
        <Text className="w-32 text-gray-600 text-xs font-semibold">
          Claim Value
        </Text>
        <Text className="w-28 text-gray-600 text-xs font-semibold">Status</Text>
        <Text className="w-24 text-gray-600 text-xs font-semibold">Action</Text>
      </View>

      <ScrollView className="max-h-[600px]">
        {claims.map((claim) => (
          <View
            key={claim.id}
            className="flex-row items-center px-6 py-4 border-b border-gray-100"
          >
            <View className="w-32">
              <Text className="text-gray-900 text-sm font-medium">
                {claim.claimId}
              </Text>
              <Text className="text-gray-500 text-xs mt-0.5">
                {claim.farmId}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-sm font-medium">
                {claim.farmerName}
              </Text>
              <Text className="text-gray-500 text-xs mt-0.5">
                {claim.farmName}
              </Text>
            </View>
            <View className="w-24">
              <View
                className={`px-2 py-1 rounded-full self-start ${
                  claim.triggerType === "oracle"
                    ? "bg-blue-100"
                    : "bg-emerald-100"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    claim.triggerType === "oracle"
                      ? "text-blue-700"
                      : "text-emerald-700"
                  }`}
                >
                  {claim.triggerType === "oracle" ? "ORACLE" : "MANUAL"}
                </Text>
              </View>
            </View>
            <Text className="flex-1 text-gray-700 text-sm">{claim.policy}</Text>
            <Text className="w-32 text-gray-900 text-sm font-semibold">
              {formatCurrency(claim.claimValue)}
            </Text>
            <View className="w-28">
              <View
                className={`flex-row items-center gap-1 px-2 py-1 rounded-full self-start ${getStatusColor(
                  claim.status
                )}`}
              >
                {getStatusIcon(claim.status)}
                <Text className="text-xs font-semibold capitalize">
                  {claim.status.replace("_", " ")}
                </Text>
              </View>
            </View>
            <View className="w-24">
              <TouchableOpacity
                onPress={() =>
                  router.push(`/dashboard/agency/approvals/${claim.id}` as never)
                }
                className="flex-row items-center justify-center gap-1 bg-blue-50 border border-blue-200 rounded-lg py-1.5 px-2"
              >
                <Eye color="#2563eb" size={14} />
                <Text className="text-blue-700 text-xs font-semibold">
                  Review
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
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-gray-900 text-xl font-bold">
            Subsidy Approval Queue
          </Text>
          <Text className="text-gray-600 text-sm">
            Review and process subsidy claims
          </Text>
        </View>
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            className="flex-row items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg"
          >
            <Filter color="#6b7280" size={18} />
            <Text className="text-gray-700 text-sm font-semibold">Filters</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg">
            <Download color="#6b7280" size={18} />
            <Text className="text-gray-700 text-sm font-semibold">Export</Text>
          </TouchableOpacity>
        </View>
      </View>

      <SummaryCards />

      {isDesktop ? (
        <ClaimsTable />
      ) : (
        <View>
          {claims.map((claim) => (
            <ClaimCard key={claim.id} claim={claim} />
          ))}
        </View>
      )}
    </View>
  );

  if (isDesktop) {
    return pageContent;
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">{pageContent}</ScrollView>
    </View>
  );
}
