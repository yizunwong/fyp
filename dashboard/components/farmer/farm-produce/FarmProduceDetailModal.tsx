import type { FC } from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { X } from "lucide-react-native";
import type { ProduceListResponseDto } from "@/api";
import { formatDate, formatQuantity } from "./utils";

type FarmProduceDetailModalProps = {
  batch: ProduceListResponseDto | null;
  onClose: () => void;
};

const FarmProduceDetailModal: FC<FarmProduceDetailModalProps> = ({
  batch,
  onClose,
}) => {
  const visible = Boolean(batch);
  if (!batch) return null;

  const harvestDate = formatDate(batch.harvestDate);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="bg-white rounded-2xl w-full max-w-lg overflow-hidden border border-gray-200">
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
            <Text className="text-gray-900 text-lg font-bold">
              Produce Details
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
            >
              <X color="#6b7280" size={20} />
            </TouchableOpacity>
          </View>

          <View className="p-6 gap-4">
            <View className="gap-1">
              <Text className="text-sm text-gray-500 uppercase font-semibold">
                Produce Name
              </Text>
              <Text className="text-gray-900 text-lg font-semibold">
                {batch.name}
              </Text>
            </View>

            <View className="gap-1">
              <Text className="text-sm text-gray-500 uppercase font-semibold">
                Batch ID
              </Text>
              <Text className="text-gray-900 text-base font-medium">
                {batch.batchId}
              </Text>
            </View>

            <View className="gap-1">
              <Text className="text-sm text-gray-500 uppercase font-semibold">
                Harvest Date
              </Text>
              <Text className="text-gray-900 text-base font-medium">
                {harvestDate ?? "--"}
              </Text>
            </View>

            <View className="gap-1">
              <Text className="text-sm text-gray-500 uppercase font-semibold">
                Quantity
              </Text>
              <Text className="text-gray-900 text-base font-medium">
                {formatQuantity(batch.quantity, batch.unit)}
              </Text>
            </View>

            <View className="gap-1">
              <Text className="text-sm text-gray-500 uppercase font-semibold">
                Blockchain Tx Hash
              </Text>
              <Text className="text-gray-900 text-sm font-mono" numberOfLines={1}>
                {batch.blockchainTx ?? "Not yet recorded"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FarmProduceDetailModal;
