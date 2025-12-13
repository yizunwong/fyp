import { useMemo, useState } from "react";
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
import { Package, MapPin, Filter, Search, Eye } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppLayout } from "@/components/layout/AppLayoutContext";
import { useBatchesQuery } from "@/hooks/useRetailer";
import type { ProduceListResponseDto } from "@/api";
import { useAssignRetailerMutation } from "@/hooks/useProduce";
import { useAuthControllerProfile } from "@/api";
import Toast from "react-native-toast-message";
import { useMemo as useReactMemo } from "react";

export default function BatchesScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;

  const { batches, isLoading } = useBatchesQuery();
  const [selectedBatch, setSelectedBatch] =
    useState<ProduceListResponseDto | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "available" | "reserved"
  >("all");
  const [selectedFarm, setSelectedFarm] = useState<string>("all");
  const assignMutation = useAssignRetailerMutation();
  const profileQuery = useAuthControllerProfile();

  const layoutMeta = useReactMemo(
    () => ({
      title: "Browse Batches",
      subtitle: "Search and select produce from farms",
      mobile: {
        disableScroll: false,
      },
    }),
    []
  );

  useAppLayout(layoutMeta);

  const uiBatches = useMemo(() => batches ?? [], [batches]);

  const uniqueFarms = useMemo(
    () => ["all", ...Array.from(new Set(uiBatches.map((b) => b.farmId ?? "")))],
    [uiBatches]
  );

  const toUiStatus = (status: string) => {
    if (status === "IN_TRANSIT") return "reserved";
    if (status === "ARCHIVED") return "sold";
    return "available";
  };

  const filteredBatches = uiBatches.filter((batch) => {
    const matchesSearch =
      batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (batch.farm?.name ?? batch.farmId ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      batch.batchId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" || toUiStatus(batch.status) === selectedFilter;
    const matchesFarm =
      selectedFarm === "all" || batch.farmId === selectedFarm;

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

  const getCertificationBadge = (cert?: string) => {
    if (!cert) return { label: "N/A", color: "bg-gray-100 text-gray-700" };
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
    switch (toUiStatus(status)) {
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

  const handleSelectBatch = (batch: ProduceListResponseDto) => {
    setSelectedBatch(batch);
    setShowDetails(true);
  };

  const handlePlaceOrder = async () => {
    if (!selectedBatch) return;
    if (toUiStatus(selectedBatch.status) !== "available") {
      return;
    }
    const retailerId = profileQuery.data?.data?.id;
    if (!retailerId) {
      Toast.show({
        type: "error",
        text1: "Missing profile",
        text2: "Unable to place order without user profile",
      });
      return;
    }

    try {
      await assignMutation.assignRetailer(selectedBatch.id, { retailerId });
      Toast.show({
        type: "success",
        text1: "Order placed",
        text2: "Batch has been assigned to you",
      });
      setShowDetails(false);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Order failed",
        text2: assignMutation.error || error?.message || "Could not place order",
      });
    }
  };

  const BatchCard = ({ batch }: { batch: ProduceListResponseDto }) => {
    const certBadge = getCertificationBadge(batch.certifications?.[0]?.type);

    return (
      <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-gray-900 text-base font-bold">
                {batch.name}
              </Text>
              <View className={`px-2 py-0.5 rounded-full ${certBadge.color}`}>
                <Text className="text-xs font-semibold">{certBadge.label}</Text>
              </View>
            </View>
            <Text className="text-gray-600 text-sm">
              {batch.farm?.name ?? "Unknown Farm"}
            </Text>
          </View>
          <View
            className={`px-3 py-1 rounded-full ${getStatusColor(batch.status)}`}
          >
            <Text className="text-xs font-semibold capitalize">
              {toUiStatus(batch.status)}
            </Text>
          </View>
        </View>

        <View className="gap-2 mb-3">
          <View className="flex-row items-center gap-1 mb-1">
            <MapPin color="#9ca3af" size={14} />
            <Text className="text-gray-500 text-xs">
              {batch.farm?.address
                ? `${batch.farm.address}, ${batch.farm.district ?? ""} ${batch.farm.state ?? ""}`.trim()
                : batch.farm?.name ?? "Location pending"}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 text-sm">Batch Number</Text>
            <Text className="text-gray-900 text-sm font-mono font-medium">
              {batch.batchId}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 text-sm">Quantity</Text>
            <Text className="text-gray-900 text-sm font-medium">
              {batch.quantity ?? 0} {batch.unit}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 text-sm">Harvest Date</Text>
            <Text className="text-gray-900 text-sm">
              {formatDate(batch.harvestDate.toString())}
            </Text>
          </View>
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
                {farm === "all" ? "All Farms" : farm || "Unknown"}
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

      {isLoading ? (
        <View className="bg-white rounded-xl p-8 border border-gray-200 items-center">
          <Text className="text-gray-900 text-base font-bold mt-4">
            Loading batches...
          </Text>
        </View>
      ) : isDesktop ? (
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

      {filteredBatches.length === 0 && !isLoading && (
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
    <>
      <View className="flex-1 bg-gray-50">
        {isDesktop ? (
          pageContent
        ) : (
          <ScrollView className="flex-1">{pageContent}</ScrollView>
        )}
      </View>

      <Modal
        visible={showDetails}
        transparent
        animationType={isDesktop ? "fade" : "slide"}
        onRequestClose={() => setShowDetails(false)}
      >
        <View
          className={`flex-1 bg-black/50 ${
            isDesktop ? "items-center justify-center" : "justify-end"
          }`}
        >
          <View
            className={`bg-white ${
              isDesktop ? "rounded-2xl w-full max-w-3xl" : "rounded-t-3xl"
            } max-h-[90%]`}
          >
            <ScrollView>
              <View className="p-6">
                <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-gray-900 text-xl font-bold">
                    Batch Details
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowDetails(false)}
                    className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                  >
                    <Text className="text-gray-600 text-lg">A-</Text>
                  </TouchableOpacity>
                </View>

                {selectedBatch && (
                  <View className="gap-4">
                    <View className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <Text className="text-orange-900 text-lg font-bold mb-1">
                        {selectedBatch.name}
                      </Text>
                      <Text className="text-orange-700 text-sm">
                        Batch: {selectedBatch.batchId}
                      </Text>
                    </View>

                    <View className="bg-gray-50 rounded-lg p-4">
                      <Text className="text-gray-700 text-sm font-bold mb-3">
                        Farm Information
                      </Text>
                      <View className="gap-2">
                        <View className="flex-row items-center justify-between">
                          <Text className="text-gray-600 text-sm">Farm</Text>
                          <Text className="text-gray-900 text-sm font-medium">
                            {selectedBatch.farm?.name ?? "N/A"}
                          </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <Text className="text-gray-600 text-sm">
                            Location
                          </Text>
                          <Text className="text-gray-900 text-sm text-right">
                            {selectedBatch.farm?.address
                              ? `${selectedBatch.farm.address}${
                                  selectedBatch.farm.district
                                    ? `, ${selectedBatch.farm.district}`
                                    : ""
                                }${
                                  selectedBatch.farm.state
                                    ? `, ${selectedBatch.farm.state}`
                                    : ""
                                }`
                              : selectedBatch.farm?.name ?? "Location pending"}
                          </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <Text className="text-gray-600 text-sm">
                            Certification
                          </Text>
                          <View
                            className={`px-2 py-1 rounded-full ${
                              getCertificationBadge(
                                selectedBatch.certifications?.[0]?.type
                              ).color
                            }`}
                          >
                            <Text className="text-xs font-semibold">
                              {
                                getCertificationBadge(
                                  selectedBatch.certifications?.[0]?.type
                                ).label
                              }
                            </Text>
                          </View>
                        </View>
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
                            {selectedBatch.quantity ?? 0} {selectedBatch.unit}
                          </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <Text className="text-gray-600 text-sm">
                            Harvest Date
                          </Text>
                          <Text className="text-gray-900 text-sm">
                            {formatDate(selectedBatch.harvestDate.toString())}
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
                              {toUiStatus(selectedBatch.status)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <Text className="text-blue-700 text-sm font-bold mb-2">
                        Blockchain
                      </Text>
                      <Text className="text-blue-600 text-xs mb-2">
                        Transaction Hash:
                      </Text>
                      <Text className="text-blue-700 text-xs font-mono break-all">
                        {selectedBatch.blockchainTx ?? "N/A"}
                      </Text>
                    </View>

                    <View className="gap-3">
                      <TouchableOpacity
                        onPress={handlePlaceOrder}
                        disabled={
                          assignMutation.isPending ||
                          toUiStatus(selectedBatch.status) !== "available"
                        }
                        className="rounded-lg overflow-hidden"
                      >
                        <LinearGradient
                          colors={["#22c55e", "#15803d"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          className={`flex-row items-center justify-center gap-2 py-3 ${
                            assignMutation.isPending ||
                            toUiStatus(selectedBatch.status) !== "available"
                              ? "opacity-50"
                              : ""
                          }`}
                        >
                          <Package color="#fff" size={20} />
                          <Text className="text-white text-[15px] font-bold">
                            {assignMutation.isPending
                              ? "Placing..."
                              : toUiStatus(selectedBatch.status) !== "available"
                              ? "Unavailable"
                              : "Place Order"}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setShowDetails(false)}
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
    </>
  );
}
