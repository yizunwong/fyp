import { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import {
  ArrowLeft,
  Search,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  QrCode,
  Eye,
  Package,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import QRModal from "@/components/ui/QRModel";
import FarmerLayout from "@/components/ui/FarmerLayout";
import { useProduceQuery } from "@/hooks/useProduce";
import { useFarmsQuery } from "@/hooks/useFarm";
import { ProduceListResponseDto, useAuthControllerProfile } from "@/api";
import { DropDownInput, DropdownItem, dropdownMenuContentStyle } from '@/components/ui/DropDownInput';
import { Dropdown } from 'react-native-paper-dropdown';

interface Farm {
  id: string;
  name: string;
}

export default function ProduceManagementScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFarm, setSelectedFarm] = useState<string>("all");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [selectedBatch, setSelectedBatch] =
    useState<ProduceListResponseDto | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { data: profileData } = useAuthControllerProfile();
  const farmerId = profileData?.data?.id;

  // ✅ Fetch data from backend hooks
  const {
    data: produceData,
    isLoading: isProducing,
    error: produceError,
  } = useProduceQuery(farmerId || "");

  const {
    data: farmsData,
    isLoading: isFarming,
    error: farmError,
  } = useFarmsQuery(farmerId || "");

  const farms: Farm[] = farmsData?.data || [];
  const produceBatches = useMemo<ProduceListResponseDto[]>(
    () => produceData?.data || [],
    [produceData?.data]
  );

  // ✅ Derived filtered list
  const filteredBatches = useMemo(() => {
    if (!produceBatches) return [];

    let filtered = [...produceBatches];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (batch) =>
          batch.batchId.toLowerCase().includes(query) ||
          batch.name.toLowerCase().includes(query)
      );
    }

    if (selectedFarm !== "all") {
      filtered = filtered.filter((batch) => batch.farmId === selectedFarm);
    }

    if (showVerifiedOnly) {
      filtered = filtered.filter((batch) => batch.name === "verified");
    }

    return filtered;
  }, [produceBatches, searchQuery, selectedFarm, showVerifiedOnly]);

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
      case "verified":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle color="#15803d" size={16} />;
      case "pending":
        return <Clock color="#b45309" size={16} />;
      case "failed":
        return <XCircle color="#dc2626" size={16} />;
      default:
        return null;
    }
  };

  const handleViewQR = (batch: ProduceListResponseDto) => {
    setSelectedBatch(batch);
    setShowQRModal(true);
  };

  const handleViewDetails = (batch: ProduceListResponseDto) => {
    setSelectedBatch(batch);
    setShowDetailsModal(true);
  };

  // ==============================
  // HEADER COMPONENT
  // ==============================
  const Header = () => (
    <View className="overflow-hidden">
      <LinearGradient
        colors={["#22c55e", "#059669"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 py-8 pb-12"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center mb-6"
        >
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <View className="flex-row items-center gap-3 mb-2">
          <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
            <Package color="#fff" size={24} />
          </View>
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold">
              My Produce Batches
            </Text>
            <Text className="text-white/90 text-sm mt-1">
              Manage your harvest records and blockchain verification status
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  // ==============================
  // SEARCH + FILTERS
  // ==============================
  const SearchAndFilters = () => (
    <View className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
      <View className={`gap-3 ${isDesktop ? "flex-row items-center" : ""}`}>
        {/* Search */}
        <View
          className={`flex-row items-center bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 ${
            isDesktop ? "flex-1" : "mb-3"
          }`}
        >
          <Search color="#9ca3af" size={20} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by batch ID or produce name"
            className="flex-1 ml-3 text-gray-900 text-[15px]"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Filters */}
        <View className={`flex-row gap-3 ${isDesktop ? "" : "flex-wrap"}`}>
          {/* Farm Filter */}
          <View className="relative flex-1 min-w-[150px]">
            <Dropdown
              mode="outlined"
              placeholder="Choose a farm..."
              value={selectedFarm === "all" ? "" : selectedFarm}
              onSelect={(farmId) => setSelectedFarm(farmId ?? "all")}
              options={[
                { label: "All Farms", value: "all" },
                ...farms.map((farm) => ({
                  label: farm.name,
                  value: farm.id,
                })),
              ]}
              CustomDropdownInput={DropDownInput}
              CustomDropdownItem={DropdownItem}
              menuContentStyle={dropdownMenuContentStyle}
              hideMenuHeader
            />
          </View>

          {/* Verified Filter */}
          <TouchableOpacity
            onPress={() => setShowVerifiedOnly(!showVerifiedOnly)}
            className={`flex-row items-center gap-2 px-4 py-3 rounded-lg border ${
              showVerifiedOnly
                ? "bg-emerald-50 border-emerald-500"
                : "bg-white border-gray-300"
            }`}
          >
            <CheckCircle
              color={showVerifiedOnly ? "#059669" : "#6b7280"}
              size={20}
            />
            <Text
              className={`text-[15px] font-medium ${
                showVerifiedOnly ? "text-emerald-700" : "text-gray-700"
              }`}
            >
              Verified Only
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // ==============================
  // CARD / TABLE VIEW
  // ==============================
  const ProduceListResponseDtoCard = ({
    batch,
  }: {
    batch: ProduceListResponseDto;
  }) => (
    <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-gray-900 text-lg font-bold mb-1">
            {batch.name}
          </Text>
          <Text className="text-gray-600 text-sm">Batch ID: {batch.id}</Text>
        </View>
        <View
          className={`flex-row items-center gap-1 px-3 py-1 rounded-full ${getStatusColor(
            batch.name
          )}`}
        >
          {getStatusIcon(batch.name)}
          <Text className="text-xs font-semibold capitalize">{batch.name}</Text>
        </View>
      </View>

      <View className="gap-2 mb-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">Harvest Date</Text>
          <Text className="text-gray-900 text-sm font-medium">
            {formatDate(batch.harvestDate)}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">Quantity</Text>
          <Text className="text-gray-900 text-sm font-medium">
            {batch.quantity} {batch.unit}
          </Text>
        </View>
        {batch.farmId && (
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 text-sm">Farm</Text>
            <Text className="text-gray-900 text-sm font-medium">
              {batch.farmId}
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={() => handleViewDetails(batch)}
          className="flex-1 flex-row items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg py-2"
        >
          <Eye color="#059669" size={18} />
          <Text className="text-emerald-700 text-sm font-semibold">
            View Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleViewQR(batch)}
          className="flex-1 flex-row items-center justify-center gap-2 bg-blue-50 border border-blue-200 rounded-lg py-2"
        >
          <QrCode color="#2563eb" size={18} />
          <Text className="text-blue-700 text-sm font-semibold">View QR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ==============================
  // MAIN RENDER
  // ==============================
  const isLoading = isProducing || isFarming;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#059669" />
        <Text className="mt-3 text-gray-600">Loading your produce...</Text>
      </View>
    );
  }

  if (produceError || farmError) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-8">
        <Text className="text-red-600 font-semibold mb-2">
          Error loading data
        </Text>
        <Text className="text-gray-600 text-center mb-4">
          Please check your network connection or try again later.
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/dashboard/farmer")}
          className="bg-emerald-600 px-5 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const content = (
    <View className="px-6 py-6">
      <SearchAndFilters />
      {filteredBatches.length === 0 ? (
        <View className="bg-white rounded-xl p-8 border border-gray-200 items-center">
          <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
            <Package color="#9ca3af" size={40} />
          </View>
          <Text className="text-gray-900 text-lg font-bold mb-2">
            No Produce Batches Found
          </Text>
          <Text className="text-gray-600 text-sm text-center mb-6">
            Try adjusting your search or filter criteria
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/dashboard/farmer/add-produce")}
            className="rounded-lg overflow-hidden"
          >
            <LinearGradient
              colors={["#22c55e", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="flex-row items-center gap-2 px-6 py-3"
            >
              <Plus color="#fff" size={20} />
              <Text className="text-white text-[15px] font-semibold">
                Add Produce Batch
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        filteredBatches.map((batch) => (
          <ProduceListResponseDtoCard key={batch.id} batch={batch} />
        ))
      )}
    </View>
  );

  return (
    <FarmerLayout
      headerTitle="My Produce Batches"
      headerSubtitle="Manage your harvest records and blockchain verification status"
      rightHeaderButton={
        <TouchableOpacity
          onPress={() => router.push("/dashboard/farmer/add-produce")}
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
              Add Produce
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      }
    >
      {content}
      {selectedBatch && (
        <QRModal
          visible={showQRModal}
          onClose={() => {
            setShowQRModal(false);
            setSelectedBatch(null);
          }}
          batchId={selectedBatch.id}
          qrCodeUrl={selectedBatch.unit || ""}
          blockchainTxHash={selectedBatch.blockchainTx}
        />
      )}
    </FarmerLayout>
  );
}
