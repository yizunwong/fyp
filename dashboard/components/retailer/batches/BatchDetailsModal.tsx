import { ScrollView, View, Text, TouchableOpacity, Image, Modal } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Package, Star } from "lucide-react-native";
import type { ProduceListResponseDto } from "@/api";
import {
  formatDate,
  getCertificationBadge,
  getStatusColor,
  getStatusLabel,
} from "./helpers";

type BatchDetailsModalProps = {
  visible: boolean;
  isDesktop: boolean;
  selectedBatch: ProduceListResponseDto | null;
  onClose: () => void;
  onPlaceOrder: () => void;
  canPlaceOrder: boolean;
  isPlacingOrder: boolean;
};

const BatchDetailsModal = ({
  visible,
  isDesktop,
  selectedBatch,
  onClose,
  onPlaceOrder,
  canPlaceOrder,
  isPlacingOrder,
}: BatchDetailsModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType={isDesktop ? "fade" : "slide"}
      onRequestClose={onClose}
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
                  onPress={onClose}
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

                  {selectedBatch.imageUrl ? (
                    <View className="rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                      <Image
                        source={{ uri: selectedBatch.imageUrl }}
                        style={{ width: "100%", height: 220 }}
                        resizeMode="cover"
                      />
                    </View>
                  ) : null}

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
                          Farm Rating
                        </Text>
                        <View className="flex-row items-center gap-1">
                          <Star color="#f59e0b" size={14} fill="#f59e0b" />
                          <Text className="text-gray-900 text-sm font-semibold">
                            {(selectedBatch.farm?.rating ?? 0).toFixed(1)}
                          </Text>
                          <Text className="text-gray-500 text-xs">
                            ({selectedBatch.farm?.ratingCount ?? 0})
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-gray-600 text-sm">Location</Text>
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
                            {getStatusLabel(selectedBatch.status)}
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
                    {selectedBatch && (
                      <TouchableOpacity
                        onPress={onPlaceOrder}
                        disabled={isPlacingOrder || !canPlaceOrder}
                        className="rounded-lg overflow-hidden"
                      >
                        <LinearGradient
                          colors={["#22c55e", "#15803d"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          className={`flex-row items-center justify-center gap-2 py-3 ${
                            isPlacingOrder || !canPlaceOrder ? "opacity-50" : ""
                          }`}
                        >
                          <Package color="#fff" size={20} />
                          <Text className="text-white text-[15px] font-bold">
                            {isPlacingOrder
                              ? "Placing..."
                              : !canPlaceOrder
                              ? "Unavailable"
                              : "Place Order"}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      onPress={onClose}
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
  );
};

export default BatchDetailsModal;
