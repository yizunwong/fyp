import { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";
import {
  DollarSign,
  CircleCheck as CheckCircle,
  Clock,
  Circle as XCircle,
  Plus,
  Eye,
  FileText,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useFarmerLayout } from "@/components/farmer/layout/FarmerLayoutContext";
import { formatDate } from '@/components/farmer/farm-produce/utils';

interface Subsidy {
  id: string;
  programName: string;
  applicationDate: string;
  amount: number;
  status: "approved" | "pending" | "rejected";
  description: string;
  farmName: string;
  produceBatch?: string;
  approvalDate?: string;
  paymentStatus?: "paid" | "processing" | "pending";
  referenceId: string;
}

interface SubsidyProgram {
  id: string;
  name: string;
  description: string;
  maxAmount: number;
}

const mockSubsidies: Subsidy[] = [
  {
    id: "1",
    programName: "Paddy Fertilizer Aid 2025",
    applicationDate: "2025-10-01",
    amount: 2500,
    status: "approved",
    description:
      "Financial assistance for purchasing organic fertilizers for paddy cultivation",
    farmName: "Green Valley Farm",
    produceBatch: "FARM-BCH-0017",
    approvalDate: "2025-10-05",
    paymentStatus: "paid",
    referenceId: "SUB-2025-0017",
  },
  {
    id: "2",
    programName: "Organic Farming Support Grant",
    applicationDate: "2025-10-08",
    amount: 3500,
    status: "pending",
    description:
      "Support grant for farmers transitioning to organic farming practices",
    farmName: "Green Valley Farm",
    produceBatch: "FARM-BCH-0016",
    paymentStatus: "pending",
    referenceId: "SUB-2025-0024",
  },
  {
    id: "3",
    programName: "Smart Farming Technology Subsidy",
    applicationDate: "2025-09-20",
    amount: 5000,
    status: "approved",
    description: "Subsidy for adopting IoT and smart farming technologies",
    farmName: "Green Valley Farm",
    produceBatch: "FARM-BCH-0015",
    approvalDate: "2025-09-25",
    paymentStatus: "processing",
    referenceId: "SUB-2025-0012",
  },
  {
    id: "4",
    programName: "Crop Insurance Support",
    applicationDate: "2025-09-10",
    amount: 1800,
    status: "rejected",
    description: "Subsidized crop insurance for rice farmers",
    farmName: "Green Valley Farm",
    produceBatch: "FARM-BCH-0014",
    referenceId: "SUB-2025-0008",
  },
  {
    id: "5",
    programName: "Irrigation Modernization Grant",
    applicationDate: "2025-08-15",
    amount: 4200,
    status: "approved",
    description: "Grant for upgrading irrigation systems and water management",
    farmName: "Green Valley Farm",
    produceBatch: "FARM-BCH-0012",
    approvalDate: "2025-08-22",
    paymentStatus: "paid",
    referenceId: "SUB-2025-0003",
  },
];

const availablePrograms: SubsidyProgram[] = [
  {
    id: "1",
    name: "Paddy Fertilizer Aid 2025",
    description: "Financial assistance for purchasing organic fertilizers",
    maxAmount: 3000,
  },
  {
    id: "2",
    name: "Organic Farming Support Grant",
    description: "Support grant for organic farming transition",
    maxAmount: 5000,
  },
  {
    id: "3",
    name: "Smart Farming Technology Subsidy",
    description: "Subsidy for IoT and smart farming tech",
    maxAmount: 7000,
  },
  {
    id: "4",
    name: "Crop Insurance Support",
    description: "Subsidized crop insurance",
    maxAmount: 2500,
  },
];

const verifiedProduceBatches = [
  { id: "1", batchId: "FARM-BCH-0017", name: "Beras Wangi" },
  { id: "2", batchId: "FARM-BCH-0016", name: "Organic Tomatoes" },
  { id: "4", batchId: "FARM-BCH-0014", name: "Fresh Carrots" },
  { id: "6", batchId: "FARM-BCH-0012", name: "Organic Lettuce" },
];

export default function SubsidyManagementScreen() {
  const { isDesktop } = useResponsiveLayout();

  const [subsidies] = useState<Subsidy[]>(mockSubsidies);
  const [selectedSubsidy, setSelectedSubsidy] = useState<Subsidy | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newReferenceId, setNewReferenceId] = useState("");

  const [formData, setFormData] = useState({
    programId: "",
    produceBatchId: "",
    remarks: "",
  });
  const openApplyModal = useCallback(() => setShowApplyModal(true), []);
  const closeApplyModal = useCallback(() => setShowApplyModal(false), []);

  const stats = {
    total: subsidies.length,
    approved: subsidies.filter((s) => s.status === "approved").length,
    pending: subsidies.filter((s) => s.status === "pending").length,
    rejected: subsidies.filter((s) => s.status === "rejected").length,
    totalAmount: subsidies
      .filter((s) => s.status === "approved")
      .reduce((sum, s) => sum + s.amount, 0),
  };


  const formatCurrency = (amount: number) => {
    return `RM ${amount.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "rejected":
        return "bg-red-100 text-red-700";
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
      default:
        return null;
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "pending":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleViewDetails = (subsidy: Subsidy) => {
    setSelectedSubsidy(subsidy);
    setShowDetailsModal(true);
  };

  const handleApplySubmit = () => {
    if (!formData.programId || !formData.produceBatchId) {
      return;
    }

    const refId = `SUB-2025-${String(Math.floor(Math.random() * 9999)).padStart(
      4,
      "0"
    )}`;
    setNewReferenceId(refId);
    closeApplyModal();
    setShowSuccessModal(true);

    setTimeout(() => {
      setShowSuccessModal(false);
      setFormData({ programId: "", produceBatchId: "", remarks: "" });
    }, 3000);
  };

  const StatsCards = () => {
    if (isDesktop) {
      return (
        <View className="gap-3 mb-6 flex-row">
          <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
            <View className="items-center">
              <View className="w-12 h-12 bg-emerald-50 rounded-full items-center justify-center mb-2">
                <FileText color="#059669" size={24} />
              </View>
              <Text className="text-gray-600 text-xs font-semibold mb-1">
                Total Applied
              </Text>
              <Text className="text-gray-900 text-2xl font-bold">
                {stats.total}
              </Text>
            </View>
          </View>

          <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
            <View className="items-center">
              <View className="w-12 h-12 bg-green-50 rounded-full items-center justify-center mb-2">
                <CheckCircle color="#15803d" size={24} />
              </View>
              <Text className="text-gray-600 text-xs font-semibold mb-1">
                Approved
              </Text>
              <Text className="text-gray-900 text-2xl font-bold">
                {stats.approved}
              </Text>
            </View>
          </View>

          <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
            <View className="items-center">
              <View className="w-12 h-12 bg-yellow-50 rounded-full items-center justify-center mb-2">
                <Clock color="#b45309" size={24} />
              </View>
              <Text className="text-gray-600 text-xs font-semibold mb-1">
                Pending
              </Text>
              <Text className="text-gray-900 text-2xl font-bold">
                {stats.pending}
              </Text>
            </View>
          </View>

          <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
            <View className="items-center">
              <View className="w-12 h-12 bg-red-50 rounded-full items-center justify-center mb-2">
                <XCircle color="#dc2626" size={24} />
              </View>
              <Text className="text-gray-600 text-xs font-semibold mb-1">
                Rejected
              </Text>
              <Text className="text-gray-900 text-2xl font-bold">
                {stats.rejected}
              </Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-6 -mx-6 px-6"
      >
        <View className="flex-row gap-3">
          <View className="bg-white rounded-xl p-4 border border-gray-200 w-32">
            <View className="items-center">
              <View className="w-10 h-10 bg-emerald-50 rounded-full items-center justify-center mb-2">
                <FileText color="#059669" size={20} />
              </View>
              <Text className="text-gray-600 text-[10px] font-semibold mb-1">
                Total Applied
              </Text>
              <Text className="text-gray-900 text-xl font-bold">
                {stats.total}
              </Text>
            </View>
          </View>

          <View className="bg-white rounded-xl p-4 border border-gray-200 w-32">
            <View className="items-center">
              <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center mb-2">
                <CheckCircle color="#15803d" size={20} />
              </View>
              <Text className="text-gray-600 text-[10px] font-semibold mb-1">
                Approved
              </Text>
              <Text className="text-gray-900 text-xl font-bold">
                {stats.approved}
              </Text>
            </View>
          </View>

          <View className="bg-white rounded-xl p-4 border border-gray-200 w-32">
            <View className="items-center">
              <View className="w-10 h-10 bg-yellow-50 rounded-full items-center justify-center mb-2">
                <Clock color="#b45309" size={20} />
              </View>
              <Text className="text-gray-600 text-[10px] font-semibold mb-1">
                Pending
              </Text>
              <Text className="text-gray-900 text-xl font-bold">
                {stats.pending}
              </Text>
            </View>
          </View>

          <View className="bg-white rounded-xl p-4 border border-gray-200 w-32">
            <View className="items-center">
              <View className="w-10 h-10 bg-red-50 rounded-full items-center justify-center mb-2">
                <XCircle color="#dc2626" size={20} />
              </View>
              <Text className="text-gray-600 text-[10px] font-semibold mb-1">
                Rejected
              </Text>
              <Text className="text-gray-900 text-xl font-bold">
                {stats.rejected}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  const TotalAmountCard = () => (
    <LinearGradient
      colors={["#22c55e", "#059669"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="rounded-xl p-6 mb-6"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-white/90 text-sm font-semibold mb-1">
            Total Subsidies Received
          </Text>
          <Text className="text-white text-3xl font-bold">
            {formatCurrency(stats.totalAmount)}
          </Text>
        </View>
        <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center">
          <DollarSign color="#fff" size={32} />
        </View>
      </View>
    </LinearGradient>
  );

  const SubsidyCard = ({ subsidy }: { subsidy: Subsidy }) => (
    <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-gray-900 text-base font-bold mb-1">
            {subsidy.programName}
          </Text>
          <Text className="text-gray-500 text-xs">
            Ref: {subsidy.referenceId}
          </Text>
        </View>
        <View
          className={`flex-row items-center gap-1 px-3 py-1 rounded-full ${getStatusColor(
            subsidy.status
          )}`}
        >
          {getStatusIcon(subsidy.status)}
          <Text className="text-xs font-semibold capitalize">
            {subsidy.status}
          </Text>
        </View>
      </View>

      <View className="gap-2 mb-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">Application Date</Text>
          <Text className="text-gray-900 text-sm font-medium">
            {formatDate(subsidy.applicationDate)}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">Amount</Text>
          <Text className="text-gray-900 text-sm font-bold">
            {formatCurrency(subsidy.amount)}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">Farm</Text>
          <Text className="text-gray-900 text-sm font-medium">
            {subsidy.farmName}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => handleViewDetails(subsidy)}
        className="flex-row items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg py-2"
      >
        <Eye color="#059669" size={18} />
        <Text className="text-emerald-700 text-sm font-semibold">
          View Details
        </Text>
      </TouchableOpacity>
    </View>
  );

  const SubsidiesTable = () => (
    <View className="bg-white rounded-xl p-6 border border-gray-200">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-gray-900 text-lg font-bold">
          Active Subsidies
        </Text>
        <TouchableOpacity
          onPress={openApplyModal}
          className="rounded-lg overflow-hidden"
        >
          <LinearGradient
            colors={["#22c55e", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-row items-center gap-2 px-4 py-2"
          >
            <Plus color="#fff" size={18} />
            <Text className="text-white text-sm font-semibold">Apply Now</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View className="flex-row border-b border-gray-200 pb-3 mb-3">
        <Text className="flex-1 text-gray-600 text-xs font-semibold">
          Program Name
        </Text>
        <Text className="w-28 text-gray-600 text-xs font-semibold">
          Applied Date
        </Text>
        <Text className="w-24 text-gray-600 text-xs font-semibold">Amount</Text>
        <Text className="w-24 text-gray-600 text-xs font-semibold">Status</Text>
        <Text className="w-20 text-gray-600 text-xs font-semibold">Action</Text>
      </View>

      <ScrollView className="max-h-[400px]">
        {subsidies.map((subsidy) => (
          <View
            key={subsidy.id}
            className="flex-row items-center py-3 border-b border-gray-100"
          >
            <View className="flex-1">
              <Text className="text-gray-900 text-sm font-medium">
                {subsidy.programName}
              </Text>
              <Text className="text-gray-500 text-xs mt-0.5">
                Ref: {subsidy.referenceId}
              </Text>
            </View>
            <Text className="w-28 text-gray-700 text-sm">
              {formatDate(subsidy.applicationDate)}
            </Text>
            <Text className="w-24 text-gray-900 text-sm font-semibold">
              {formatCurrency(subsidy.amount)}
            </Text>
            <View className="w-24">
              <View
                className={`flex-row items-center gap-1 px-2 py-1 rounded-full self-start ${getStatusColor(
                  subsidy.status
                )}`}
              >
                {getStatusIcon(subsidy.status)}
                <Text className="text-xs font-semibold capitalize">
                  {subsidy.status}
                </Text>
              </View>
            </View>
            <View className="w-20">
              <TouchableOpacity
                onPress={() => handleViewDetails(subsidy)}
                className="flex-row items-center justify-center gap-1 bg-emerald-50 border border-emerald-200 rounded-lg py-1.5 px-2"
              >
                <Eye color="#059669" size={14} />
                <Text className="text-emerald-700 text-xs font-semibold">
                  View
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
      <StatsCards />
      <TotalAmountCard />

      {isDesktop ? (
        <SubsidiesTable />
      ) : (
        <View>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-900 text-lg font-bold">
              Active Subsidies
            </Text>
            <TouchableOpacity
              onPress={openApplyModal}
              className="rounded-lg overflow-hidden"
            >
              <LinearGradient
                colors={["#22c55e", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="flex-row items-center gap-2 px-4 py-2"
              >
                <Plus color="#fff" size={18} />
                <Text className="text-white text-sm font-semibold">
                  Apply Now
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {subsidies.map((subsidy) => (
            <SubsidyCard key={subsidy.id} subsidy={subsidy} />
          ))}
        </View>
      )}
    </View>
  );

  const desktopActionButton = useMemo(
    () => (
      <TouchableOpacity
        onPress={openApplyModal}
        className="rounded-lg overflow-hidden"
      >
        <LinearGradient
          colors={["#22c55e", "#059669"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex-row items-center gap-2 px-5 py-3"
        >
          <Plus color="#fff" size={20} />
          <Text className="text-white text-[15px] font-semibold">
            Apply for Subsidy
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    ),
    [openApplyModal]
  );

  const layoutMeta = useMemo(
    () => ({
      title: "Subsidy Management",
      subtitle: "Track and apply for farming subsidies securely",
      rightHeaderButton: isDesktop ? desktopActionButton : undefined,
      mobile: {
        contentContainerStyle: {
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 32,
        },
      },
    }),
    [desktopActionButton, isDesktop]
  );

  useFarmerLayout(layoutMeta);

  return (
    <>
      {pageContent}

      <Modal visible={showDetailsModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 text-xl font-bold">
                Subsidy Details
              </Text>
              <TouchableOpacity
                onPress={() => setShowDetailsModal(false)}
                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
              >
                <Text className="text-gray-600 text-lg">├ù</Text>
              </TouchableOpacity>
            </View>

            {selectedSubsidy && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="gap-4">
                  <View className="bg-gray-50 rounded-lg p-4">
                    <Text className="text-gray-600 text-xs mb-1">
                      Program Name
                    </Text>
                    <Text className="text-gray-900 text-[15px] font-semibold">
                      {selectedSubsidy.programName}
                    </Text>
                  </View>

                  <View className="bg-gray-50 rounded-lg p-4">
                    <Text className="text-gray-600 text-xs mb-1">
                      Reference ID
                    </Text>
                    <Text className="text-gray-900 text-[15px] font-medium">
                      {selectedSubsidy.referenceId}
                    </Text>
                  </View>

                  <View className="flex-row gap-3">
                    <View className="flex-1 bg-gray-50 rounded-lg p-4">
                      <Text className="text-gray-600 text-xs mb-1">Amount</Text>
                      <Text className="text-gray-900 text-[15px] font-bold">
                        {formatCurrency(selectedSubsidy.amount)}
                      </Text>
                    </View>
                    <View className="flex-1 bg-gray-50 rounded-lg p-4">
                      <Text className="text-gray-600 text-xs mb-1">Status</Text>
                      <View
                        className={`flex-row items-center gap-1 px-2 py-1 rounded-full self-start ${getStatusColor(
                          selectedSubsidy.status
                        )}`}
                      >
                        {getStatusIcon(selectedSubsidy.status)}
                        <Text className="text-xs font-semibold capitalize">
                          {selectedSubsidy.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="bg-gray-50 rounded-lg p-4">
                    <Text className="text-gray-600 text-xs mb-1">Farm</Text>
                    <Text className="text-gray-900 text-[15px] font-medium">
                      {selectedSubsidy.farmName}
                    </Text>
                  </View>

                  {selectedSubsidy.produceBatch && (
                    <View className="bg-gray-50 rounded-lg p-4">
                      <Text className="text-gray-600 text-xs mb-1">
                        Produce Batch
                      </Text>
                      <Text className="text-gray-900 text-[15px] font-medium">
                        {selectedSubsidy.produceBatch}
                      </Text>
                    </View>
                  )}

                  <View className="bg-gray-50 rounded-lg p-4">
                    <Text className="text-gray-600 text-xs mb-1">
                      Application Date
                    </Text>
                    <Text className="text-gray-900 text-[15px] font-medium">
                      {formatDate(selectedSubsidy.applicationDate)}
                    </Text>
                  </View>

                  {selectedSubsidy.approvalDate && (
                    <View className="bg-gray-50 rounded-lg p-4">
                      <Text className="text-gray-600 text-xs mb-1">
                        Approval Date
                      </Text>
                      <Text className="text-gray-900 text-[15px] font-medium">
                        {formatDate(selectedSubsidy.approvalDate)}
                      </Text>
                    </View>
                  )}

                  {selectedSubsidy.paymentStatus && (
                    <View className="bg-gray-50 rounded-lg p-4">
                      <Text className="text-gray-600 text-xs mb-1">
                        Payment Status
                      </Text>
                      <Text
                        className={`text-xs font-semibold capitalize px-3 py-1 rounded-full self-start ${getPaymentStatusColor(
                          selectedSubsidy.paymentStatus
                        )}`}
                      >
                        {selectedSubsidy.paymentStatus}
                      </Text>
                    </View>
                  )}

                  <View className="bg-gray-50 rounded-lg p-4">
                    <Text className="text-gray-600 text-xs mb-1">
                      Description
                    </Text>
                    <Text className="text-gray-900 text-sm">
                      {selectedSubsidy.description}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showApplyModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 text-xl font-bold">
                Apply for Subsidy
              </Text>
              <TouchableOpacity
                onPress={closeApplyModal}
                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
              >
                <Text className="text-gray-600 text-lg">├ù</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-4">
                <View>
                  <Text className="text-gray-700 text-sm font-semibold mb-2">
                    Select Program *
                  </Text>
                  <View className="gap-2">
                    {availablePrograms.map((program) => (
                      <TouchableOpacity
                        key={program.id}
                        onPress={() =>
                          setFormData({ ...formData, programId: program.id })
                        }
                        className={`border rounded-lg p-3 ${
                          formData.programId === program.id
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        <Text
                          className={`text-sm font-semibold mb-1 ${
                            formData.programId === program.id
                              ? "text-emerald-700"
                              : "text-gray-900"
                          }`}
                        >
                          {program.name}
                        </Text>
                        <Text className="text-gray-600 text-xs mb-1">
                          {program.description}
                        </Text>
                        <Text className="text-gray-500 text-xs">
                          Max: {formatCurrency(program.maxAmount)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View>
                  <Text className="text-gray-700 text-sm font-semibold mb-2">
                    Select Produce Batch *
                  </Text>
                  <Text className="text-gray-500 text-xs mb-2">
                    Only verified produce batches are eligible
                  </Text>
                  <View className="gap-2">
                    {verifiedProduceBatches.map((batch) => (
                      <TouchableOpacity
                        key={batch.id}
                        onPress={() =>
                          setFormData({ ...formData, produceBatchId: batch.id })
                        }
                        className={`border rounded-lg p-3 ${
                          formData.produceBatchId === batch.id
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            formData.produceBatchId === batch.id
                              ? "text-emerald-700"
                              : "text-gray-900"
                          }`}
                        >
                          {batch.batchId}
                        </Text>
                        <Text className="text-gray-600 text-xs">
                          {batch.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View>
                  <Text className="text-gray-700 text-sm font-semibold mb-2">
                    Remarks (Optional)
                  </Text>
                  <TextInput
                    value={formData.remarks}
                    onChangeText={(text) =>
                      setFormData({ ...formData, remarks: text })
                    }
                    placeholder="Add any additional notes..."
                    multiline
                    numberOfLines={4}
                    className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                    placeholderTextColor="#9ca3af"
                    style={{ textAlignVertical: "top" }}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleApplySubmit}
                  disabled={!formData.programId || !formData.produceBatchId}
                  className="rounded-lg overflow-hidden mt-2"
                >
                  <LinearGradient
                    colors={
                      formData.programId && formData.produceBatchId
                        ? ["#22c55e", "#059669"]
                        : ["#9ca3af", "#6b7280"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="py-3 items-center"
                  >
                    <Text className="text-white text-[15px] font-semibold">
                      Submit Application
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-white rounded-2xl p-8 items-center max-w-sm w-full">
            <View className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-4">
              <CheckCircle color="#059669" size={40} />
            </View>
            <Text className="text-gray-900 text-xl font-bold mb-2 text-center">
              Application Submitted Successfully!
            </Text>
            <Text className="text-gray-600 text-sm text-center mb-4">
              Your subsidy application has been received
            </Text>
            <View className="bg-gray-100 rounded-lg p-3 w-full">
              <Text className="text-gray-600 text-xs text-center mb-1">
                Reference ID
              </Text>
              <Text className="text-gray-900 text-[15px] font-bold text-center">
                {newReferenceId}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
