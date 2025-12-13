import React from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import FileUploadPanel from "@/components/common/FileUploadPanel";
import {
  ethToMyr,
  formatCurrency,
  formatDate,
  formatEth,
} from "@/components/farmer/farm-produce/utils";
import { formatFarmLocation } from "@/utils/farm";
import type { UploadedDocument } from "@/validation/upload";
import type { ProgramResponseDto, FarmListRespondDto } from "@/api";
import type { ClaimValidationErrors } from "./types";

type Props = {
  visible: boolean;
  isDesktop: boolean;
  selectedProgram: ProgramResponseDto | null;
  verifiedFarms: FarmListRespondDto[];
  claimAmount: string;
  validationErrors: ClaimValidationErrors;
  exceedMaxMessage: string;
  ethToMyrRate?: number;
  claimEvidenceFiles: UploadedDocument[];
  minPayout: number;
  isSubmitting: boolean;
  isWriting: boolean;
  isWaitingReceipt: boolean;
  isIncrementDisabled: boolean;
  onClose: () => void;
  onAmountChange: (value: string) => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onSubmit: () => void;
  onFilesAdded: (files: UploadedDocument[]) => void;
  onRemoveFile: (fileId: string) => void;
};

export default function SubmitSubsidyModal({
  visible,
  isDesktop,
  selectedProgram,
  verifiedFarms,
  claimAmount,
  validationErrors,
  exceedMaxMessage,
  ethToMyrRate,
  claimEvidenceFiles,
  minPayout,
  isSubmitting,
  isWriting,
  isWaitingReceipt,
  isIncrementDisabled,
  onClose,
  onAmountChange,
  onIncrement,
  onDecrement,
  onSubmit,
  onFilesAdded,
  onRemoveFile,
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
              Submit Subsidy
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
            >
              <Text className="text-gray-600 text-lg">X</Text>
            </TouchableOpacity>
          </View>

          {selectedProgram && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-4">
                <View className="bg-gray-50 rounded-lg p-4">
                  <Text className="text-gray-600 text-xs mb-1">Program</Text>
                  <Text className="text-gray-900 text-[15px] font-semibold">
                    {selectedProgram.name}
                  </Text>
                  <Text className="text-gray-500 text-xs mt-1">
                    Active: {formatDate(selectedProgram.startDate)} -{" "}
                    {formatDate(selectedProgram.endDate)}
                  </Text>
                </View>

                <View className="bg-gray-50 rounded-lg p-4">
                  <Text className="text-gray-600 text-xs mb-1">
                    Select Farm
                  </Text>
                  {verifiedFarms.length === 0 ? (
                    <Text className="text-gray-500 text-xs">
                      No verified farms available. Verify a farm to proceed.
                    </Text>
                  ) : (
                    <View className="gap-2">
                      {verifiedFarms.map((farm) => (
                        <View
                          key={farm.id}
                          className="flex-row items-center justify-between"
                        >
                          <View className="flex-1 mr-2">
                            <Text className="text-gray-900 text-xs font-semibold">
                              {farm.name}
                            </Text>
                            <Text className="text-gray-500 text-[11px]">
                              {formatFarmLocation(farm) || "Location unavailable"}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                <View className="bg-gray-50 rounded-lg p-4">
                  <Text className="text-gray-600 text-xs mb-1">
                    Requested Payout Amount (ETH)
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <View className="flex-1 bg-white border border-gray-300 rounded-lg flex-row items-center">
                      <TextInput
                        value={claimAmount}
                        onChangeText={onAmountChange}
                        placeholder={minPayout.toFixed(5)}
                        keyboardType="decimal-pad"
                        className={`flex-1 px-3 py-2 text-gray-900 text-sm ${
                          validationErrors.amount || exceedMaxMessage
                            ? "border-red-400"
                            : ""
                        }`}
                        placeholderTextColor="#9ca3af"
                      />
                      <View className="flex-col pr-2">
                        <TouchableOpacity
                          onPress={onIncrement}
                          disabled={isIncrementDisabled}
                          className="p-1"
                          style={isIncrementDisabled ? { opacity: 0.4 } : undefined}
                        >
                          <ChevronUp color="#6b7280" size={18} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={onDecrement}
                          className="p-1"
                          disabled={parseFloat(claimAmount || "0") <= minPayout}
                          style={
                            parseFloat(claimAmount || "0") <= minPayout
                              ? { opacity: 0.4 }
                              : undefined
                          }
                        >
                          <ChevronDown color="#6b7280" size={18} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                  {exceedMaxMessage && (
                    <Text className="text-red-500 text-xs mt-1">
                      {exceedMaxMessage}
                    </Text>
                  )}
                  {validationErrors.amount && (
                    <Text className="text-red-500 text-xs mt-1">
                      {validationErrors.amount}
                    </Text>
                  )}
                  {claimAmount &&
                    ethToMyrRate &&
                    !Number.isNaN(Number(claimAmount)) && (
                      <Text className="text-gray-500 text-[11px] mt-1">
                        ≈{" "}
                        {formatCurrency(
                          ethToMyr(Number(claimAmount), ethToMyrRate) ?? 0
                        )}
                      </Text>
                    )}
                  <Text className="text-gray-500 text-[11px] mt-1">
                    Max payout for this program:{" "}
                    {selectedProgram.payoutRule?.maxCap !== undefined &&
                    selectedProgram.payoutRule?.maxCap !== null
                      ? ethToMyrRate
                        ? `${formatEth(selectedProgram.payoutRule.maxCap)} (${formatCurrency(
                            ethToMyr(selectedProgram.payoutRule.maxCap, ethToMyrRate) ?? 0
                          )})`
                        : formatEth(selectedProgram.payoutRule.maxCap)
                      : formatEth(0)}
                  </Text>
                </View>

                <View className="bg-gray-50 rounded-lg p-4">
                  <Text className="text-gray-600 text-xs mb-1">Evidence *</Text>
                  <FileUploadPanel
                    title="Upload Evidence"
                    subtitle="Supported formats: JPG, PNG, HEIC, HEIF or PDF"
                    helperLines={[
                      "Only one file can be attached for this claim.",
                      "For the best review speed, attach clear photos or scanned documents.",
                    ]}
                    buttonLabel="Add Evidence"
                    files={claimEvidenceFiles}
                    onFilesAdded={onFilesAdded}
                    onRemoveFile={onRemoveFile}
                  />
                  {validationErrors.evidence && (
                    <Text className="text-red-500 text-xs mt-1">
                      {validationErrors.evidence}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  onPress={onSubmit}
                  disabled={isSubmitting || isWriting || isWaitingReceipt}
                  className="rounded-lg overflow-hidden mt-2"
                  style={
                    isSubmitting || isWriting || isWaitingReceipt
                      ? { opacity: 0.7 }
                      : undefined
                  }
                >
                  <LinearGradient
                    colors={["#22c55e", "#059669"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="py-3 items-center"
                  >
                    <Text className="text-white text-[15px] font-semibold">
                      {isSubmitting ? "Submitting..." : "Submit Subsidy"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
