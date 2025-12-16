import { type FC } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { ProgramResponseDto, ProgramResponseDtoStatus } from "@/api";

type ProgramStatusModalProps = {
  program: ProgramResponseDto | null;
  visible: boolean;
  onClose: () => void;
  getStatusColor: (status?: string | null) => string;
  getTypeColor: (type?: string | null) => string;
  getAvailableStatuses: (
    currentStatus?: ProgramResponseDtoStatus | null,
  ) => ProgramResponseDtoStatus[];
  onSelectStatus: (
    programsId: string,
    status: ProgramResponseDtoStatus,
  ) => void;
  formatDate: (value?: string | null) => string;
  formatList: (values?: string[] | null, fallback?: string) => string;
  formatEthFixed: (amount: number) => string;
  isProcessingStatusChange: boolean;
};

export const ProgramStatusModal: FC<ProgramStatusModalProps> = ({
  program,
  visible,
  onClose,
  getStatusColor,
  getTypeColor,
  getAvailableStatuses,
  onSelectStatus,
  formatDate,
  formatList,
  formatEthFixed,
  isProcessingStatusChange,
}) => {
  if (!program) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/30 justify-center px-6" onPress={onClose}>
        <View className="bg-white rounded-2xl p-5 shadow-lg max-w-2xl w-full self-center">
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-row items-start justify-between gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-gray-900 text-lg font-bold">
                  {program.name}
                </Text>
                <Text className="text-gray-600 text-sm mt-1">
                  {program.description ?? "No description provided."}
                </Text>
              </View>
              <View className="items-end gap-2">
                <View className={`px-2 py-1 rounded-full ${getTypeColor(program.type)}`}>
                  <Text className="text-xs font-semibold capitalize">
                    {program.type.toString().replace("_", " ")}
                  </Text>
                </View>
                <View
                  className={`px-2 py-1 rounded-full ${getStatusColor(program.status)}`}
                >
                  <Text className="text-xs font-semibold capitalize">
                    {program.status.toString().toLowerCase()}
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row flex-wrap gap-3 mb-4">
              <View className="flex-1 min-w-[45%] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <Text className="text-xs text-gray-500">Active period</Text>
                <Text className="text-sm font-semibold text-gray-900 mt-0.5">
                  {formatDate(program.startDate)} - {formatDate(program.endDate)}
                </Text>
              </View>
              <View className="flex-1 min-w-[45%] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <Text className="text-xs text-gray-500">Payout</Text>
                <Text className="text-sm font-semibold text-gray-900 mt-0.5">
                  ETH {formatEthFixed(program.payoutRule?.amount ?? 0)}{" "}
                  {program.payoutRule?.maxCap
                    ? `(Cap: ETH ${formatEthFixed(program.payoutRule.maxCap)})`
                    : ""}
                </Text>
              </View>
              <View className="flex-1 min-w-[45%] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <Text className="text-xs text-gray-500">On-chain ID</Text>
                <Text className="text-sm font-semibold text-gray-900 mt-0.5">
                  #{program.onchainId}
                </Text>
              </View>
              <View className="flex-1 min-w-[45%] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <Text className="text-xs text-gray-500">Last updated</Text>
                <Text className="text-sm font-semibold text-gray-900 mt-0.5">
                  {formatDate(program.updatedAt)}
                </Text>
              </View>
            </View>

            <View className="border border-gray-200 rounded-xl p-3 mb-4">
              <Text className="text-gray-900 text-sm font-semibold mb-2">
                Eligibility
              </Text>
              <View className="flex-row flex-wrap gap-3">
                <View className="flex-1 min-w-[45%]">
                  <Text className="text-xs text-gray-500">States</Text>
                  <Text className="text-sm text-gray-800 mt-0.5">
                    {formatList(program.eligibility?.states)}
                  </Text>
                </View>
                <View className="flex-1 min-w-[45%]">
                  <Text className="text-xs text-gray-500">Districts</Text>
                  <Text className="text-sm text-gray-800 mt-0.5">
                    {formatList(program.eligibility?.districts)}
                  </Text>
                </View>
                <View className="flex-1 min-w-[45%]">
                  <Text className="text-xs text-gray-500">Crop types</Text>
                  <Text className="text-sm text-gray-800 mt-0.5">
                    {formatList(program.eligibility?.cropTypes)}
                  </Text>
                </View>
                <View className="flex-1 min-w-[45%]">
                  <Text className="text-xs text-gray-500">Land documents</Text>
                  <Text className="text-sm text-gray-800 mt-0.5">
                    {formatList(program.eligibility?.landDocumentTypes)}
                  </Text>
                </View>
                <View className="flex-1 min-w-[45%]">
                  <Text className="text-xs text-gray-500">Min farm size</Text>
                  <Text className="text-sm text-gray-800 mt-0.5">
                    {program.eligibility?.minFarmSize ?? "Any"}
                  </Text>
                </View>
                <View className="flex-1 min-w-[45%]">
                  <Text className="text-xs text-gray-500">Max farm size</Text>
                  <Text className="text-sm text-gray-800 mt-0.5">
                    {program.eligibility?.maxFarmSize ?? "Any"}
                  </Text>
                </View>
              </View>
            </View>

            <View>
              <Text className="text-gray-900 text-sm font-semibold mb-2">
                Publish
              </Text>
              <View className="gap-2">
                {getAvailableStatuses(program.status).map((status) => {
                  const statusLower = status.toString().toLowerCase();
                  const isPublishButton = statusLower === "active";
                  return (
                    <TouchableOpacity
                      key={status}
                      disabled={isProcessingStatusChange}
                      onPress={() => onSelectStatus(program.id, status)}
                      className={`px-4 py-2 rounded-lg ${
                        isPublishButton
                          ? "bg-blue-600"
                          : "border border-gray-200"
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold text-center ${
                          isPublishButton ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {isPublishButton ? "Publish Program" : statusLower}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
};
