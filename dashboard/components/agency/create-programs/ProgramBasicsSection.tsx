import { View, Text, TextInput, TouchableOpacity } from "react-native";
import type { CreateProgramDto, CreateProgramDtoType } from "@/api";
import { useEthToMyr } from "@/hooks/useEthToMyr";
import { formatEth, formatCurrency, ethToMyr } from "@/components/farmer/farm-produce/utils";

interface Props {
  programs: CreateProgramDto;
  onChange: (programs: CreateProgramDto) => void;
}

export function ProgramBasicsSection({ programs, onChange }: Props) {
  const { ethToMyr: ethToMyrRate } = useEthToMyr();

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
              {["drought", "flood", "crop_loss", "manual"].map((type) => (
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
            <TextInput
              value={programs.payoutRule?.amount.toString()}
              onChangeText={(text) => {
                const sanitized = text.replace(/[^0-9.]/g, "");
                updatePayout({
                  amount: parseFloat(sanitized) || 0,
                });
              }}
              placeholder="0.5"
              keyboardType="numeric"
              className="bg-white border border-blue-200 rounded-lg px-4 py-3 text-gray-900 text-sm"
              placeholderTextColor="#9ca3af"
            />
            {programs.payoutRule?.amount &&
              ethToMyrRate &&
              programs.payoutRule.amount > 0 && (
                <Text className="text-gray-500 text-[11px] mt-1">
                  ≈ {formatCurrency(ethToMyr(programs.payoutRule.amount, ethToMyrRate) ?? 0)}
                </Text>
              )}
          </View>
          <View className="flex-1">
            <Text className="text-gray-700 text-xs mb-1">Maximum Cap (ETH)</Text>
            <TextInput
              value={programs.payoutRule?.maxCap.toString()}
              onChangeText={(text) => {
                const sanitized = text.replace(/[^0-9.]/g, "");
                updatePayout({
                  maxCap: parseFloat(sanitized) || 0,
                });
              }}
              placeholder="1.5"
              keyboardType="numeric"
              className="bg-white border border-blue-200 rounded-lg px-4 py-3 text-gray-900 text-sm"
              placeholderTextColor="#9ca3af"
            />
            {programs.payoutRule?.maxCap &&
              ethToMyrRate &&
              programs.payoutRule.maxCap > 0 && (
                <Text className="text-gray-500 text-[11px] mt-1">
                  ≈ {formatCurrency(ethToMyr(programs.payoutRule.maxCap, ethToMyrRate) ?? 0)}
                </Text>
              )}
          </View>
        </View>
      </View>
    </>
  );
}

export default ProgramBasicsSection;
