import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { ChevronUp, ChevronDown } from "lucide-react-native";
import type { CreateProgramDto, CreateProgramDtoType } from "@/api";
import { useEthToMyr } from "@/hooks/useEthToMyr";
import {
  formatCurrency,
  ethToMyr,
} from "@/components/farmer/farm-produce/utils";

interface Props {
  programs: CreateProgramDto;
  onChange: (programs: CreateProgramDto) => void;
}

export function ProgramBasicsSection({ programs, onChange }: Props) {
  const { ethToMyr: ethToMyrRate } = useEthToMyr();

  const minPayout = 0.0001;
  const formatStep = (value: number) => parseFloat(value.toFixed(4));

  const updateProgram = (updates: Partial<CreateProgramDto>) => {
    onChange({ ...programs, ...updates });
  };

  const updatePayout = (updates: Partial<CreateProgramDto["payoutRule"]>) => {
    updateProgram({
      payoutRule: {
        ...programs.payoutRule,
        ...updates,
      } as CreateProgramDto["payoutRule"],
    });
  };

  const incrementPayoutAmount = () => {
    const current = programs.payoutRule?.amount || minPayout;
    const newAmount = current + 0.0001;
    updatePayout({ amount: formatStep(newAmount) });
  };

  const decrementPayoutAmount = () => {
    const current = programs.payoutRule?.amount || minPayout;
    const newAmount = Math.max(minPayout, current - 0.0001);
    updatePayout({ amount: formatStep(newAmount) });
  };

  const incrementMaxCap = () => {
    const current = programs.payoutRule?.maxCap || minPayout;
    const newAmount = current + 0.0001;
    updatePayout({ maxCap: formatStep(newAmount) });
  };

  const decrementMaxCap = () => {
    const current = programs.payoutRule?.maxCap || minPayout;
    const newAmount = Math.max(minPayout, current - 0.0001);
    updatePayout({ maxCap: formatStep(newAmount) });
  };

  return (
    <>
      <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-4">
        <Text className="text-gray-900 dark:text-gray-100 text-base font-bold mb-3">
          A. Program Basics & Payout
        </Text>
        <View className="gap-3">
          <View>
            <Text className="text-gray-600 dark:text-gray-400 text-xs mb-1">Program Name*</Text>
            <TextInput
              value={programs.name}
              onChangeText={(text) => updateProgram({ name: text })}
              placeholder="e.g., Drought Relief Subsidy 2025"
              className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100 text-sm"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View>
            <Text className="text-gray-600 dark:text-gray-400 text-xs mb-1">Description*</Text>
            <TextInput
              value={programs.description}
              onChangeText={(text) => updateProgram({ description: text })}
              placeholder="Brief description of the programs purpose"
              multiline
              numberOfLines={3}
              className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100 text-sm"
              placeholderTextColor="#9ca3af"
              style={{ textAlignVertical: "top" }}
            />
          </View>

          <View>
            <Text className="text-gray-600 dark:text-gray-400 text-xs mb-1">Program Type*</Text>
            <View className="flex-row flex-wrap gap-2">
              {["drought", "flood", "crop_loss"].map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() =>
                    updateProgram({
                      type: type as CreateProgramDtoType,
                    })
                  }
                  className={`px-4 py-2 rounded-lg border ${
                    programs.type === type
                      ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-500"
                      : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium capitalize ${
                      programs.type === type ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {type.replace("_", " ")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-gray-600 dark:text-gray-400 text-xs mb-1">Start Date*</Text>
              <TextInput
                value={programs.startDate}
                onChangeText={(text) => updateProgram({ startDate: text })}
                placeholder="YYYY-MM-DD"
                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100 text-sm"
                placeholderTextColor="#9ca3af"
              />
            </View>
            <View className="flex-1">
              <Text className="text-gray-600 dark:text-gray-400 text-xs mb-1">End Date*</Text>
              <TextInput
                value={programs.endDate}
                onChangeText={(text) => updateProgram({ endDate: text })}
                placeholder="YYYY-MM-DD"
                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100 text-sm"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
        </View>
      </View>

      <View className="gap-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-lg p-3 mb-4">
        <Text className="text-blue-900 dark:text-blue-300 text-sm font-semibold">
          Payout Configuration
        </Text>
        {programs.type === "flood" ? (
          <Text className="text-blue-800 dark:text-blue-300 text-xs">
            Automated payouts run every 1 hour for flood programs (powered by
            Chainlink).
          </Text>
        ) : null}
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-gray-700 dark:text-gray-300 text-xs mb-1">
              Payout Amount (ETH)*
            </Text>
            <View className="flex-row items-center bg-white dark:bg-gray-700 border border-blue-200 dark:border-blue-800 rounded-lg">
              <TextInput
                value={programs.payoutRule?.amount?.toString() || ""}
                onChangeText={(text) => {
                  let sanitized = text
                    .replace(/[^0-9.]/g, "")
                    .replace(/\./g, (match, offset) => {
                      return text.indexOf(".") === offset ? match : "";
                    });
                  const numValue = parseFloat(sanitized);
                  // Ensure minimum value
                  if (!isNaN(numValue) && numValue < minPayout) {
                    sanitized = minPayout.toFixed(4);
                  }
                  updatePayout({
                    amount:
                      sanitized === ""
                        ? minPayout
                        : formatStep(parseFloat(sanitized) || minPayout),
                  });
                }}
                placeholder="0.0001"
                keyboardType="decimal-pad"
                className="flex-1 px-4 py-3 text-gray-900 dark:text-gray-100 text-sm"
                placeholderTextColor="#9ca3af"
              />
              <View className="flex-col pr-2">
                <TouchableOpacity
                  onPress={incrementPayoutAmount}
                  className="p-1"
                >
                  <ChevronUp color="#6b7280" size={18} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={decrementPayoutAmount}
                  disabled={
                    (programs.payoutRule?.amount || minPayout) <= minPayout
                  }
                  className="p-1"
                  style={{
                    opacity:
                      (programs.payoutRule?.amount || minPayout) <= minPayout
                        ? 0.4
                        : 1,
                  }}
                >
                  <ChevronDown color="#6b7280" size={18} />
                </TouchableOpacity>
              </View>
            </View>
            {programs.payoutRule?.amount &&
              ethToMyrRate &&
              programs.payoutRule.amount > 0 && (
                <Text className="text-gray-500 dark:text-gray-400 text-[11px] mt-1">
                  ≈{" "}
                  {formatCurrency(
                    ethToMyr(programs.payoutRule.amount, ethToMyrRate) ?? 0
                  )}
                </Text>
              )}
            <Text className="text-gray-500 dark:text-gray-400 text-[10px] mt-1">
              Minimum: {minPayout} ETH
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-gray-700 dark:text-gray-300 text-xs mb-1">
              Maximum Cap (ETH)*
            </Text>
            <View className="flex-row items-center bg-white dark:bg-gray-700 border border-blue-200 dark:border-blue-800 rounded-lg">
              <TextInput
                value={programs.payoutRule?.maxCap?.toString() || ""}
                onChangeText={(text) => {
                  let sanitized = text
                    .replace(/[^0-9.]/g, "")
                    .replace(/\./g, (match, offset) => {
                      return text.indexOf(".") === offset ? match : "";
                    });
                  const numValue = parseFloat(sanitized);
                  // Ensure minimum value
                  if (!isNaN(numValue) && numValue < minPayout) {
                    sanitized = minPayout.toFixed(4);
                  }
                  updatePayout({
                    maxCap:
                      sanitized === ""
                        ? minPayout
                        : formatStep(parseFloat(sanitized) || minPayout),
                  });
                }}
                placeholder="0.0001"
                keyboardType="decimal-pad"
                className="flex-1 px-4 py-3 text-gray-900 dark:text-gray-100 text-sm"
                placeholderTextColor="#9ca3af"
              />
              <View className="flex-col pr-2">
                <TouchableOpacity onPress={incrementMaxCap} className="p-1">
                  <ChevronUp color="#6b7280" size={18} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={decrementMaxCap}
                  disabled={
                    (programs.payoutRule?.maxCap || minPayout) <= minPayout
                  }
                  className="p-1"
                  style={{
                    opacity:
                      (programs.payoutRule?.maxCap || minPayout) <= minPayout
                        ? 0.4
                        : 1,
                  }}
                >
                  <ChevronDown color="#6b7280" size={18} />
                </TouchableOpacity>
              </View>
            </View>
            {programs.payoutRule?.maxCap &&
              ethToMyrRate &&
              programs.payoutRule.maxCap > 0 && (
                <Text className="text-gray-500 dark:text-gray-400 text-[11px] mt-1">
                  ≈{" "}
                  {formatCurrency(
                    ethToMyr(programs.payoutRule.maxCap, ethToMyrRate) ?? 0
                  )}
                </Text>
              )}
            <Text className="text-gray-500 dark:text-gray-400 text-[10px] mt-1">
              Minimum: {minPayout} ETH
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}

export default ProgramBasicsSection;
