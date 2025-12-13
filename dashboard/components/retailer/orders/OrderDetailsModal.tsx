import { Modal, ScrollView, View, Text, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CheckCircle, Star } from "lucide-react-native";
import type { ProduceListResponseDto } from "@/api";
import { toStatusInfo } from "./helpers";

type OrderDetailsModalProps = {
  visible: boolean;
  isDesktop: boolean;
  order: ProduceListResponseDto | null;
  onClose: () => void;
  onMarkArrived: () => void;
  isMarking: boolean;
};

const OrderDetailsModal = ({
  visible,
  isDesktop,
  order,
  onClose,
  onMarkArrived,
  isMarking,
}: OrderDetailsModalProps) => {
  const statusInfo = order ? toStatusInfo(order.status) : null;

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
                  Order Details
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                >
                  <Text className="text-gray-600 text-lg">A-</Text>
                </TouchableOpacity>
              </View>

              {order && (
                <View className="gap-4">
                  <View className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <Text className="text-orange-900 text-lg font-bold mb-1">
                      {order.name}
                    </Text>
                    <Text className="text-orange-700 text-sm">
                      Batch: {order.batchId}
                    </Text>
                  </View>

                  {order.imageUrl ? (
                    <View className="rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                      <Image
                        source={{ uri: order.imageUrl }}
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
                          {order.farm?.name ?? "N/A"}
                        </Text>
                      </View>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-gray-600 text-sm">
                          Farm Rating
                        </Text>
                        <View className="flex-row items-center gap-1">
                          <Star color="#f59e0b" size={14} fill="#f59e0b" />
                          <Text className="text-gray-900 text-sm font-semibold">
                            {(order.farm?.rating ?? 0).toFixed(1)}
                          </Text>
                          <Text className="text-gray-500 text-xs">
                            ({order.farm?.ratingCount ?? 0})
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-gray-600 text-sm">Location</Text>
                        <Text className="text-gray-900 text-sm text-right">
                          {order.farm?.address
                            ? `${order.farm.address}${order.farm.district ? `, ${order.farm.district}` : ""}${
                                order.farm.state ? `, ${order.farm.state}` : ""
                              }`
                            : "Location pending"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="bg-gray-50 rounded-lg p-4">
                    <Text className="text-gray-700 text-sm font-bold mb-3">
                      Batch Details
                    </Text>
                    <View className="gap-2">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-gray-600 text-sm">Quantity Available</Text>
                        <Text className="text-gray-900 text-sm font-bold">
                          {order.quantity ?? 0} {order.unit}
                        </Text>
                      </View>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-gray-600 text-sm">Harvest Date</Text>
                        <Text className="text-gray-900 text-sm">
                          {new Date(order.harvestDate).toLocaleDateString()}
                        </Text>
                      </View>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-gray-600 text-sm">Status</Text>
                        <View
                          className={`px-3 py-1 rounded-full ${
                            statusInfo ? statusInfo.color : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          <Text className="text-xs font-semibold capitalize">
                            {statusInfo?.label ?? order.status}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View className="gap-3">
                    {order?.status === "IN_TRANSIT" && (
                      <TouchableOpacity
                        onPress={onMarkArrived}
                        disabled={isMarking}
                        className="rounded-lg overflow-hidden"
                      >
                        <LinearGradient
                          colors={["#22c55e", "#15803d"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          className={`flex-row items-center justify-center gap-2 py-3 ${
                            isMarking ? "opacity-50" : ""
                          }`}
                        >
                          <CheckCircle color="#fff" size={20} />
                          <Text className="text-white text-[15px] font-bold">
                            {isMarking ? "Updating..." : "Mark as Arrived"}
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

export default OrderDetailsModal;
