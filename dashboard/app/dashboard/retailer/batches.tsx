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
  Package,
  Star,
  MapPin,
  Filter,
  Search,
  ShoppingCart,
  Eye,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppLayout } from "@/components/layout/AppLayoutContext";

interface ProduceBatch {
  id: string;
  batchNumber: string;
  farmId: string;
  farmName: string;
  farmerName: string;
  produceType: string;
  quantity: number;
  unit: string;
  harvestDate: string;
  expiryDate: string;
  price: number;
  certification: string;
  location: {
    state: string;
    district: string;
  };
  blockchainHash: string;
  rating?: number;
  status: "available" | "reserved" | "sold";
}

const mockBatches: ProduceBatch[] = [
  {
    id: "1",
    batchNumber: "BTH-001-2025",
    farmId: "FARM-001",
    farmName: "Faizal Farm",
    farmerName: "Mohd Faizal bin Ahmad",
    produceType: "Organic Tomatoes",
    quantity: 500,
    unit: "kg",
    harvestDate: "2025-12-08",
    expiryDate: "2025-12-15",
    price: 8.5,
    certification: "MyGAP",
    location: { state: "Kedah", district: "Kubang Pasu" },
    blockchainHash:
      "0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385",
    rating: 4.8,
    status: "available",
  },
  {
    id: "2",
    batchNumber: "BTH-045-2025",
    farmId: "FARM-045",
    farmName: "Mei Ling Organic Farm",
    farmerName: "Tan Mei Ling",
    produceType: "Fresh Lettuce",
    quantity: 300,
    unit: "kg",
    harvestDate: "2025-12-09",
    expiryDate: "2025-12-13",
    price: 6.0,
    certification: "Organic",
    location: { state: "Pahang", district: "Cameron Highlands" },
    blockchainHash:
      "0x8a1bde2f1e68b8cf77bc5fbe90ade2f1e68b8cf77bc5fbe91d3d3fc8c22ba02496",
    rating: 5.0,
    status: "available",
  },
  {
    id: "3",
    batchNumber: "BTH-078-2025",
    farmId: "FARM-078",
    farmName: "Kumar Plantation",
    farmerName: "Kumar Selvam",
    produceType: "Fresh Durian",
    quantity: 200,
    unit: "kg",
    harvestDate: "2025-12-07",
    expiryDate: "2025-12-12",
    price: 25.0,
    certification: "MyGAP",
    location: { state: "Johor", district: "Kluang" },
    blockchainHash:
      "0x9b2cef3g2f79c9dg88cd6gef01bef3g2f79c9dg88cd6gef02e4e4gd9d33cb13507",
    rating: 4.5,
    status: "reserved",
  },
  {
    id: "4",
    batchNumber: "BTH-112-2025",
    farmId: "FARM-112",
    farmName: "Siti Nursery",
    farmerName: "Siti Aminah",
    produceType: "Cherry Tomatoes",
    quantity: 150,
    unit: "kg",
    harvestDate: "2025-12-10",
    expiryDate: "2025-12-17",
    price: 12.0,
    certification: "Organic",
    location: { state: "Selangor", district: "Kuala Selangor" },
    blockchainHash:
      "0x4c8def9h3g80d0eh99de7hfg12cfg4h3g80d0eh99de7hfg13f5f5he0e44dc24608",
    rating: 4.9,
    status: "available",
  },
  {
    id: "5",
    batchNumber: "BTH-089-2025",
    farmId: "FARM-089",
    farmName: "Wong Brothers Farm",
    farmerName: "Wong Wei Ming",
    produceType: "Bok Choy",
    quantity: 400,
    unit: "kg",
    harvestDate: "2025-12-09",
    expiryDate: "2025-12-14",
    price: 4.5,
    certification: "MyGAP",
    location: { state: "Perak", district: "Ipoh" },
    blockchainHash:
      "0x3b7cde8g2f69b9cg77bc5dbe89bde8g2f69b9cg77bc5dbe81c2c2gb8c11a80274",
    rating: 4.3,
    status: "available",
  },
];

export default function BatchesScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;

  const [batches] = useState<ProduceBatch[]>(mockBatches);
  const [selectedBatch, setSelectedBatch] = useState<ProduceBatch | null>(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "available" | "reserved"
  >("all");
  const [selectedFarm, setSelectedFarm] = useState<string>("all");

  useAppLayout({
    title: "Browse Batches",
    subtitle: "Search and select produce from farms",
    mobile: {
      disableScroll: false,
    },
  });

  const uniqueFarms = [
    "all",
    ...Array.from(new Set(batches.map((b) => b.farmName))),
  ];

  const filteredBatches = batches.filter((batch) => {
    const matchesSearch =
      batch.produceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.farmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" || batch.status === selectedFilter;
    const matchesFarm =
      selectedFarm === "all" || batch.farmName === selectedFarm;

    return matchesSearch && matchesFilter && matchesFarm;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getCertificationBadge = (cert: string) => {
    switch (cert.toLowerCase()) {
      case "mygap":
        return { label: "MyGAP", color: "bg-blue-100 text-blue-700" };
      case "organic":
        return { label: "Organic", color: "bg-green-100 text-green-700" };
      default:
        return { label: cert, color: "bg-gray-100 text-gray-700" };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-700";
      case "reserved":
        return "bg-yellow-100 text-yellow-700";
      case "sold":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleSelectBatch = (batch: ProduceBatch) => {
    setSelectedBatch(batch);
    setShowBatchModal(true);
  };

  const handleOrderBatch = () => {
    console.log("Ordering batch:", selectedBatch?.batchNumber);
    setShowBatchModal(false);
  };

  const BatchCard = ({ batch }: { batch: ProduceBatch }) => {
    const certBadge = getCertificationBadge(batch.certification);

    return (
      <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-gray-900 text-base font-bold">
                {batch.produceType}
              </Text>
              <View className={`px-2 py-0.5 rounded-full ${certBadge.color}`}>
                <Text className="text-xs font-semibold">{certBadge.label}</Text>
              </View>
            </View>
            <Text className="text-gray-600 text-sm">{batch.farmName}</Text>
            <Text className="text-gray-500 text-xs">{batch.farmerName}</Text>
          </View>
          <View
            className={`px-3 py-1 rounded-full ${getStatusColor(batch.status)}`}
          >
            <Text className="text-xs font-semibold capitalize">
              {batch.status}
            </Text>
          </View>
        </View>

        <View className="gap-2 mb-3">
          <View className="flex-row items-center gap-1 mb-1">
            <MapPin color="#9ca3af" size={14} />
            <Text className="text-gray-500 text-xs">
              {batch.location.district}, {batch.location.state}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 text-sm">Batch Number</Text>
            <Text className="text-gray-900 text-sm font-mono font-medium">
              {batch.batchNumber}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 text-sm">Quantity</Text>
            <Text className="text-gray-900 text-sm font-medium">
              {batch.quantity} {batch.unit}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 text-sm">Price per kg</Text>
            <Text className="text-green-700 text-sm font-bold">
              RM {batch.price.toFixed(2)}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 text-sm">Harvest Date</Text>
            <Text className="text-gray-900 text-sm">
              {formatDate(batch.harvestDate)}
            </Text>
          </View>
          {batch.rating && (
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-600 text-sm">Farmer Rating</Text>
              <View className="flex-row items-center gap-1">
                <Star color="#f59e0b" size={14} fill="#f59e0b" />
                <Text className="text-gray-900 text-sm font-medium">
                  {batch.rating}
                </Text>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={() => handleSelectBatch(batch)}
          className="rounded-lg overflow-hidden"
        >
          <LinearGradient
            colors={["#ea580c", "#c2410c"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-row items-center justify-center gap-2 py-2.5"
          >
            <Eye color="#fff" size={18} />
            <Text className="text-white text-sm font-semibold">
              View Details
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  const pageContent = (
    <View className="px-6 py-6">
      <View className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
        <View className="flex-row items-center gap-3 mb-4">
          <View className="flex-1 flex-row items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
            <Search color="#9ca3af" size={20} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by produce, farm, or batch..."
              className="flex-1 text-gray-900 text-sm"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <TouchableOpacity className="w-10 h-10 bg-orange-50 rounded-lg items-center justify-center border border-orange-200">
            <Filter color="#ea580c" size={20} />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center gap-2 mb-3">
          {(["all", "available", "reserved"] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-lg border ${
                selectedFilter === filter
                  ? "bg-orange-50 border-orange-500"
                  : "bg-gray-50 border-gray-300"
              }`}
            >
              <Text
                className={`text-xs font-semibold capitalize ${
                  selectedFilter === filter
                    ? "text-orange-700"
                    : "text-gray-700"
                }`}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row gap-2"
        >
          {uniqueFarms.map((farm) => (
            <TouchableOpacity
              key={farm}
              onPress={() => setSelectedFarm(farm)}
              className={`px-3 py-1.5 rounded-full border ${
                selectedFarm === farm
                  ? "bg-blue-50 border-blue-500"
                  : "bg-white border-gray-300"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  selectedFarm === farm ? "text-blue-700" : "text-gray-700"
                }`}
              >
                {farm === "all" ? "All Farms" : farm}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-gray-900 text-lg font-bold">
          {filteredBatches.length}{" "}
          {filteredBatches.length === 1 ? "Batch" : "Batches"} Found
        </Text>
      </View>

      {isDesktop ? (
        <View className="flex-row flex-wrap gap-4">
          {filteredBatches.map((batch) => (
            <View key={batch.id} style={{ width: "48%" }}>
              <BatchCard batch={batch} />
            </View>
          ))}
        </View>
      ) : (
        <View>
          {filteredBatches.map((batch) => (
            <BatchCard key={batch.id} batch={batch} />
          ))}
        </View>
      )}

      {filteredBatches.length === 0 && (
        <View className="bg-white rounded-xl p-8 border border-gray-200 items-center">
          <Package color="#9ca3af" size={48} />
          <Text className="text-gray-900 text-base font-bold mt-4">
            No batches found
          </Text>
          <Text className="text-gray-500 text-sm text-center mt-2">
            Try adjusting your search or filters
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {pageContent}

      <Modal visible={showBatchModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[90%]">
            <ScrollView>
              <View className="p-6">
                <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-gray-900 text-xl font-bold">
                    Batch Details
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowBatchModal(false)}
                    className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                  >
                    <Text className="text-gray-600 text-lg">×</Text>
                  </TouchableOpacity>
                </View>

                {selectedBatch && (
                  <View className="gap-4">
                    <View className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <Text className="text-orange-900 text-lg font-bold mb-1">
                        {selectedBatch.produceType}
                      </Text>
                      <Text className="text-orange-700 text-sm">
                        Batch: {selectedBatch.batchNumber}
                      </Text>
                    </View>

                    <View className="bg-gray-50 rounded-lg p-4">
                      <Text className="text-gray-700 text-sm font-bold mb-3">
                        Farm Information
                      </Text>
                      <View className="gap-2">
                        <View className="flex-row items-center justify-between">
                          <Text className="text-gray-600 text-sm">
                            Farm Name
                          </Text>
                          <Text className="text-gray-900 text-sm font-medium">
                            {selectedBatch.farmName}
                          </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <Text className="text-gray-600 text-sm">Farmer</Text>
                          <Text className="text-gray-900 text-sm font-medium">
                            {selectedBatch.farmerName}
                          </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <Text className="text-gray-600 text-sm">
                            Location
                          </Text>
                          <Text className="text-gray-900 text-sm font-medium">
                            {selectedBatch.location.district},{" "}
                            {selectedBatch.location.state}
                          </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <Text className="text-gray-600 text-sm">
                            Certification
                          </Text>
                          <View
                            className={`px-2 py-1 rounded-full ${
                              getCertificationBadge(selectedBatch.certification)
                                .color
                            }`}
                          >
                            <Text className="text-xs font-semibold">
                              {
                                getCertificationBadge(
                                  selectedBatch.certification
                                ).label
                              }
                            </Text>
                          </View>
                        </View>
                        {selectedBatch.rating && (
                          <View className="flex-row items-center justify-between">
                            <Text className="text-gray-600 text-sm">
                              Farmer Rating
                            </Text>
                            <View className="flex-row items-center gap-1">
                              <Star color="#f59e0b" size={16} fill="#f59e0b" />
                              <Text className="text-gray-900 text-sm font-bold">
                                {selectedBatch.rating} / 5.0
                              </Text>
                            </View>
                          </View>
                        )}
                      </View>
                    </View>

                    <View className="bg-gray-50 rounded-lg p-4">
                      <Text className="text-gray-700 text-sm font-bold mb-3">
                        Batch Details
                      </Text>
                      <View className="gap-2">
                        <View className="flex-row items-center justify-between">
                          <Text className="text-gray-600 text-sm">
                            Quantity Available
                          </Text>
                          <Text className="text-gray-900 text-sm font-bold">
                            {selectedBatch.quantity} {selectedBatch.unit}
                          </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <Text className="text-gray-600 text-sm">
                            Price per kg
                          </Text>
                          <Text className="text-green-700 text-base font-bold">
                            RM {selectedBatch.price.toFixed(2)}
                          </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <Text className="text-gray-600 text-sm">
                            Total Value
                          </Text>
                          <Text className="text-gray-900 text-base font-bold">
                            RM{" "}
                            {(
                              selectedBatch.quantity * selectedBatch.price
                            ).toFixed(2)}
                          </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <Text className="text-gray-600 text-sm">
                            Harvest Date
                          </Text>
                          <Text className="text-gray-900 text-sm">
                            {formatDate(selectedBatch.harvestDate)}
                          </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <Text className="text-gray-600 text-sm">
                            Best Before
                          </Text>
                          <Text className="text-gray-900 text-sm">
                            {formatDate(selectedBatch.expiryDate)}
                          </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <Text className="text-gray-600 text-sm">Status</Text>
                          <View
                            className={`px-3 py-1 rounded-full ${getStatusColor(
                              selectedBatch.status
                            )}`}
                          >
                            <Text className="text-xs font-semibold capitalize">
                              {selectedBatch.status}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <Text className="text-blue-700 text-sm font-bold mb-2">
                        Blockchain Verified
                      </Text>
                      <Text className="text-blue-600 text-xs mb-2">
                        Transaction Hash:
                      </Text>
                      <Text className="text-blue-700 text-xs font-mono break-all">
                        {selectedBatch.blockchainHash}
                      </Text>
                    </View>

                    <View className="gap-3">
                      {selectedBatch.status === "available" && (
                        <TouchableOpacity
                          onPress={handleOrderBatch}
                          className="rounded-lg overflow-hidden"
                        >
                          <LinearGradient
                            colors={["#22c55e", "#15803d"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="flex-row items-center justify-center gap-2 py-3"
                          >
                            <ShoppingCart color="#fff" size={20} />
                            <Text className="text-white text-[15px] font-bold">
                              Place Order
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        onPress={() => setShowBatchModal(false)}
                        className="flex-row items-center justify-center gap-2 bg-gray-100 border border-gray-300 rounded-lg py-3"
                      >
                        <Text className="text-gray-700 text-[15px] font-bold">
                          Close
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
