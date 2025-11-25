import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  useWindowDimensions,
  Modal,
  TextInput,
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
  MapPin,
  Shield,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAgencyLayout } from "@/components/agency/layout/AgencyLayoutContext";

interface SubsidyClaim {
  id: string;
  claimId: string;
  farmerName: string;
  farmId: string;
  farmName: string;
  location: string;
  triggerType: "manual" | "oracle";
  policy: string;
  claimValue: number;
  onChainRef: string;
  status: "pending" | "approved" | "rejected" | "docs_required" | "flagged";
  submittedDate: string;
  farmerIC: string;
  cropCycle?: string;
  weatherTrigger?: {
    event: string;
    date: string;
    rainfallDepth: number;
    severity: string;
  };
  documents: {
    name: string;
    status: "verified" | "pending" | "missing";
  }[];
  blockchainHash: string;
  flagReason?: string;
}

const mockClaims: SubsidyClaim[] = [
  {
    id: "1",
    claimId: "SUB-2025-0142",
    farmerName: "Ahmad bin Abdullah",
    farmId: "FARM-001",
    farmName: "Green Valley Farm",
    location: "Kuala Terengganu, Terengganu",
    triggerType: "oracle",
    policy: "Flood Relief Fund 2025",
    claimValue: 5000,
    onChainRef:
      "0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385",
    status: "pending",
    submittedDate: "2025-11-25",
    farmerIC: "850123-01-5678",
    cropCycle: "Paddy Season 2 - 2025",
    weatherTrigger: {
      event: "Heavy Rainfall Alert",
      date: "2025-11-24",
      rainfallDepth: 120,
      severity: "Critical",
    },
    documents: [
      { name: "Farm Registration Certificate", status: "verified" },
      { name: "Crop Declaration Form", status: "verified" },
      { name: "Bank Account Details", status: "verified" },
    ],
    blockchainHash:
      "0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385",
  },
  {
    id: "2",
    claimId: "SUB-2025-0138",
    farmerName: "Siti Nurhaliza binti Hassan",
    farmId: "FARM-045",
    farmName: "Sunrise Organic Farm",
    location: "Cameron Highlands, Pahang",
    triggerType: "manual",
    policy: "Organic Farming Support Grant",
    claimValue: 3500,
    onChainRef:
      "0x8a1bcd3f2e4d5678901234567890abcdef1234567890abcdef1234567890abcd",
    status: "pending",
    submittedDate: "2025-11-24",
    farmerIC: "900315-14-2345",
    cropCycle: "Vegetables Q4 - 2025",
    documents: [
      { name: "Farm Registration Certificate", status: "verified" },
      { name: "Organic Certification", status: "verified" },
      { name: "Bank Account Details", status: "pending" },
    ],
    blockchainHash:
      "0x8a1bcd3f2e4d5678901234567890abcdef1234567890abcdef1234567890abcd",
  },
  {
    id: "3",
    claimId: "SUB-2025-0135",
    farmerName: "Kumar Selvam",
    farmId: "FARM-078",
    farmName: "Highland Plantation",
    location: "Kota Bharu, Kelantan",
    triggerType: "manual",
    policy: "Smart Farming Technology Subsidy",
    claimValue: 7000,
    onChainRef:
      "0x3c5d7e9f1a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d",
    status: "flagged",
    submittedDate: "2025-11-23",
    farmerIC: "880722-12-3456",
    cropCycle: "Mixed Crops - 2025",
    documents: [
      { name: "Farm Registration Certificate", status: "verified" },
      { name: "Technology Purchase Invoice", status: "pending" },
      { name: "Bank Account Details", status: "missing" },
    ],
    blockchainHash:
      "0x3c5d7e9f1a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d",
    flagReason:
      "Duplicate submission detected - Similar claim filed 15 days ago",
  },
  {
    id: "4",
    claimId: "SUB-2025-0131",
    farmerName: "Tan Mei Ling",
    farmId: "FARM-023",
    farmName: "Eco Valley Farms",
    location: "Alor Setar, Kedah",
    triggerType: "oracle",
    policy: "Drought Assistance Program",
    claimValue: 4200,
    onChainRef:
      "0x9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c",
    status: "docs_required",
    submittedDate: "2025-11-22",
    farmerIC: "920518-02-6789",
    cropCycle: "Paddy Season 1 - 2025",
    weatherTrigger: {
      event: "Prolonged Drought",
      date: "2025-11-20",
      rainfallDepth: 3,
      severity: "High",
    },
    documents: [
      { name: "Farm Registration Certificate", status: "verified" },
      { name: "Crop Loss Assessment", status: "missing" },
      { name: "Bank Account Details", status: "verified" },
    ],
    blockchainHash:
      "0x9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c",
  },
];

export default function SubsidyApprovalQueueScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;
  useAgencyLayout({
    title: "Subsidy Approval Queue",
    subtitle: "Review and process pending subsidy claims",
  });

  const [claims] = useState<SubsidyClaim[]>(mockClaims);
  const [selectedClaim, setSelectedClaim] = useState<SubsidyClaim | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
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

  const formatCurrency = (amount: number) => {
    return `RM ${amount.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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

  const handleApprove = () => {
    console.log("Approving claim:", selectedClaim?.claimId);
    setShowReviewModal(false);
    setSelectedClaim(null);
  };

  const handleReject = () => {
    console.log(
      "Rejecting claim:",
      selectedClaim?.claimId,
      "Reason:",
      rejectReason
    );
    setShowRejectModal(false);
    setShowReviewModal(false);
    setSelectedClaim(null);
    setRejectReason("");
  };

  const handleRequestDocs = () => {
    console.log("Requesting additional documents for:", selectedClaim?.claimId);
    setShowReviewModal(false);
    setSelectedClaim(null);
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
        onPress={() => {
          setSelectedClaim(claim);
          setShowReviewModal(true);
        }}
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
                onPress={() => {
                  setSelectedClaim(claim);
                  setShowReviewModal(true);
                }}
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

  return (
    <>
      {isDesktop ? (
        pageContent
      ) : (
        <View className="flex-1 bg-gray-50">
          <ScrollView className="flex-1">{pageContent}</ScrollView>
        </View>
      )}

      <Modal visible={showReviewModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[90%]">
            <ScrollView>
              <View className="p-6">
                <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-gray-900 text-xl font-bold">
                    Review Claim
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowReviewModal(false)}
                    className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                  >
                    <Text className="text-gray-600 text-lg">×</Text>
                  </TouchableOpacity>
                </View>

                {selectedClaim && (
                  <View className="gap-6">
                    <View>
                      <Text className="text-gray-700 text-sm font-bold mb-3">
                        Claim Information
                      </Text>
                      <View className="gap-3">
                        <View className="bg-gray-50 rounded-lg p-4">
                          <Text className="text-gray-600 text-xs mb-1">
                            Claim ID
                          </Text>
                          <Text className="text-gray-900 text-base font-bold">
                            {selectedClaim.claimId}
                          </Text>
                        </View>

                        <View className="flex-row gap-3">
                          <View className="flex-1 bg-gray-50 rounded-lg p-4">
                            <Text className="text-gray-600 text-xs mb-1">
                              Trigger Type
                            </Text>
                            <View
                              className={`px-2 py-1 rounded-full self-start mt-1 ${
                                selectedClaim.triggerType === "oracle"
                                  ? "bg-blue-100"
                                  : "bg-emerald-100"
                              }`}
                            >
                              <Text
                                className={`text-xs font-semibold ${
                                  selectedClaim.triggerType === "oracle"
                                    ? "text-blue-700"
                                    : "text-emerald-700"
                                }`}
                              >
                                {selectedClaim.triggerType === "oracle"
                                  ? "Oracle Auto"
                                  : "Manual"}
                              </Text>
                            </View>
                          </View>
                          <View className="flex-1 bg-gray-50 rounded-lg p-4">
                            <Text className="text-gray-600 text-xs mb-1">
                              Claim Value
                            </Text>
                            <Text className="text-gray-900 text-lg font-bold">
                              {formatCurrency(selectedClaim.claimValue)}
                            </Text>
                          </View>
                        </View>

                        <View className="bg-gray-50 rounded-lg p-4">
                          <Text className="text-gray-600 text-xs mb-1">
                            Policy
                          </Text>
                          <Text className="text-gray-900 text-sm font-semibold">
                            {selectedClaim.policy}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View>
                      <Text className="text-gray-700 text-sm font-bold mb-3">
                        Farmer Details
                      </Text>
                      <View className="gap-3">
                        <View className="bg-gray-50 rounded-lg p-4">
                          <Text className="text-gray-600 text-xs mb-1">
                            Farmer Name
                          </Text>
                          <Text className="text-gray-900 text-sm font-semibold">
                            {selectedClaim.farmerName}
                          </Text>
                        </View>

                        <View className="bg-gray-50 rounded-lg p-4">
                          <Text className="text-gray-600 text-xs mb-1">
                            IC Number
                          </Text>
                          <Text className="text-gray-900 text-sm font-mono">
                            {selectedClaim.farmerIC}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View>
                      <Text className="text-gray-700 text-sm font-bold mb-3">
                        Farm Registration
                      </Text>
                      <View className="gap-3">
                        <View className="bg-gray-50 rounded-lg p-4">
                          <Text className="text-gray-600 text-xs mb-1">
                            Farm ID
                          </Text>
                          <Text className="text-gray-900 text-sm font-semibold">
                            {selectedClaim.farmId}
                          </Text>
                        </View>

                        <View className="bg-gray-50 rounded-lg p-4">
                          <Text className="text-gray-600 text-xs mb-1">
                            Farm Name
                          </Text>
                          <Text className="text-gray-900 text-sm font-semibold">
                            {selectedClaim.farmName}
                          </Text>
                        </View>

                        <View className="bg-gray-50 rounded-lg p-4">
                          <Text className="text-gray-600 text-xs mb-1">
                            Location
                          </Text>
                          <View className="flex-row items-center gap-2 mt-1">
                            <MapPin color="#6b7280" size={14} />
                            <Text className="text-gray-900 text-sm">
                              {selectedClaim.location}
                            </Text>
                          </View>
                        </View>

                        <View className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <Text className="text-green-700 text-xs mb-1 font-semibold">
                            Blockchain Hash
                          </Text>
                          <Text className="text-green-700 text-xs font-mono">
                            {selectedClaim.blockchainHash}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {selectedClaim.cropCycle && (
                      <View>
                        <Text className="text-gray-700 text-sm font-bold mb-3">
                          Crop Cycle Details
                        </Text>
                        <View className="bg-gray-50 rounded-lg p-4">
                          <Text className="text-gray-600 text-xs mb-1">
                            Current Cycle
                          </Text>
                          <Text className="text-gray-900 text-sm font-semibold">
                            {selectedClaim.cropCycle}
                          </Text>
                        </View>
                      </View>
                    )}

                    {selectedClaim.weatherTrigger && (
                      <View>
                        <Text className="text-gray-700 text-sm font-bold mb-3">
                          Weather Trigger Logs
                        </Text>
                        <View className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                          <Text className="text-orange-700 text-sm font-semibold mb-2">
                            {selectedClaim.weatherTrigger.event}
                          </Text>
                          <View className="gap-2">
                            <View className="flex-row items-center justify-between">
                              <Text className="text-orange-700 text-xs">
                                Date:
                              </Text>
                              <Text className="text-orange-700 text-xs font-semibold">
                                {formatDate(selectedClaim.weatherTrigger.date)}
                              </Text>
                            </View>
                            <View className="flex-row items-center justify-between">
                              <Text className="text-orange-700 text-xs">
                                Rainfall:
                              </Text>
                              <Text className="text-orange-700 text-xs font-semibold">
                                {selectedClaim.weatherTrigger.rainfallDepth}mm
                              </Text>
                            </View>
                            <View className="flex-row items-center justify-between">
                              <Text className="text-orange-700 text-xs">
                                Severity:
                              </Text>
                              <Text className="text-orange-700 text-xs font-semibold">
                                {selectedClaim.weatherTrigger.severity}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    )}

                    <View>
                      <Text className="text-gray-700 text-sm font-bold mb-3">
                        Supporting Documents
                      </Text>
                      <View className="gap-2">
                        {selectedClaim.documents.map((doc, index) => (
                          <View
                            key={index}
                            className="flex-row items-center justify-between bg-gray-50 rounded-lg p-3"
                          >
                            <Text className="text-gray-900 text-sm flex-1">
                              {doc.name}
                            </Text>
                            <View
                              className={`px-2 py-1 rounded-full ${
                                doc.status === "verified"
                                  ? "bg-green-100"
                                  : doc.status === "pending"
                                  ? "bg-yellow-100"
                                  : "bg-red-100"
                              }`}
                            >
                              <Text
                                className={`text-xs font-semibold ${
                                  doc.status === "verified"
                                    ? "text-green-700"
                                    : doc.status === "pending"
                                    ? "text-yellow-700"
                                    : "text-red-700"
                                }`}
                              >
                                {doc.status}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>

                    {selectedClaim.flagReason && (
                      <View className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                        <View className="flex-row items-center gap-2 mb-2">
                          <AlertTriangle color="#ea580c" size={18} />
                          <Text className="text-orange-700 text-sm font-bold">
                            Flagged Claim
                          </Text>
                        </View>
                        <Text className="text-orange-700 text-sm">
                          {selectedClaim.flagReason}
                        </Text>
                      </View>
                    )}

                    <View>
                      <Text className="text-gray-700 text-sm font-bold mb-3">
                        Decision Panel
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
                          onPress={() => setShowRejectModal(true)}
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
                            Request Additional Info
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <View className="flex-row items-center gap-2 mb-2">
                        <Shield color="#2563eb" size={18} />
                        <Text className="text-blue-700 text-sm font-bold">
                          Blockchain Transaction Preview
                        </Text>
                      </View>
                      <Text className="text-blue-700 text-xs">
                        Approving this claim will initiate an on-chain
                        transaction. The subsidy amount will be recorded
                        immutably on the blockchain.
                      </Text>
                      <Text className="text-blue-700 text-xs font-mono mt-2">
                        TX Hash: 0x{selectedClaim.id}...pending
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showRejectModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-white rounded-2xl p-6 max-w-md w-full">
            <Text className="text-gray-900 text-xl font-bold mb-4">
              Reject Claim
            </Text>
            <Text className="text-gray-600 text-sm mb-4">
              Please provide a reason for rejecting this claim. This will be
              sent to the farmer.
            </Text>

            <TextInput
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="Enter rejection reason..."
              multiline
              numberOfLines={4}
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm mb-4"
              placeholderTextColor="#9ca3af"
              style={{ textAlignVertical: "top" }}
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
              >
                <Text className="text-gray-700 text-sm font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleReject}
                disabled={!rejectReason.trim()}
                className={`flex-1 rounded-lg py-3 items-center ${
                  rejectReason.trim() ? "bg-red-500" : "bg-gray-300"
                }`}
              >
                <Text className="text-white text-sm font-semibold">
                  Confirm Rejection
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
