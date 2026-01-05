import React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import EthAmountDisplay from "@/components/common/EthAmountDisplay";
import { formatDate } from "@/components/farmer/farm-produce/utils";
import type { SubsidyResponseDto } from "@/api";
import {
  getStatusColor,
  getStatusIcon,
  getPaymentStatusColor,
} from "./statusHelpers";

type Props = {
  visible: boolean;
  isDesktop: boolean;
  subsidy: SubsidyResponseDto | null;
  onClose: () => void;
  farmerPrograms?: { id: string; name: string; description?: string | null }[];
};

const getStatusDisplay = (status: string) => {
  if (status === "APPROVED" || status === "DISBURSED") return "approved";
  if (status === "REJECTED") return "rejected";
  return "pending";
};

const getPaymentStatus = (subsidy: SubsidyResponseDto) => {
  if (subsidy.paidAt) return "paid";
  if (subsidy.approvedAt) return "processing";
  return "pending";
};

const getProgramName = (
  programsId: string | null | undefined,
  farmerPrograms?: { id: string; name: string }[]
) => {
  if (!programsId || !farmerPrograms) return "Unknown Program";
  const program = farmerPrograms.find((p) => p.id === programsId);
  return program?.name || "Unknown Program";
};

const getDescription = (
  subsidy: SubsidyResponseDto,
  farmerPrograms?: { id: string; description?: string | null }[]
) => {
  if (subsidy.programsId && farmerPrograms) {
    const program = farmerPrograms.find((p) => p.id === subsidy.programsId);
    if (program?.description) return program.description;
  }
  if (subsidy.rejectionReason) return subsidy.rejectionReason;
  return "Subsidy request";
};

export default function SubsidyDetailsModal({
  visible,
  isDesktop,
  subsidy,
  onClose,
  farmerPrograms,
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
          className={`bg-white dark:bg-gray-800 p-6 max-h-[80%] ${
            isDesktop ? "rounded-xl w-full max-w-2xl mx-4" : "rounded-t-3xl"
          }`}
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-900 dark:text-gray-100 text-xl font-bold">
              Subsidy Details
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full items-center justify-center"
            >
              <Text className="text-gray-600 text-lg">X</Text>
            </TouchableOpacity>
          </View>

          {subsidy && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-4">
                {(() => {
                  const statusDisplay = getStatusDisplay(subsidy.status);
                  const paymentStatus = getPaymentStatus(subsidy);
                  const programName = getProgramName(
                    subsidy.programsId,
                    farmerPrograms
                  );
                  const description = getDescription(subsidy, farmerPrograms);

                  return (
                    <>
                      <View className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <Text className="text-gray-600 dark:text-gray-400 text-xs mb-1">
                          Program Name
                        </Text>
                        <Text className="text-gray-900 dark:text-gray-100 text-[15px] font-semibold">
                          {programName}
                        </Text>
                      </View>

                      <View className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <Text className="text-gray-600 dark:text-gray-400 text-xs mb-1">ID</Text>
                        <Text className="text-gray-900 dark:text-gray-100 text-[15px] font-medium">
                          {subsidy.id}
                        </Text>
                      </View>

                      <View className="flex-row gap-3">
                        <View className="flex-1 bg-gray-50 rounded-lg p-4">
                          <Text className="text-gray-600 dark:text-gray-400 text-xs mb-1">
                            Amount
                          </Text>
                          <EthAmountDisplay
                            ethAmount={subsidy.amount}
                            textClassName="text-gray-900 text-[15px] font-bold"
                            myrClassName="text-gray-500 text-xs"
                          />
                        </View>
                        <View className="flex-1 bg-gray-50 rounded-lg p-4">
                          <Text className="text-gray-600 dark:text-gray-400 text-xs mb-1">
                            Status
                          </Text>
                          <View
                            className={`flex-row items-center gap-1 px-2 py-1 rounded-full self-start ${getStatusColor(
                              statusDisplay
                            )}`}
                          >
                            {getStatusIcon(statusDisplay)}
                            <Text className="text-xs font-semibold capitalize">
                              {statusDisplay}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <Text className="text-gray-600 dark:text-gray-400 text-xs mb-1">
                          Application Date
                        </Text>
                        <Text className="text-gray-900 dark:text-gray-100 text-[15px] font-medium">
                          {formatDate(subsidy.createdAt)}
                        </Text>
                      </View>

                      {subsidy.approvedAt && (
                        <View className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <Text className="text-gray-600 dark:text-gray-400 text-xs mb-1">
                            Approval Date
                          </Text>
                          <Text className="text-gray-900 dark:text-gray-100 text-[15px] font-medium">
                            {formatDate(subsidy.approvedAt)}
                          </Text>
                        </View>
                      )}

                      <View className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <Text className="text-gray-600 dark:text-gray-400 text-xs mb-1">
                          Payment Status
                        </Text>
                        <Text
                          className={`text-xs font-semibold capitalize px-3 py-1 rounded-full self-start ${getPaymentStatusColor(
                            paymentStatus
                          )}`}
                        >
                          {paymentStatus}
                        </Text>
                      </View>

                      <View className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <Text className="text-gray-600 dark:text-gray-400 text-xs mb-1">
                          Description
                        </Text>
                        <Text className="text-gray-900 dark:text-gray-100 text-sm">
                          {description}
                        </Text>
                      </View>
                    </>
                  );
                })()}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
