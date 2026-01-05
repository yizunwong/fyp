import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import type { CreateProgramDtoStatus, ProgramResponseDto } from "@/api";

interface Props {
  programs: ProgramResponseDto[];
  isWeb: boolean;
  onOpenStatusPicker: (
    programs: ProgramResponseDto,
    anchor?: { x: number; y: number; width: number; height: number }
  ) => void;
  statusOptions: CreateProgramDtoStatus[];
  onSelectStatus: (
    programsId: string,
    status: CreateProgramDtoStatus
  ) => void | Promise<void>;
  getTypeColor: (type: string | undefined | null) => string;
  getStatusColor: (status: string | undefined | null) => string;
  formatDate: (date: string | Date | undefined | null) => string;
}

export function ProgramsTable({
  programs,
  isWeb,
  onOpenStatusPicker,
  statusOptions,
  onSelectStatus,
  getStatusColor,
  getTypeColor,
  formatDate,
}: Props) {
  return (
    <View className="relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-visible">
      <View className="flex-row border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-t-xl">
        <Text className="flex-1 pr-3 text-gray-600 dark:text-gray-400 text-xs font-semibold">
          Program Name
        </Text>
        <Text className="flex-1 pr-3 text-gray-600 dark:text-gray-400 text-xs font-semibold">
          Type
        </Text>
        <Text className="flex-1 pr-3 text-gray-600 dark:text-gray-400 text-xs font-semibold">
          Active Period
        </Text>
        <Text className="flex-1 pr-3 text-gray-600 dark:text-gray-400 text-xs font-semibold">
          Payout (ETH)
        </Text>
        <Text className="flex-1 pr-3 text-gray-600 dark:text-gray-400 text-xs font-semibold">
          Status
        </Text>
        <Text className="flex-1 text-gray-600 dark:text-gray-400 text-xs font-semibold text-right">
          Action
        </Text>
      </View>

      <ScrollView className="max-h-[600px] overflow-visible">
        {programs.map((programs) => (
          <View
            key={programs.id}
            className="flex-row items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700"
          >
            <View className="flex-1 pr-3">
              <Text
                className="text-gray-900 dark:text-gray-100 text-sm font-medium"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {programs.name}
              </Text>
              <Text
                className="text-gray-500 dark:text-gray-400 text-xs mt-0.5"
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {programs.description}
              </Text>
            </View>
            <View className="flex-1 pr-3">
              <View
                className={`px-2 py-1 rounded-full self-start ${getTypeColor(
                  programs.type
                )}`}
              >
                <Text className="text-gray-900 dark:text-gray-100 text-xs font-semibold capitalize">
                  {(programs.type ?? "").toString().replace("_", " ")}
                </Text>
              </View>
            </View>
            <View className="flex-1 pr-3">
              <Text className="text-gray-900 dark:text-gray-100 text-xs font-medium">
                {formatDate(programs.startDate)}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-xs">
                to {formatDate(programs.endDate)}
              </Text>
            </View>
            <View className="flex-1 pr-3">
              <Text className="text-gray-900 dark:text-gray-100 text-xs font-semibold">
                Amount: ETH{" "}
                {(programs.payoutRule?.amount ?? 0).toLocaleString("en-MY", {
                  minimumFractionDigits: 4,
                  maximumFractionDigits: 4,
                })}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-xs">
                Max Cap: ETH{" "}
                {(programs.payoutRule?.maxCap ?? 0).toLocaleString("en-MY", {
                  minimumFractionDigits: 4,
                  maximumFractionDigits: 4,
                })}
              </Text>
            </View>
            <View className="flex-1 pr-3 items-start">
              <View
                className={`px-2 py-1 rounded-full self-start ${getStatusColor(
                  programs.status
                )}`}
              >
                <Text className="text-gray-900 dark:text-gray-100 text-xs font-semibold capitalize">
                  {(programs.status ?? "").toString().toLowerCase()}
                </Text>
              </View>
            </View>
            <View className="flex-1 items-end">
              <TouchableOpacity
                onPress={() => onOpenStatusPicker(programs)}
                className="flex-row items-center justify-center gap-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg py-1.5 px-2"
              >
                <Text className="text-blue-700 dark:text-blue-300 text-xs font-semibold">
                  Review
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export default ProgramsTable;
