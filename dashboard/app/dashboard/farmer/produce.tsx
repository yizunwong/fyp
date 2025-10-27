import { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { Plus } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import QRModal from "@/components/ui/QRModel";
import FarmerLayout from "@/components/ui/FarmerLayout";
import { useProduceQuery } from "@/hooks/useProduce";
import { useFarmsQuery } from "@/hooks/useFarm";
import { ProduceListResponseDto, useAuthControllerProfile } from "@/api";
import ProduceFilters from "./components/ProduceFilters";
import ProduceBatchCard from "./components/ProduceBatchCard";
import ProduceEmptyState from "./components/ProduceEmptyState";

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

  const handleViewQR = (batch: ProduceListResponseDto) => {
    setSelectedBatch(batch);
    setShowQRModal(true);
  };

  const handleViewDetails = (batch: ProduceListResponseDto) => {
    setSelectedBatch(batch);
    setShowDetailsModal(true);
  };

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
      <ProduceFilters
        isDesktop={isDesktop}
        searchQuery={searchQuery}
        onSearchChange={(value) => setSearchQuery(value)}
        farms={farms}
        selectedFarm={selectedFarm}
        onSelectFarm={(value) => setSelectedFarm(value)}
        showVerifiedOnly={showVerifiedOnly}
        onToggleVerified={() => setShowVerifiedOnly((prev) => !prev)}
      />
      {filteredBatches.length === 0 ? (
        <ProduceEmptyState
          onAddProduce={() => router.push("/dashboard/farmer/add-produce")}
        />
      ) : (
        filteredBatches.map((batch) => (
          <ProduceBatchCard
            key={batch.id}
            batch={batch}
            onViewDetails={handleViewDetails}
            onViewQR={handleViewQR}
          />
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
