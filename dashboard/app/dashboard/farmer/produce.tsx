import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  useWindowDimensions,
  Modal,
} from "react-native";
import {
  ArrowLeft,
  Search,
  Filter,
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
import QRModal from "@/components/ui/qr-model";
import FarmerLayout from "@/components/ui/farmer-layout";

interface Farm {
  id: string;
  name: string;
}

interface ProduceBatch {
  id: string;
  batch_id: string;
  produce_name: string;
  harvest_date: string;
  farm_id: string;
  quantity: number;
  quantity_unit: string;
  blockchain_status: "verified" | "pending" | "failed";
  blockchain_tx_hash?: string;
  qr_code_url?: string;
  farm?: Farm;
}

const mockFarms: Farm[] = [
  { id: "1", name: "Green Valley Farm" },
  { id: "2", name: "Sunrise Organic Farm" },
  { id: "3", name: "Mountain View Farm" },
];

const mockProduceBatches: ProduceBatch[] = [
  {
    id: "1",
    batch_id: "FARM-BCH-0017",
    produce_name: "Beras Wangi",
    harvest_date: "2025-10-10",
    farm_id: "1",
    quantity: 500,
    quantity_unit: "kg",
    blockchain_status: "verified",
    blockchain_tx_hash: "0x742d35Cc6634C0532925a3b8D4C2B0E5B8e6eC12",
    qr_code_url:
      "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=FARM-BCH-0017",
    farm: { id: "1", name: "Green Valley Farm" },
  },
  {
    id: "2",
    batch_id: "FARM-BCH-0016",
    produce_name: "Organic Tomatoes",
    harvest_date: "2025-10-08",
    farm_id: "2",
    quantity: 300,
    quantity_unit: "kg",
    blockchain_status: "verified",
    blockchain_tx_hash: "0x8f3e92Aa7f5dE6783C0B9F2a1E4D8c3A7B5F6E9D",
    qr_code_url:
      "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=FARM-BCH-0016",
    farm: { id: "2", name: "Sunrise Organic Farm" },
  },
  {
    id: "3",
    batch_id: "FARM-BCH-0015",
    produce_name: "Sweet Corn",
    harvest_date: "2025-10-05",
    farm_id: "1",
    quantity: 800,
    quantity_unit: "kg",
    blockchain_status: "pending",
    qr_code_url:
      "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=FARM-BCH-0015",
    farm: { id: "1", name: "Green Valley Farm" },
  },
  {
    id: "4",
    batch_id: "FARM-BCH-0014",
    produce_name: "Fresh Carrots",
    harvest_date: "2025-10-03",
    farm_id: "3",
    quantity: 450,
    quantity_unit: "kg",
    blockchain_status: "verified",
    blockchain_tx_hash: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
    qr_code_url:
      "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=FARM-BCH-0014",
    farm: { id: "3", name: "Mountain View Farm" },
  },
  {
    id: "5",
    batch_id: "FARM-BCH-0013",
    produce_name: "Green Beans",
    harvest_date: "2025-10-01",
    farm_id: "2",
    quantity: 250,
    quantity_unit: "kg",
    blockchain_status: "failed",
    qr_code_url:
      "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=FARM-BCH-0013",
    farm: { id: "2", name: "Sunrise Organic Farm" },
  },
  {
    id: "6",
    batch_id: "FARM-BCH-0012",
    produce_name: "Organic Lettuce",
    harvest_date: "2025-09-28",
    farm_id: "1",
    quantity: 180,
    quantity_unit: "kg",
    blockchain_status: "verified",
    blockchain_tx_hash: "0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d",
    qr_code_url:
      "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=FARM-BCH-0012",
    farm: { id: "1", name: "Green Valley Farm" },
  },
];

export default function ProduceManagementScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;

  const [produceBatches, setProduceBatches] = useState<ProduceBatch[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<ProduceBatch[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFarm, setSelectedFarm] = useState<string>("all");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<ProduceBatch | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [produceBatches, searchQuery, selectedFarm, showVerifiedOnly]);

  const loadData = () => {
    setProduceBatches(mockProduceBatches);
    setFarms(mockFarms);
  };

  const applyFilters = () => {
    let filtered = [...produceBatches];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (batch) =>
          batch.batch_id.toLowerCase().includes(query) ||
          batch.produce_name.toLowerCase().includes(query)
      );
    }

    if (selectedFarm !== "all") {
      filtered = filtered.filter((batch) => batch.farm_id === selectedFarm);
    }

    if (showVerifiedOnly) {
      filtered = filtered.filter(
        (batch) => batch.blockchain_status === "verified"
      );
    }

    setFilteredBatches(filtered);
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

  const handleViewQR = (batch: ProduceBatch) => {
    setSelectedBatch(batch);
    setShowQRModal(true);
  };

  const handleViewDetails = (batch: ProduceBatch) => {
    setSelectedBatch(batch);
    setShowDetailsModal(true);
  };

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

  const SearchAndFilters = () => (
    <View className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
      <View className={`gap-3 ${isDesktop ? "flex-row items-center" : ""}`}>
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

        <View className={`flex-row gap-3 ${isDesktop ? "" : "flex-wrap"}`}>
          <View className="relative flex-1 min-w-[150px]">
            <TouchableOpacity
              onPress={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex-row items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-3"
            >
              <View className="flex-row items-center gap-2">
                <Filter color="#6b7280" size={20} />
                <Text className="text-gray-900 text-[15px]">
                  {selectedFarm === "all"
                    ? "All Farms"
                    : farms.find((f) => f.id === selectedFarm)?.name ||
                      "Select Farm"}
                </Text>
              </View>
            </TouchableOpacity>

            {showFilterDropdown && (
              <View className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <TouchableOpacity
                  onPress={() => {
                    setSelectedFarm("all");
                    setShowFilterDropdown(false);
                  }}
                  className="px-4 py-3 border-b border-gray-100"
                >
                  <Text className="text-gray-900 text-[15px]">All Farms</Text>
                </TouchableOpacity>
                {farms.map((farm) => (
                  <TouchableOpacity
                    key={farm.id}
                    onPress={() => {
                      setSelectedFarm(farm.id);
                      setShowFilterDropdown(false);
                    }}
                    className="px-4 py-3 border-b border-gray-100"
                  >
                    <Text className="text-gray-900 text-[15px]">
                      {farm.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

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

  const ProduceBatchCard = ({ batch }: { batch: ProduceBatch }) => (
    <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-gray-900 text-lg font-bold mb-1">
            {batch.produce_name}
          </Text>
          <Text className="text-gray-600 text-sm">
            Batch ID: {batch.batch_id}
          </Text>
        </View>
        <View
          className={`flex-row items-center gap-1 px-3 py-1 rounded-full ${getStatusColor(
            batch.blockchain_status
          )}`}
        >
          {getStatusIcon(batch.blockchain_status)}
          <Text className="text-xs font-semibold capitalize">
            {batch.blockchain_status}
          </Text>
        </View>
      </View>

      <View className="gap-2 mb-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">Harvest Date</Text>
          <Text className="text-gray-900 text-sm font-medium">
            {formatDate(batch.harvest_date)}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">Quantity</Text>
          <Text className="text-gray-900 text-sm font-medium">
            {batch.quantity} {batch.quantity_unit}
          </Text>
        </View>
        {batch.farm && (
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 text-sm">Farm</Text>
            <Text className="text-gray-900 text-sm font-medium">
              {batch.farm.name}
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

  const ProduceTable = () => (
    <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <View className="flex-row border-b border-gray-200 px-4 py-3 bg-gray-50">
        <Text className="flex-1 text-gray-600 text-sm font-semibold">
          Batch ID
        </Text>
        <Text className="w-32 text-gray-600 text-sm font-semibold">
          Produce
        </Text>
        <Text className="w-28 text-gray-600 text-sm font-semibold">
          Harvest Date
        </Text>
        <Text className="w-24 text-gray-600 text-sm font-semibold">Farm</Text>
        <Text className="w-28 text-gray-600 text-sm font-semibold">Status</Text>
        <Text className="w-40 text-gray-600 text-sm font-semibold">
          Actions
        </Text>
      </View>

      <ScrollView className="max-h-[600px]">
        {filteredBatches.map((batch) => (
          <View
            key={batch.id}
            className="flex-row items-center px-4 py-4 border-b border-gray-100"
          >
            <Text className="flex-1 text-gray-900 text-[15px] font-medium">
              {batch.batch_id}
            </Text>
            <Text className="w-32 text-gray-900 text-[15px]" numberOfLines={1}>
              {batch.produce_name}
            </Text>
            <Text className="w-28 text-gray-700 text-[15px]">
              {formatDate(batch.harvest_date)}
            </Text>
            <Text className="w-24 text-gray-700 text-[15px]" numberOfLines={1}>
              {batch.farm?.name || "-"}
            </Text>
            <View className="w-28">
              <View
                className={`flex-row items-center gap-1 px-2 py-1 rounded-full self-start ${getStatusColor(
                  batch.blockchain_status
                )}`}
              >
                {getStatusIcon(batch.blockchain_status)}
                <Text className="text-xs font-semibold capitalize">
                  {batch.blockchain_status}
                </Text>
              </View>
            </View>
            <View className="w-40 flex-row gap-2">
              <TouchableOpacity
                onPress={() => handleViewDetails(batch)}
                className="flex-1 flex-row items-center justify-center gap-1 bg-emerald-50 border border-emerald-200 rounded-lg py-2 px-2"
              >
                <Eye color="#059669" size={16} />
                <Text className="text-emerald-700 text-xs font-semibold">
                  View
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleViewQR(batch)}
                className="flex-1 flex-row items-center justify-center gap-1 bg-blue-50 border border-blue-200 rounded-lg py-2 px-2"
              >
                <QrCode color="#2563eb" size={16} />
                <Text className="text-blue-700 text-xs font-semibold">QR</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const EmptyState = () => (
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
  );

  const FloatingActionButton = () => (
    <TouchableOpacity
      onPress={() => router.push("/dashboard/farmer/add-produce")}
      className="absolute bottom-6 right-6 w-14 h-14 rounded-full items-center justify-center"
      style={{
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      }}
    >
      <LinearGradient
        colors={["#22c55e", "#059669"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="w-full h-full rounded-full items-center justify-center"
      >
        <Plus color="#fff" size={28} />
      </LinearGradient>
    </TouchableOpacity>
  );

  const DetailsModal = () => (
    <Modal visible={showDetailsModal} transparent animationType="slide">
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-900 text-xl font-bold">
              Produce Batch Details
            </Text>
            <TouchableOpacity
              onPress={() => setShowDetailsModal(false)}
              className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
            >
              <Text className="text-gray-600 text-lg">×</Text>
            </TouchableOpacity>
          </View>

          {selectedBatch && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-4">
                <View className="bg-gray-50 rounded-lg p-4">
                  <Text className="text-gray-600 text-xs mb-1">Batch ID</Text>
                  <Text className="text-gray-900 text-lg font-bold">
                    {selectedBatch.batch_id}
                  </Text>
                </View>

                <View className="bg-gray-50 rounded-lg p-4">
                  <Text className="text-gray-600 text-xs mb-1">
                    Produce Name
                  </Text>
                  <Text className="text-gray-900 text-[15px] font-semibold">
                    {selectedBatch.produce_name}
                  </Text>
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1 bg-gray-50 rounded-lg p-4">
                    <Text className="text-gray-600 text-xs mb-1">Quantity</Text>
                    <Text className="text-gray-900 text-[15px] font-bold">
                      {selectedBatch.quantity} {selectedBatch.quantity_unit}
                    </Text>
                  </View>
                  <View className="flex-1 bg-gray-50 rounded-lg p-4">
                    <Text className="text-gray-600 text-xs mb-1">Status</Text>
                    <View
                      className={`flex-row items-center gap-1 px-2 py-1 rounded-full self-start ${getStatusColor(
                        selectedBatch.blockchain_status
                      )}`}
                    >
                      {getStatusIcon(selectedBatch.blockchain_status)}
                      <Text className="text-xs font-semibold capitalize">
                        {selectedBatch.blockchain_status}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="bg-gray-50 rounded-lg p-4">
                  <Text className="text-gray-600 text-xs mb-1">
                    Harvest Date
                  </Text>
                  <Text className="text-gray-900 text-[15px] font-medium">
                    {formatDate(selectedBatch.harvest_date)}
                  </Text>
                </View>

                {selectedBatch.farm && (
                  <View className="bg-gray-50 rounded-lg p-4">
                    <Text className="text-gray-600 text-xs mb-1">Farm</Text>
                    <Text className="text-gray-900 text-[15px] font-medium">
                      {selectedBatch.farm.name}
                    </Text>
                  </View>
                )}

                {selectedBatch.blockchain_tx_hash && (
                  <View className="bg-gray-50 rounded-lg p-4">
                    <Text className="text-gray-600 text-xs mb-1">
                      Blockchain Transaction Hash
                    </Text>
                    <Text
                      className="text-gray-900 text-xs font-mono"
                      numberOfLines={2}
                    >
                      {selectedBatch.blockchain_tx_hash}
                    </Text>
                  </View>
                )}

                <View className="flex-row gap-3 mt-2">
                  <TouchableOpacity
                    onPress={() => {
                      setShowDetailsModal(false);
                      handleViewQR(selectedBatch);
                    }}
                    className="flex-1 rounded-lg overflow-hidden"
                  >
                    <LinearGradient
                      colors={["#2563eb", "#1d4ed8"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="flex-row items-center justify-center gap-2 py-3"
                    >
                      <QrCode color="#fff" size={20} />
                      <Text className="text-white text-[15px] font-semibold">
                        View QR Code
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  const pageContent = (
    <View className="px-6 py-6">
      <SearchAndFilters />

      {filteredBatches.length === 0 ? (
        <EmptyState />
      ) : isDesktop ? (
        <ProduceTable />
      ) : (
        <View>
          {filteredBatches.map((batch) => (
            <ProduceBatchCard key={batch.id} batch={batch} />
          ))}
        </View>
      )}
    </View>
  );

  if (isDesktop) {
    return (
      <>
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
          {pageContent}
        </FarmerLayout>

        <DetailsModal />

        {selectedBatch && (
          <QRModal
            visible={showQRModal}
            onClose={() => {
              setShowQRModal(false);
              setSelectedBatch(null);
            }}
            batchId={selectedBatch.batch_id}
            qrCodeUrl={selectedBatch.qr_code_url || ""}
            blockchainTxHash={selectedBatch.blockchain_tx_hash}
          />
        )}
      </>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <Header />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6 -mt-6">
          <SearchAndFilters />

          {filteredBatches.length === 0 ? (
            <EmptyState />
          ) : (
            <View>
              {filteredBatches.map((batch) => (
                <ProduceBatchCard key={batch.id} batch={batch} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {produceBatches.length > 0 && <FloatingActionButton />}

      <DetailsModal />

      {selectedBatch && (
        <QRModal
          visible={showQRModal}
          onClose={() => {
            setShowQRModal(false);
            setSelectedBatch(null);
          }}
          batchId={selectedBatch.batch_id}
          qrCodeUrl={selectedBatch.qr_code_url || ""}
          blockchainTxHash={selectedBatch.blockchain_tx_hash}
        />
      )}
    </View>
  );
}
