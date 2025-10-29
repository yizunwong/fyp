import type { FC } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { CheckCircle, QrCode } from "lucide-react-native";
import type { ProduceListResponseDto } from "@/api";
import { formatDate, formatQuantity } from "./utils";
import { EmptyState } from '@/components/ui/EmptyState';

type FarmProduceBatchListProps = {
  batches: ProduceListResponseDto[];
  isDesktop: boolean;
  onViewDetails: (batch: ProduceListResponseDto) => void;
  onViewQR: (batch: ProduceListResponseDto) => void;
  onAddProduce: () => void;
};

const FarmProduceBatchList: FC<FarmProduceBatchListProps> = ({
  batches,
  isDesktop,
  onViewDetails,
  onViewQR,
  onAddProduce,
}) => {
  if (isDesktop) {
    return (
      <View >
        <View className="flex-row items-center bg-gray-50 border-b border-gray-200 px-6 py-3">
          <Text className="flex-[2] text-[11px] font-semibold uppercase text-gray-500">
            Produce Batch
          </Text>
          <Text className="flex-[1.5] text-[11px] font-semibold uppercase text-gray-500">
            Harvest Date
          </Text>
          <Text className="flex-[1] text-[11px] font-semibold uppercase text-gray-500">
            Quantity
          </Text>
          <Text className="flex-[1.2] text-[11px] font-semibold uppercase text-gray-500">
            Blockchain
          </Text>
          <Text className="flex-[1.4] text-[11px] font-semibold uppercase text-gray-500">
            Actions
          </Text>
        </View>

        {batches.map((batch) => {
          const harvestDate = formatDate(batch.harvestDate);

          return (
            <View
              key={batch.id}
              className="flex-row items-center px-6 py-4 border-b border-gray-100 mt-10"
            >
              <View className="flex-[2] gap-1">
                <Text className="text-gray-900 text-sm font-semibold">
                  {batch.name}
                </Text>
                <Text className="text-gray-500 text-xs font-medium">
                  Batch ID: {batch.batchId}
                </Text>
              </View>
              <Text className="flex-[1.5] text-gray-800 text-sm">
                {harvestDate ?? "--"}
              </Text>
              <Text className="flex-[1] text-gray-800 text-sm">
                {formatQuantity(batch.quantity, batch.unit)}
              </Text>
              <View className="flex-[1.2]">
                {batch.blockchainTx ? (
                  <Text
                    className="text-gray-500 text-[11px] font-mono mt-1"
                    numberOfLines={1}
                  >
                    {batch.blockchainTx.slice(0, 8)}...
                    {batch.blockchainTx.slice(-6)}
                  </Text>
                ) : null}
              </View>
              <View className="flex-[1.4] flex-row gap-2">
                <TouchableOpacity
                  onPress={() => onViewDetails(batch)}
                  className="flex-1 items-center justify-center border border-emerald-300 bg-emerald-50 rounded-lg py-2"
                >
                  <Text className="text-emerald-700 text-xs font-semibold">
                    Details
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onViewQR(batch)}
                  className="flex-1 items-center justify-center border border-blue-300 bg-blue-50 rounded-lg py-2"
                >
                  <Text className="text-blue-700 text-xs font-semibold">
                    QR Code
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {batches.length === 0 ? (
          <View className="px-6 py-10">
            <EmptyState
              title="No Produce Batches"
              subtitle="Try adjusting your search or filter criteria"
              onActionPress={onAddProduce}
            />
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View className="gap-4">
      {batches.map((batch) => {
        const harvestDate = formatDate(batch.harvestDate);

        return (
          <View
            key={batch.id}
            className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm mt-5"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-3">
                <Text className="text-gray-900 text-base font-semibold">
                  {batch.name}
                </Text>
                <Text className="text-gray-500 text-xs mt-1">
                  Batch ID: {batch.batchId}
                </Text>
              </View>
            </View>

            <View className="mt-4 gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-500 text-xs uppercase font-semibold">
                  Harvest Date
                </Text>
                <Text className="text-gray-900 text-sm font-medium">
                  {harvestDate ?? "--"}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-500 text-xs uppercase font-semibold">
                  Quantity
                </Text>
                <Text className="text-gray-900 text-sm font-medium">
                  {formatQuantity(batch.quantity, batch.unit)}
                </Text>
              </View>
              {batch.blockchainTx ? (
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-500 text-xs uppercase font-semibold">
                    Blockchain Tx
                  </Text>
                  <Text
                    className="text-gray-900 text-xs font-mono"
                    numberOfLines={1}
                  >
                    {batch.blockchainTx.slice(0, 10)}...
                    {batch.blockchainTx.slice(-6)}
                  </Text>
                </View>
              ) : null}
            </View>

            <View className="mt-4 flex-row gap-3">
              <TouchableOpacity
                onPress={() => onViewDetails(batch)}
                className="flex-1 flex-row items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg py-2.5"
              >
                <CheckCircle color="#047857" size={16} />
                <Text className="text-emerald-700 text-sm font-semibold">
                  View Details
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onViewQR(batch)}
                className="flex-1 flex-row items-center justify-center gap-2 bg-blue-50 border border-blue-200 rounded-lg py-2.5"
              >
                <QrCode color="#2563eb" size={16} />
                <Text className="text-blue-700 text-sm font-semibold">
                  View QR
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {batches.length === 0 ? (
        <EmptyState
          title="No Produce Batches"
          subtitle="Try adjusting your search or filter criteria"
          onActionPress={onAddProduce}
        />
      ) : null}
    </View>
  );
};

export default FarmProduceBatchList;
