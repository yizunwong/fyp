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

  const minPayout = 0.00001;

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
    const newAmount = current + 0.00001;
    updatePayout({ amount: parseFloat(newAmount.toFixed(5)) });
  };

  const decrementPayoutAmount = () => {
    const current = programs.payoutRule?.amount || minPayout;
    const newAmount = Math.max(minPayout, current - 0.00001);
    updatePayout({ amount: parseFloat(newAmount.toFixed(5)) });
  };

  const incrementMaxCap = () => {
    const current = programs.payoutRule?.maxCap || minPayout;
    const newAmount = current + 0.00001;
    updatePayout({ maxCap: parseFloat(newAmount.toFixed(5)) });
  };

  const decrementMaxCap = () => {
    const current = programs.payoutRule?.maxCap || minPayout;
    const newAmount = Math.max(minPayout, current - 0.00001);
    updatePayout({ maxCap: parseFloat(newAmount.toFixed(5)) });
  };

  return (
    <>
      <View className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <Text className="text-gray-900 text-base font-bold mb-3">
          A. Program Basics & Payout
        </Text>
        <View className="gap-3">
          <View>
            <Text className="text-gray-600 text-xs mb-1">Program Name*</Text>
            <TextInput
              value={programs.name}
              onChangeText={(text) => updateProgram({ name: text })}
              placeholder="e.g., Drought Relief Subsidy 2025"
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View>
            <Text className="text-gray-600 text-xs mb-1">Description*</Text>
            <TextInput
              value={programs.description}
              onChangeText={(text) => updateProgram({ description: text })}
              placeholder="Brief description of the programs purpose"
              multiline
              numberOfLines={3}
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
              placeholderTextColor="#9ca3af"
              style={{ textAlignVertical: "top" }}
            />
          </View>

          <View>
            <Text className="text-gray-600 text-xs mb-1">Program Type*</Text>
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
                      ? "bg-blue-50 border-blue-500"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium capitalize ${
                      programs.type === type ? "text-blue-700" : "text-gray-700"
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
              <Text className="text-gray-600 text-xs mb-1">Start Date*</Text>
              <TextInput
                value={programs.startDate}
                onChangeText={(text) => updateProgram({ startDate: text })}
                placeholder="YYYY-MM-DD"
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                placeholderTextColor="#9ca3af"
              />
            </View>
            <View className="flex-1">
              <Text className="text-gray-600 text-xs mb-1">End Date*</Text>
              <TextInput
                value={programs.endDate}
                onChangeText={(text) => updateProgram({ endDate: text })}
                placeholder="YYYY-MM-DD"
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
        </View>
      </View>

      <View className="gap-3 bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
        <Text className="text-blue-900 text-sm font-semibold">
          Payout Configuration
        </Text>
        {programs.type === "flood" ? (
          <Text className="text-blue-800 text-xs">
            Automated payouts run every 1 hour for flood programs (powered by
            Chainlink).
          </Text>
        ) : null}
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-gray-700 text-xs mb-1">
              Payout Amount (ETH)*
            </Text>
            <View className="flex-row items-center bg-white border border-blue-200 rounded-lg">
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
                    sanitized = minPayout.toFixed(5);
                  }
                  updatePayout({
                    amount: parseFloat(sanitized) || minPayout,
                  });
                }}
                placeholder="0.00001"
                keyboardType="decimal-pad"
                className="flex-1 px-4 py-3 text-gray-900 text-sm"
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
                <Text className="text-gray-500 text-[11px] mt-1">
                  ≈{" "}
                  {formatCurrency(
                    ethToMyr(programs.payoutRule.amount, ethToMyrRate) ?? 0
                  )}
                </Text>
              )}
            <Text className="text-gray-500 text-[10px] mt-1">
              Minimum: {minPayout} ETH
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-gray-700 text-xs mb-1">
              Maximum Cap (ETH)*
            </Text>
            <View className="flex-row items-center bg-white border border-blue-200 rounded-lg">
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
                    sanitized = minPayout.toFixed(5);
                  }
                  updatePayout({
                    maxCap: parseFloat(sanitized) || minPayout,
                  });
                }}
                placeholder="0.00001"
                keyboardType="decimal-pad"
                className="flex-1 px-4 py-3 text-gray-900 text-sm"
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
                <Text className="text-gray-500 text-[11px] mt-1">
                  ≈{" "}
                  {formatCurrency(
                    ethToMyr(programs.payoutRule.maxCap, ethToMyrRate) ?? 0
                  )}
                </Text>
              )}
            <Text className="text-gray-500 text-[10px] mt-1">
              Minimum: {minPayout} ETH
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}

export default ProgramBasicsSection;
