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
  FileCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Download,
  MapPin,
  TrendingUp,
  FileText,
  Save,
  Shield,
  ExternalLink,
  Clock,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAgencyLayout } from "@/components/agency/layout/AgencyLayoutContext";

interface FarmDocument {
  id: string;
  name: string;
  type: string;
  status: "verified" | "pending" | "rejected" | "missing";
  uploadedDate: string;
  fileUrl?: string;
  verifiedBy?: string;
  verifiedDate?: string;
}

interface FarmRegistration {
  id: string;
  farmId: string;
  farmerName: string;
  farmerIC: string;
  farmerPhone: string;
  farmerEmail: string;
  size: number;
  cropType: string[];
  location: {
    state: string;
    district: string;
    address: string;
  };
  gps: {
    latitude: number;
    longitude: number;
  };
  certificationStatus: "pending" | "mygap" | "organic" | "none";
  documents: FarmDocument[];
  blockchainStatus: "pending" | "on-chain" | "failed";
  blockchainHash?: string;
  submittedDate: string;
  status: "pending_review" | "approved" | "rejected" | "docs_required";
  reviewNotes?: string;
}

const mockRegistrations: FarmRegistration[] = [
  {
    id: "1",
    farmId: "FARM-001",
    farmerName: "Mohd Faizal bin Ahmad",
    farmerIC: "850615-10-5432",
    farmerPhone: "+60123456789",
    farmerEmail: "faizal@email.com",
    size: 12.5,
    cropType: ["Paddy", "Vegetables"],
    location: {
      state: "Kedah",
      district: "Kubang Pasu",
      address: "Lot 123, Kampung Sungai Limau, 06100 Kodiang, Kedah",
    },
    gps: {
      latitude: 6.1234,
      longitude: 100.5678,
    },
    certificationStatus: "mygap",
    documents: [
      {
        id: "doc1",
        name: "Land Title Document",
        type: "land_title",
        status: "verified",
        uploadedDate: "2025-11-20",
        verifiedBy: "Officer Ahmad",
        verifiedDate: "2025-11-21",
      },
      {
        id: "doc2",
        name: "MyGAP Certificate",
        type: "mygap_cert",
        status: "verified",
        uploadedDate: "2025-11-20",
        verifiedBy: "Officer Ahmad",
        verifiedDate: "2025-11-21",
      },
      {
        id: "doc3",
        name: "Business Registration (SSM)",
        type: "business_reg",
        status: "pending",
        uploadedDate: "2025-11-20",
      },
      {
        id: "doc4",
        name: "Farmer ID Card",
        type: "farmer_id",
        status: "verified",
        uploadedDate: "2025-11-20",
        verifiedBy: "Officer Ahmad",
        verifiedDate: "2025-11-21",
      },
    ],
    blockchainStatus: "pending",
    submittedDate: "2025-11-20",
    status: "pending_review",
  },
  {
    id: "2",
    farmId: "FARM-045",
    farmerName: "Tan Mei Ling",
    farmerIC: "920308-14-6789",
    farmerPhone: "+60187654321",
    farmerEmail: "meiling@email.com",
    size: 8.0,
    cropType: ["Vegetables", "Herbs"],
    location: {
      state: "Pahang",
      district: "Cameron Highlands",
      address: "Jalan Besar, Tanah Rata, 39000 Cameron Highlands, Pahang",
    },
    gps: {
      latitude: 4.4672,
      longitude: 101.3786,
    },
    certificationStatus: "organic",
    documents: [
      {
        id: "doc5",
        name: "Land Title Document",
        type: "land_title",
        status: "verified",
        uploadedDate: "2025-11-18",
      },
      {
        id: "doc6",
        name: "Organic Certification",
        type: "organic_cert",
        status: "verified",
        uploadedDate: "2025-11-18",
      },
      {
        id: "doc7",
        name: "Business Registration (SSM)",
        type: "business_reg",
        status: "missing",
        uploadedDate: "2025-11-18",
      },
      {
        id: "doc8",
        name: "Farmer ID Card",
        type: "farmer_id",
        status: "verified",
        uploadedDate: "2025-11-18",
      },
    ],
    blockchainStatus: "pending",
    submittedDate: "2025-11-18",
    status: "docs_required",
  },
  {
    id: "3",
    farmId: "FARM-078",
    farmerName: "Kumar Selvam",
    farmerIC: "880722-12-3456",
    farmerPhone: "+60199876543",
    farmerEmail: "kumar@email.com",
    size: 15.0,
    cropType: ["Fruits", "Palm Oil"],
    location: {
      state: "Johor",
      district: "Kluang",
      address: "Jalan Plantation, 86000 Kluang, Johor",
    },
    gps: {
      latitude: 2.0333,
      longitude: 103.3167,
    },
    certificationStatus: "pending",
    documents: [
      {
        id: "doc9",
        name: "Land Title Document",
        type: "land_title",
        status: "verified",
        uploadedDate: "2025-11-15",
      },
      {
        id: "doc10",
        name: "MyGAP Certificate",
        type: "mygap_cert",
        status: "pending",
        uploadedDate: "2025-11-15",
      },
      {
        id: "doc11",
        name: "Business Registration (SSM)",
        type: "business_reg",
        status: "verified",
        uploadedDate: "2025-11-15",
      },
      {
        id: "doc12",
        name: "Farmer ID Card",
        type: "farmer_id",
        status: "verified",
        uploadedDate: "2025-11-15",
      },
    ],
    blockchainStatus: "on-chain",
    blockchainHash:
      "0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385",
    submittedDate: "2025-11-15",
    status: "approved",
  },
];

export default function FarmRegistrationReviewScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;
  useAgencyLayout({
    title: "Farm Registration Review",
    subtitle: "Validate and approve farm registrations",
  });

  const [registrations] = useState<FarmRegistration[]>(mockRegistrations);
  const [selectedRegistration, setSelectedRegistration] =
    useState<FarmRegistration | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [documentVerifications, setDocumentVerifications] = useState<
    Record<string, boolean>
  >({});

  const stats = {
    pendingReview: registrations.filter((r) => r.status === "pending_review")
      .length,
    approved: registrations.filter((r) => r.status === "approved").length,
    docsRequired: registrations.filter((r) => r.status === "docs_required")
      .length,
    onChain: registrations.filter((r) => r.blockchainStatus === "on-chain")
      .length,
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
      case "pending_review":
        return "bg-yellow-100 text-yellow-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "docs_required":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getDocStatusColor = (status: string) => {
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
  };

  const getBlockchainStatusColor = (status: string) => {
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
  };

  const getCertificationBadge = (cert: string) => {
    switch (cert) {
      case "mygap":
        return { label: "MyGAP", color: "bg-blue-100 text-blue-700" };
      case "organic":
        return { label: "Organic", color: "bg-green-100 text-green-700" };
      case "pending":
        return { label: "Pending", color: "bg-yellow-100 text-yellow-700" };
      default:
        return { label: "None", color: "bg-gray-100 text-gray-700" };
    }
  };

  const handleApprove = () => {
    console.log("Approving registration:", selectedRegistration?.farmId);
    setShowReviewModal(false);
    setSelectedRegistration(null);
  };

  const handleReject = () => {
    console.log(
      "Rejecting registration:",
      selectedRegistration?.farmId,
      "Reason:",
      rejectReason
    );
    setShowRejectModal(false);
    setShowReviewModal(false);
    setSelectedRegistration(null);
    setRejectReason("");
  };

  const handleRequestDocs = () => {
    console.log(
      "Requesting additional documents for:",
      selectedRegistration?.farmId
    );
    setShowReviewModal(false);
    setSelectedRegistration(null);
  };

  const handleSaveDraft = () => {
    console.log(
      "Saving draft review for:",
      selectedRegistration?.farmId,
      "Notes:",
      reviewNotes
    );
  };

  const toggleDocumentVerification = (docId: string) => {
    setDocumentVerifications((prev) => ({
      ...prev,
      [docId]: !prev[docId],
    }));
  };

  const SummaryCards = () => (
    <View className={isDesktop ? "flex-row gap-4 mb-6" : "gap-3 mb-6"}>
      <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-yellow-50 rounded-lg items-center justify-center">
            <Clock color="#b45309" size={20} />
          </View>
          <Text className="text-2xl font-bold text-gray-900">
            {stats.pendingReview}
          </Text>
        </View>
        <Text className="text-gray-600 text-sm font-medium">
          Pending Review
        </Text>
        <Text className="text-gray-500 text-xs mt-1">
          Awaiting verification
        </Text>
      </View>

      <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-green-50 rounded-lg items-center justify-center">
            <CheckCircle color="#15803d" size={20} />
          </View>
          <Text className="text-2xl font-bold text-gray-900">
            {stats.approved}
          </Text>
        </View>
        <Text className="text-gray-600 text-sm font-medium">Approved</Text>
        <Text className="text-gray-500 text-xs mt-1">
          Registration complete
        </Text>
      </View>

      <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-blue-50 rounded-lg items-center justify-center">
            <FileText color="#2563eb" size={20} />
          </View>
          <Text className="text-2xl font-bold text-gray-900">
            {stats.docsRequired}
          </Text>
        </View>
        <Text className="text-gray-600 text-sm font-medium">Docs Required</Text>
        <Text className="text-gray-500 text-xs mt-1">Incomplete</Text>
      </View>

      <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-emerald-50 rounded-lg items-center justify-center">
            <Shield color="#059669" size={20} />
          </View>
          <Text className="text-2xl font-bold text-gray-900">
            {stats.onChain}
          </Text>
        </View>
        <Text className="text-gray-600 text-sm font-medium">On Blockchain</Text>
        <Text className="text-gray-500 text-xs mt-1">Verified on-chain</Text>
      </View>
    </View>
  );

  const RegistrationCard = ({
    registration,
  }: {
    registration: FarmRegistration;
  }) => {
    const certBadge = getCertificationBadge(registration.certificationStatus);
    const verifiedDocs = registration.documents.filter(
      (d) => d.status === "verified"
    ).length;
    const totalDocs = registration.documents.length;

    return (
      <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-gray-900 text-base font-bold">
                {registration.farmId}
              </Text>
              <View className={`px-2 py-0.5 rounded-full ${certBadge.color}`}>
                <Text className="text-xs font-semibold">{certBadge.label}</Text>
              </View>
            </View>
            <Text className="text-gray-600 text-sm">
              {registration.farmerName}
            </Text>
            <Text className="text-gray-500 text-xs mt-1">
              {registration.location.state}
            </Text>
          </View>
          <View
            className={`flex-row items-center gap-1 px-3 py-1 rounded-full ${getStatusColor(
              registration.status
            )}`}
          >
            <Text className="text-xs font-semibold capitalize">
              {registration.status.replace("_", " ")}
            </Text>
          </View>
        </View>

        <View className="gap-2 mb-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 text-sm">Size</Text>
            <Text className="text-gray-900 text-sm font-medium">
              {registration.size} ha
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 text-sm">Crops</Text>
            <Text className="text-gray-900 text-sm font-medium">
              {registration.cropType.join(", ")}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 text-sm">Documents</Text>
            <Text
              className={`text-sm font-semibold ${
                verifiedDocs === totalDocs
                  ? "text-green-700"
                  : "text-yellow-700"
              }`}
            >
              {verifiedDocs}/{totalDocs} Verified
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 text-sm">Blockchain</Text>
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
          onPress={() => {
            setSelectedRegistration(registration);
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
            <Text className="text-white text-sm font-semibold">
              Review Registration
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  const RegistrationsTable = () => (
    <View className="bg-white rounded-xl border border-gray-200">
      <View className="flex-row border-b border-gray-200 px-6 py-4 bg-gray-50 rounded-t-xl">
        <Text className="w-28 text-gray-600 text-xs font-semibold">
          Farm ID
        </Text>
        <Text className="flex-1 text-gray-600 text-xs font-semibold">
          Farmer Name
        </Text>
        <Text className="w-24 text-gray-600 text-xs font-semibold">
          Size (ha)
        </Text>
        <Text className="w-32 text-gray-600 text-xs font-semibold">
          Crop Type
        </Text>
        <Text className="w-28 text-gray-600 text-xs font-semibold">
          Docs Status
        </Text>
        <Text className="w-32 text-gray-600 text-xs font-semibold">
          Blockchain
        </Text>
        <Text className="w-24 text-gray-600 text-xs font-semibold">Action</Text>
      </View>

      <ScrollView className="max-h-[600px]">
        {registrations.map((reg) => {
          const verifiedDocs = reg.documents.filter(
            (d) => d.status === "verified"
          ).length;
          const totalDocs = reg.documents.length;
          const certBadge = getCertificationBadge(reg.certificationStatus);

          return (
            <View
              key={reg.id}
              className="flex-row items-center px-6 py-4 border-b border-gray-100"
            >
              <View className="w-28">
                <Text className="text-gray-900 text-sm font-medium">
                  {reg.farmId}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 text-sm font-medium">
                  {reg.farmerName}
                </Text>
                <Text className="text-gray-500 text-xs mt-0.5">
                  {reg.location.state}
                </Text>
              </View>
              <Text className="w-24 text-gray-900 text-sm font-medium">
                {reg.size}
              </Text>
              <View className="w-32">
                <Text className="text-gray-700 text-xs">
                  {reg.cropType.join(", ")}
                </Text>
                <View
                  className={`px-2 py-0.5 rounded-full self-start mt-1 ${certBadge.color}`}
                >
                  <Text className="text-xs font-semibold">
                    {certBadge.label}
                  </Text>
                </View>
              </View>
              <View className="w-28">
                <Text
                  className={`text-sm font-semibold ${
                    verifiedDocs === totalDocs
                      ? "text-green-700"
                      : "text-yellow-700"
                  }`}
                >
                  {verifiedDocs}/{totalDocs}
                </Text>
                <Text className="text-gray-500 text-xs">Verified</Text>
              </View>
              <View className="w-32">
                <View
                  className={`px-2 py-1 rounded-full self-start ${getBlockchainStatusColor(
                    reg.blockchainStatus
                  )}`}
                >
                  <Text className="text-xs font-semibold capitalize">
                    {reg.blockchainStatus.replace("-", " ")}
                  </Text>
                </View>
              </View>
              <View className="w-24">
                <TouchableOpacity
                  onPress={() => {
                    setSelectedRegistration(reg);
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
          );
        })}
      </ScrollView>
    </View>
  );

  const pageContent = (
    <View className="px-6 py-6">
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-gray-900 text-xl font-bold">
            Farm Registration Review
          </Text>
          <Text className="text-gray-600 text-sm">
            Validate and approve farm registrations
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
        <RegistrationsTable />
      ) : (
        <View>
          {registrations.map((reg) => (
            <RegistrationCard key={reg.id} registration={reg} />
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
                    Review Farm Registration
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowReviewModal(false)}
                    className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                  >
                    <Text className="text-gray-600 text-lg">×</Text>
                  </TouchableOpacity>
                </View>

                {selectedRegistration && (
                  <View className="gap-6">
                    <View>
                      <Text className="text-gray-700 text-sm font-bold mb-3">
                        A. Farm Overview
                      </Text>
                      <View className="gap-3">
                        <View className="bg-gray-50 rounded-lg p-4">
                          <Text className="text-gray-600 text-xs mb-1">
                            Farm ID
                          </Text>
                          <Text className="text-gray-900 text-base font-bold">
                            {selectedRegistration.farmId}
                          </Text>
                        </View>

                        <View className="flex-row gap-3">
                          <View className="flex-1 bg-gray-50 rounded-lg p-4">
                            <Text className="text-gray-600 text-xs mb-1">
                              Farm Size
                            </Text>
                            <Text className="text-gray-900 text-lg font-bold">
                              {selectedRegistration.size} ha
                            </Text>
                          </View>
                          <View className="flex-1 bg-gray-50 rounded-lg p-4">
                            <Text className="text-gray-600 text-xs mb-1">
                              Certification
                            </Text>
                            <View
                              className={`px-2 py-1 rounded-full self-start mt-1 ${
                                getCertificationBadge(
                                  selectedRegistration.certificationStatus
                                ).color
                              }`}
                            >
                              <Text className="text-xs font-semibold">
                                {
                                  getCertificationBadge(
                                    selectedRegistration.certificationStatus
                                  ).label
                                }
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View className="bg-gray-50 rounded-lg p-4">
                          <Text className="text-gray-600 text-xs mb-1">
                            Crop Categories
                          </Text>
                          <View className="flex-row flex-wrap gap-2 mt-2">
                            {selectedRegistration.cropType.map(
                              (crop, index) => (
                                <View
                                  key={index}
                                  className="px-3 py-1 bg-green-100 rounded-full"
                                >
                                  <Text className="text-green-700 text-xs font-semibold">
                                    {crop}
                                  </Text>
                                </View>
                              )
                            )}
                          </View>
                        </View>

                        <View className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <View className="flex-row items-center gap-2 mb-3">
                            <MapPin color="#2563eb" size={18} />
                            <Text className="text-blue-700 text-sm font-bold">
                              GIS Map View
                            </Text>
                          </View>
                          <View className="bg-blue-100 rounded-lg h-32 items-center justify-center mb-3">
                            <Text className="text-blue-700 text-sm">
                              Map Visualization
                            </Text>
                          </View>
                          <View className="gap-2">
                            <View className="flex-row items-center justify-between">
                              <Text className="text-blue-700 text-xs">
                                GPS Coordinates:
                              </Text>
                              <Text className="text-blue-700 text-xs font-mono">
                                {selectedRegistration.gps.latitude},{" "}
                                {selectedRegistration.gps.longitude}
                              </Text>
                            </View>
                            <Text className="text-blue-700 text-xs">
                              {selectedRegistration.location.address}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View>
                      <Text className="text-gray-700 text-sm font-bold mb-3">
                        Farmer Information
                      </Text>
                      <View className="gap-3">
                        <View className="bg-gray-50 rounded-lg p-4">
                          <Text className="text-gray-600 text-xs mb-1">
                            Full Name
                          </Text>
                          <Text className="text-gray-900 text-sm font-semibold">
                            {selectedRegistration.farmerName}
                          </Text>
                        </View>

                        <View className="flex-row gap-3">
                          <View className="flex-1 bg-gray-50 rounded-lg p-4">
                            <Text className="text-gray-600 text-xs mb-1">
                              IC Number
                            </Text>
                            <Text className="text-gray-900 text-xs font-mono">
                              {selectedRegistration.farmerIC}
                            </Text>
                          </View>
                          <View className="flex-1 bg-gray-50 rounded-lg p-4">
                            <Text className="text-gray-600 text-xs mb-1">
                              Phone
                            </Text>
                            <Text className="text-gray-900 text-xs">
                              {selectedRegistration.farmerPhone}
                            </Text>
                          </View>
                        </View>

                        <View className="bg-gray-50 rounded-lg p-4">
                          <Text className="text-gray-600 text-xs mb-1">
                            Email
                          </Text>
                          <Text className="text-gray-900 text-sm">
                            {selectedRegistration.farmerEmail}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View>
                      <Text className="text-gray-700 text-sm font-bold mb-3">
                        B. Documentation Panel
                      </Text>
                      <View className="gap-2">
                        {selectedRegistration.documents.map((doc) => (
                          <View
                            key={doc.id}
                            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                          >
                            <View className="flex-row items-start justify-between mb-3">
                              <View className="flex-1">
                                <View className="w-16 h-16 bg-gray-200 rounded-lg mb-2 items-center justify-center">
                                  <FileText color="#6b7280" size={24} />
                                </View>
                                <Text className="text-gray-900 text-sm font-semibold">
                                  {doc.name}
                                </Text>
                                <Text className="text-gray-500 text-xs mt-1">
                                  Uploaded: {formatDate(doc.uploadedDate)}
                                </Text>
                                {doc.verifiedBy && (
                                  <Text className="text-gray-500 text-xs">
                                    Verified by: {doc.verifiedBy}
                                  </Text>
                                )}
                              </View>
                              <View
                                className={`px-2 py-1 rounded-full ${getDocStatusColor(
                                  doc.status
                                )}`}
                              >
                                <Text className="text-xs font-semibold capitalize">
                                  {doc.status}
                                </Text>
                              </View>
                            </View>

                            <View className="flex-row gap-2">
                              <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 bg-blue-100 border border-blue-200 rounded-lg py-2">
                                <Eye color="#2563eb" size={16} />
                                <Text className="text-blue-700 text-xs font-semibold">
                                  View
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 bg-gray-100 border border-gray-200 rounded-lg py-2">
                                <Download color="#6b7280" size={16} />
                                <Text className="text-gray-700 text-xs font-semibold">
                                  Download
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() =>
                                  toggleDocumentVerification(doc.id)
                                }
                                className={`flex-1 flex-row items-center justify-center gap-2 rounded-lg py-2 ${
                                  documentVerifications[doc.id]
                                    ? "bg-green-100 border border-green-200"
                                    : "bg-gray-100 border border-gray-200"
                                }`}
                              >
                                <CheckCircle
                                  color={
                                    documentVerifications[doc.id]
                                      ? "#15803d"
                                      : "#6b7280"
                                  }
                                  size={16}
                                />
                                <Text
                                  className={`text-xs font-semibold ${
                                    documentVerifications[doc.id]
                                      ? "text-green-700"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {documentVerifications[doc.id]
                                    ? "Verified"
                                    : "Verify"}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>

                    <View>
                      <Text className="text-gray-700 text-sm font-bold mb-3">
                        C. Blockchain Record Preview
                      </Text>
                      <View
                        className={`rounded-lg p-4 border ${
                          selectedRegistration.blockchainStatus === "on-chain"
                            ? "bg-green-50 border-green-200"
                            : "bg-yellow-50 border-yellow-200"
                        }`}
                      >
                        <View className="flex-row items-center gap-2 mb-3">
                          <Shield
                            color={
                              selectedRegistration.blockchainStatus ===
                              "on-chain"
                                ? "#15803d"
                                : "#b45309"
                            }
                            size={18}
                          />
                          <Text
                            className={`text-sm font-bold ${
                              selectedRegistration.blockchainStatus ===
                              "on-chain"
                                ? "text-green-700"
                                : "text-yellow-700"
                            }`}
                          >
                            Blockchain Status:{" "}
                            {selectedRegistration.blockchainStatus
                              .replace("-", " ")
                              .toUpperCase()}
                          </Text>
                        </View>

                        {selectedRegistration.blockchainHash ? (
                          <>
                            <View className="gap-2 mb-3">
                              <View className="flex-row items-center justify-between">
                                <Text
                                  className={
                                    selectedRegistration.blockchainStatus ===
                                    "on-chain"
                                      ? "text-green-700 text-xs"
                                      : "text-yellow-700 text-xs"
                                  }
                                >
                                  Transaction Hash:
                                </Text>
                                <TouchableOpacity>
                                  <ExternalLink
                                    color={
                                      selectedRegistration.blockchainStatus ===
                                      "on-chain"
                                        ? "#15803d"
                                        : "#b45309"
                                    }
                                    size={14}
                                  />
                                </TouchableOpacity>
                              </View>
                              <Text
                                className={`text-xs font-mono ${
                                  selectedRegistration.blockchainStatus ===
                                  "on-chain"
                                    ? "text-green-700"
                                    : "text-yellow-700"
                                }`}
                              >
                                {selectedRegistration.blockchainHash}
                              </Text>
                            </View>
                            <View className="flex-row items-center justify-between mb-2">
                              <Text
                                className={
                                  selectedRegistration.blockchainStatus ===
                                  "on-chain"
                                    ? "text-green-700 text-xs"
                                    : "text-yellow-700 text-xs"
                                }
                              >
                                Timestamp:
                              </Text>
                              <Text
                                className={`text-xs font-semibold ${
                                  selectedRegistration.blockchainStatus ===
                                  "on-chain"
                                    ? "text-green-700"
                                    : "text-yellow-700"
                                }`}
                              >
                                {formatDate(selectedRegistration.submittedDate)}
                              </Text>
                            </View>
                            <View
                              className="border-t pt-2 mt-2"
                              style={{
                                borderColor:
                                  selectedRegistration.blockchainStatus ===
                                  "on-chain"
                                    ? "#86efac"
                                    : "#fde047",
                              }}
                            >
                              <Text
                                className={`text-xs ${
                                  selectedRegistration.blockchainStatus ===
                                  "on-chain"
                                    ? "text-green-700"
                                    : "text-yellow-700"
                                }`}
                              >
                                Merkle Proof: Available
                              </Text>
                            </View>
                          </>
                        ) : (
                          <View className="gap-2">
                            <Text className="text-yellow-700 text-xs font-semibold mb-1">
                              Pending Actions:
                            </Text>
                            <Text className="text-yellow-700 text-xs">
                              • Awaiting officer approval
                            </Text>
                            <Text className="text-yellow-700 text-xs">
                              • Blockchain transaction will be initiated upon
                              approval
                            </Text>
                            <Text className="text-yellow-700 text-xs mt-2">
                              Merkle Proof: Will be generated after on-chain
                              confirmation
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View>
                      <Text className="text-gray-700 text-sm font-bold mb-3">
                        Review Notes (Optional)
                      </Text>
                      <TextInput
                        value={reviewNotes}
                        onChangeText={setReviewNotes}
                        placeholder="Add internal notes about this registration..."
                        multiline
                        numberOfLines={3}
                        className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                        placeholderTextColor="#9ca3af"
                        style={{ textAlignVertical: "top" }}
                      />
                    </View>

                    <View>
                      <Text className="text-gray-700 text-sm font-bold mb-3">
                        D. Officer Decision Panel
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
                          onPress={() => setShowRejectModal(true)}
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
              Reject Registration
            </Text>
            <Text className="text-gray-600 text-sm mb-4">
              Please provide a reason for rejecting this farm registration. This
              will be sent to the farmer.
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
