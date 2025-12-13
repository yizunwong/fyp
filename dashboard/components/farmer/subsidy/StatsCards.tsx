import React from "react";
import { View, Text, ScrollView } from "react-native";
import {
  FileText,
  CircleCheck as CheckCircle,
  Clock,
  Circle as XCircle,
} from "lucide-react-native";
import type { SubsidyStats } from "./types";

type Props = {
  stats: SubsidyStats;
  isDesktop: boolean;
};

export default function StatsCards({ stats, isDesktop }: Props) {
  if (isDesktop) {
    return (
      <View className="gap-3 mb-6 flex-row">
        <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
          <View className="items-center">
            <View className="w-12 h-12 bg-emerald-50 rounded-full items-center justify-center mb-2">
              <FileText color="#059669" size={24} />
            </View>
            <Text className="text-gray-600 text-xs font-semibold mb-1">
              Total Applied
            </Text>
            <Text className="text-gray-900 text-2xl font-bold">
              {stats.total}
            </Text>
          </View>
        </View>

        <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
          <View className="items-center">
            <View className="w-12 h-12 bg-green-50 rounded-full items-center justify-center mb-2">
              <CheckCircle color="#15803d" size={24} />
            </View>
            <Text className="text-gray-600 text-xs font-semibold mb-1">
              Approved
            </Text>
            <Text className="text-gray-900 text-2xl font-bold">
              {stats.approved}
            </Text>
          </View>
        </View>

        <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
          <View className="items-center">
            <View className="w-12 h-12 bg-yellow-50 rounded-full items-center justify-center mb-2">
              <Clock color="#b45309" size={24} />
            </View>
            <Text className="text-gray-600 text-xs font-semibold mb-1">
              Pending
            </Text>
            <Text className="text-gray-900 text-2xl font-bold">
              {stats.pending}
            </Text>
          </View>
        </View>

        <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
          <View className="items-center">
            <View className="w-12 h-12 bg-red-50 rounded-full items-center justify-center mb-2">
              <XCircle color="#dc2626" size={24} />
            </View>
            <Text className="text-gray-600 text-xs font-semibold mb-1">
              Rejected
            </Text>
            <Text className="text-gray-900 text-2xl font-bold">
              {stats.rejected}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-6 -mx-6 px-6"
    >
      <View className="flex-row gap-3">
        <View className="bg-white rounded-xl p-4 border border-gray-200 w-32">
          <View className="items-center">
            <View className="w-10 h-10 bg-emerald-50 rounded-full items-center justify-center mb-2">
              <FileText color="#059669" size={20} />
            </View>
            <Text className="text-gray-600 text-[10px] font-semibold mb-1">
              Total Applied
            </Text>
            <Text className="text-gray-900 text-xl font-bold">
              {stats.total}
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-xl p-4 border border-gray-200 w-32">
          <View className="items-center">
            <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center mb-2">
              <CheckCircle color="#15803d" size={20} />
            </View>
            <Text className="text-gray-600 text-[10px] font-semibold mb-1">
              Approved
            </Text>
            <Text className="text-gray-900 text-xl font-bold">
              {stats.approved}
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-xl p-4 border border-gray-200 w-32">
          <View className="items-center">
            <View className="w-10 h-10 bg-yellow-50 rounded-full items-center justify-center mb-2">
              <Clock color="#b45309" size={20} />
            </View>
            <Text className="text-gray-600 text-[10px] font-semibold mb-1">
              Pending
            </Text>
            <Text className="text-gray-900 text-xl font-bold">
              {stats.pending}
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-xl p-4 border border-gray-200 w-32">
          <View className="items-center">
            <View className="w-10 h-10 bg-red-50 rounded-full items-center justify-center mb-2">
              <XCircle color="#dc2626" size={20} />
            </View>
            <Text className="text-gray-600 text-[10px] font-semibold mb-1">
              Rejected
            </Text>
            <Text className="text-gray-900 text-xl font-bold">
              {stats.rejected}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
