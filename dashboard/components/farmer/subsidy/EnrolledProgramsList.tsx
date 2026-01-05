import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Plus } from "lucide-react-native";
import { formatDate } from "@/components/farmer/farm-produce/utils";
import type { ProgramResponseDto } from "@/api";

type Props = {
  programs: ProgramResponseDto[];
  isLoading: boolean;
  onOpenClaim: (program: ProgramResponseDto) => void;
  isActionDisabled: boolean;
};

export default function EnrolledProgramsList({
  programs,
  isLoading,
  onOpenClaim,
  isActionDisabled,
}: Props) {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 mb-6">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-gray-900 dark:text-gray-100 text-lg font-bold">Enrolled Programs</Text>
      </View>
      {isLoading ? (
        <Text className="text-gray-500 dark:text-gray-400 text-sm">Loading enrolled programs...</Text>
      ) : !programs.length ? (
        <Text className="text-gray-500 dark:text-gray-400 text-sm">
          You have not enrolled in any programs yet.
        </Text>
      ) : (
        <View className="gap-3">
          {programs.map((program) => (
            <View
              key={program.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex-row items-center justify-between"
            >
              <View className="flex-1 mr-3">
                <Text className="text-gray-900 dark:text-gray-100 text-sm font-semibold">
                  {program.name}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  Active: {formatDate(program.startDate)} -{" "}
                  {formatDate(program.endDate)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => onOpenClaim(program)}
                disabled={isActionDisabled}
                className="rounded-lg overflow-hidden"
                style={isActionDisabled ? { opacity: 0.7 } : undefined}
              >
                <LinearGradient
                  colors={["#22c55e", "#059669"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="flex-row items-center gap-2 px-4 py-2"
                >
                  <Plus color="#fff" size={16} />
                  <Text className="text-white text-xs font-semibold">
                    Submit Subsidy
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
