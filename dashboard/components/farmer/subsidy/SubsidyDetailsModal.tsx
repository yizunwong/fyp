import React from "react";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import EthAmountDisplay from "@/components/common/EthAmountDisplay";
import { formatDate } from "@/components/farmer/farm-produce/utils";
import type { Subsidy } from "./types";

type Props = {
  visible: boolean;
  isDesktop: boolean;
  subsidy: Subsidy | null;
  onClose: () => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getPaymentStatusColor: (status?: string) => string;
};

export default function SubsidyDetailsModal({
  visible,
  isDesktop,
  subsidy,
  onClose,
  getStatusColor,
  getStatusIcon,
  getPaymentStatusColor,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType={isDesktop ? "fade" : "slide"}
    >
      <View
        className={`flex-1 bg-black/50 ${
          isDesktop ? "justify-center items-center" : "justify-end"
        }`}
      >
        <View
          className={`bg-white p-6 max-h-[80%] ${
            isDesktop ? "rounded-xl w-full max-w-2xl mx-4" : "rounded-t-3xl"
          }`}
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-900 text-xl font-bold">
              Subsidy Details
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
            >
              <Text className="text-gray-600 text-lg">X</Text>
            </TouchableOpacity>
          </View>

          {subsidy && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-4">
                <View className="bg-gray-50 rounded-lg p-4">
                  <Text className="text-gray-600 text-xs mb-1">
                    Program Name
                  </Text>
                  <Text className="text-gray-900 text-[15px] font-semibold">
                    {subsidy.programName}
                  </Text>
                </View>

                <View className="bg-gray-50 rounded-lg p-4">
                  <Text className="text-gray-600 text-xs mb-1">ID</Text>
                  <Text className="text-gray-900 text-[15px] font-medium">
                    {subsidy.id}
                  </Text>
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1 bg-gray-50 rounded-lg p-4">
                    <Text className="text-gray-600 text-xs mb-1">Amount</Text>
                    <EthAmountDisplay
                      ethAmount={subsidy.amount}
                      textClassName="text-gray-900 text-[15px] font-bold"
                      myrClassName="text-gray-500 text-xs"
                    />
                  </View>
                  <View className="flex-1 bg-gray-50 rounded-lg p-4">
                    <Text className="text-gray-600 text-xs mb-1">Status</Text>
                    <View
                      className={`flex-row items-center gap-1 px-2 py-1 rounded-full self-start ${getStatusColor(
                        subsidy.status
                      )}`}
                    >
                      {getStatusIcon(subsidy.status)}
                      <Text className="text-xs font-semibold capitalize">
                        {subsidy.status}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="bg-gray-50 rounded-lg p-4">
                  <Text className="text-gray-600 text-xs mb-1">Farm</Text>
                  <Text className="text-gray-900 text-[15px] font-medium">
                    {subsidy.farmName}
                  </Text>
                </View>

                {subsidy.produceBatch && (
                  <View className="bg-gray-50 rounded-lg p-4">
                    <Text className="text-gray-600 text-xs mb-1">
                      Produce Batch
                    </Text>
                    <Text className="text-gray-900 text-[15px] font-medium">
                      {subsidy.produceBatch}
                    </Text>
                  </View>
                )}

                <View className="bg-gray-50 rounded-lg p-4">
                  <Text className="text-gray-600 text-xs mb-1">
                    Application Date
                  </Text>
                  <Text className="text-gray-900 text-[15px] font-medium">
                    {formatDate(subsidy.applicationDate)}
                  </Text>
                </View>

                {subsidy.approvalDate && (
                  <View className="bg-gray-50 rounded-lg p-4">
                    <Text className="text-gray-600 text-xs mb-1">
                      Approval Date
                    </Text>
                    <Text className="text-gray-900 text-[15px] font-medium">
                      {formatDate(subsidy.approvalDate)}
                    </Text>
                  </View>
                )}

                {subsidy.paymentStatus && (
                  <View className="bg-gray-50 rounded-lg p-4">
                    <Text className="text-gray-600 text-xs mb-1">
                      Payment Status
                    </Text>
                    <Text
                      className={`text-xs font-semibold capitalize px-3 py-1 rounded-full self-start ${getPaymentStatusColor(
                        subsidy.paymentStatus
                      )}`}
                    >
                      {subsidy.paymentStatus}
                    </Text>
                  </View>
                )}

                <View className="bg-gray-50 rounded-lg p-4">
                  <Text className="text-gray-600 text-xs mb-1">
                    Description
                  </Text>
                  <Text className="text-gray-900 text-sm">
                    {subsidy.description}
                  </Text>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
