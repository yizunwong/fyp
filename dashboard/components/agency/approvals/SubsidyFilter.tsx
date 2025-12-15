import { type FC, useState } from "react";
import {
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ChevronDown, ChevronUp, Filter, Search, X } from "lucide-react-native";
import { SubsidyResponseDtoStatus } from "@/api";

type SubsidyFilterProps = {
  searchProgramName: string;
  onSearchChange: (value: string) => void;
  statusFilter: SubsidyResponseDtoStatus | "all";
  onStatusFilterChange: (value: SubsidyResponseDtoStatus | "all") => void;
  appliedDateFrom: string;
  appliedDateTo: string;
  normalizedAppliedDateFrom: string;
  normalizedAppliedDateTo: string;
  onAppliedDateFromChange: (value: string) => void;
  onAppliedDateToChange: (value: string) => void;
  amountMin: string;
  amountMax: string;
  onAmountMinChange: (value: string) => void;
  onAmountMaxChange: (value: string) => void;
  onClearStatusFilter: () => void;
  onClearAppliedDateFrom: () => void;
  onClearAppliedDateTo: () => void;
  onClearAmountMin: () => void;
  onClearAmountMax: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
};

const formatDateValue = (value?: string) =>
  value?.trim() ? value.trim() : "Select date";

export const SubsidyFilter: FC<SubsidyFilterProps> = ({
  searchProgramName,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  appliedDateFrom,
  appliedDateTo,
  normalizedAppliedDateFrom,
  normalizedAppliedDateTo,
  onAppliedDateFromChange,
  onAppliedDateToChange,
  amountMin,
  amountMax,
  onAmountMinChange,
  onAmountMaxChange,
  onClearStatusFilter,
  onClearAppliedDateFrom,
  onClearAppliedDateTo,
  onClearAmountMin,
  onClearAmountMax,
  showFilters,
  onToggleFilters,
}) => {
  const isWeb = Platform.OS === "web";
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const handleFromChange = (_: any, date?: Date) => {
    setShowFromPicker(false);
    if (date) {
      onAppliedDateFromChange(date.toISOString().split("T")[0]);
    }
  };

  const handleToChange = (_: any, date?: Date) => {
    setShowToPicker(false);
    if (date) {
      onAppliedDateToChange(date.toISOString().split("T")[0]);
    }
  };

  return (
    <View className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm mb-4">
      <View className="flex-row items-center gap-3 mb-4">
        <View className="flex-1 flex-row items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200 shadow-sm">
          <Search color="#9ca3af" size={20} />
          <TextInput
            value={searchProgramName}
            onChangeText={onSearchChange}
            placeholder="Search by program name"
            className="flex-1 text-gray-900 text-sm"
            placeholderTextColor="#9ca3af"
          />
        </View>
        <TouchableOpacity
          onPress={onToggleFilters}
          className="flex-row items-center gap-1 px-3 h-10 bg-blue-50 rounded-lg border border-blue-200"
        >
          <Filter color="#2563eb" size={18} />
          {showFilters ? (
            <ChevronUp color="#2563eb" size={16} />
          ) : (
            <ChevronDown color="#2563eb" size={16} />
          )}
          <Text className="text-blue-700 text-xs font-semibold">Filters</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
        <View className="flex-row gap-2">
          {[
            { key: "all", label: "All" },
            { key: SubsidyResponseDtoStatus.PENDING, label: "Pending" },
            { key: SubsidyResponseDtoStatus.APPROVED, label: "Approved" },
            { key: SubsidyResponseDtoStatus.REJECTED, label: "Rejected" },
            { key: SubsidyResponseDtoStatus.DISBURSED, label: "Disbursed" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() =>
                onStatusFilterChange(tab.key as SubsidyResponseDtoStatus | "all")
              }
              className={`px-4 py-2 rounded-full border ${
                statusFilter === tab.key
                  ? "bg-blue-50 border-blue-500"
                  : "bg-white border-gray-300"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  statusFilter === tab.key ? "text-blue-700" : "text-gray-700"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {showFilters && (
        <View className="bg-white border border-gray-200 rounded-lg p-3 mb-2 shadow-sm">
          <Text className="text-gray-900 text-xs font-bold mb-3">
            Advanced Filters
          </Text>
          <View className="flex-row gap-2 mb-3">
            <View className="flex-1">
              <Text className="text-gray-500 text-xs mb-1">Applied Date From</Text>
              {isWeb ? (
                <View className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <input
                    type="date"
                    value={appliedDateFrom}
                    onChange={(e) => onAppliedDateFromChange(e.target.value)}
                    className="text-gray-900 text-sm bg-transparent outline-none w-full"
                    style={{ border: "none", padding: 0 }}
                  />
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setShowFromPicker(true)}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                >
                  <Text className="text-gray-900 text-sm">
                    {formatDateValue(appliedDateFrom)}
                  </Text>
                </TouchableOpacity>
              )}
              {!isWeb && showFromPicker && (
                <DateTimePicker
                  value={appliedDateFrom ? new Date(appliedDateFrom) : new Date()}
                  mode="date"
                  display="default"
                  onChange={handleFromChange}
                />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs mb-1">Applied Date To</Text>
              {isWeb ? (
                <View className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <input
                    type="date"
                    value={appliedDateTo}
                    onChange={(e) => onAppliedDateToChange(e.target.value)}
                    className="text-gray-900 text-sm bg-transparent outline-none w-full"
                    style={{ border: "none", padding: 0 }}
                  />
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setShowToPicker(true)}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                >
                  <Text className="text-gray-900 text-sm">
                    {formatDateValue(appliedDateTo)}
                  </Text>
                </TouchableOpacity>
              )}
              {!isWeb && showToPicker && (
                <DateTimePicker
                  value={appliedDateTo ? new Date(appliedDateTo) : new Date()}
                  mode="date"
                  display="default"
                  onChange={handleToChange}
                />
              )}
            </View>
          </View>
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Text className="text-gray-500 text-xs mb-1">Min Amount (ETH)</Text>
              <TextInput
                value={amountMin}
                onChangeText={onAmountMinChange}
                placeholder="0.00001"
                keyboardType="decimal-pad"
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm"
                placeholderTextColor="#9ca3af"
              />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs mb-1">Max Amount (ETH)</Text>
              <TextInput
                value={amountMax}
                onChangeText={onAmountMaxChange}
                placeholder="100.0"
                keyboardType="decimal-pad"
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
        </View>
      )}

      <View className="flex-row flex-wrap gap-2 mb-1">
        {statusFilter !== "all" && (
          <TouchableOpacity
            onPress={onClearStatusFilter}
            className="flex-row items-center gap-1 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-200"
          >
            <Text className="text-xs text-blue-700 font-semibold capitalize">
              {statusFilter}
            </Text>
            <X color="#2563eb" size={14} />
          </TouchableOpacity>
        )}
        {normalizedAppliedDateFrom && (
          <TouchableOpacity
            onPress={onClearAppliedDateFrom}
            className="flex-row items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full border border-gray-300"
          >
            <Text className="text-xs text-gray-700 font-semibold">
              From {normalizedAppliedDateFrom}
            </Text>
            <X color="#4b5563" size={14} />
          </TouchableOpacity>
        )}
        {normalizedAppliedDateTo && (
          <TouchableOpacity
            onPress={onClearAppliedDateTo}
            className="flex-row items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full border border-gray-300"
          >
            <Text className="text-xs text-gray-700 font-semibold">
              To {normalizedAppliedDateTo}
            </Text>
            <X color="#4b5563" size={14} />
          </TouchableOpacity>
        )}
        {amountMin && (
          <TouchableOpacity
            onPress={onClearAmountMin}
            className="flex-row items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full border border-gray-300"
          >
            <Text className="text-xs text-gray-700 font-semibold">
              Min: {amountMin} ETH
            </Text>
            <X color="#4b5563" size={14} />
          </TouchableOpacity>
        )}
        {amountMax && (
          <TouchableOpacity
            onPress={onClearAmountMax}
            className="flex-row items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full border border-gray-300"
          >
            <Text className="text-xs text-gray-700 font-semibold">
              Max: {amountMax} ETH
            </Text>
            <X color="#4b5563" size={14} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

