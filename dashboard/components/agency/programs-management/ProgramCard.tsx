import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { ProgramResponseDto } from "@/api";

interface Props {
  programs: ProgramResponseDto;
  onOpenStatusPicker: (programs: ProgramResponseDto) => void;
  getTypeColor: (type: string | undefined | null) => string;
  getStatusColor: (status: string | undefined | null) => string;
  formatDate: (date: string | Date | undefined | null) => string;
}

export function ProgramCard({
  programs,
  onOpenStatusPicker,
  getTypeColor,
  getStatusColor,
  formatDate,
}: Props) {
  const typeLabel = (programs.type ?? "").toString();
  const statusLabel = (programs.status ?? "").toString();

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-3">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-gray-900 dark:text-gray-100 text-base font-bold">
              {programs.name}
            </Text>
            <View
              className={`px-2 py-0.5 rounded-full ${getTypeColor(typeLabel)}`}
            >
              <Text className="text-xs font-semibold capitalize">
                {typeLabel.replace("_", " ")}
              </Text>
            </View>
          </View>
          <Text className="text-gray-600 dark:text-gray-400 text-sm">
            {programs.description ?? ""}
          </Text>
        </View>
        <View
          className={`px-3 py-1 rounded-full ${getStatusColor(statusLabel)}`}
        >
          <Text className="text-xs font-semibold capitalize">
            {statusLabel.toLowerCase()}
          </Text>
        </View>
      </View>

      <View className="gap-2 mb-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 dark:text-gray-400 text-sm">Period</Text>
          <Text className="text-gray-900 dark:text-gray-100 text-sm font-medium">
            {formatDate(programs.startDate)} - {formatDate(programs.endDate)}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 dark:text-gray-400 text-sm">Payout Amount (ETH)</Text>
          <Text className="text-gray-900 dark:text-gray-100 text-sm font-medium">
            {(programs.payoutRule?.amount ?? 0).toLocaleString("en-MY", {
              minimumFractionDigits: 4,
              maximumFractionDigits: 4,
            })}{" "}
            ETH
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => onOpenStatusPicker(programs)}
        className="rounded-lg overflow-hidden"
      >
        <LinearGradient
          colors={["#2563eb", "#1d4ed8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex-row items-center justify-center gap-2 py-2.5"
        >
          <Text className="text-white text-sm font-semibold">
            Review
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

export default ProgramCard;
