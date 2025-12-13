import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Filter, Search, ChevronDown, ChevronUp, X } from "lucide-react-native";
import {
  BatchStatusFilter,
  displayDateValue,
  getStatusLabel,
} from "./helpers";

type BatchFiltersProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: BatchStatusFilter;
  onStatusChange: (status: BatchStatusFilter) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  harvestFrom: string;
  harvestTo: string;
  onHarvestFromChange: (value: string) => void;
  onHarvestToChange: (value: string) => void;
  normalizedHarvestFrom?: string;
  normalizedHarvestTo?: string;
  onClearHarvestFrom: () => void;
  onClearHarvestTo: () => void;
  onClearStatusFilter: () => void;
};

const BatchFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  showFilters,
  onToggleFilters,
  harvestFrom,
  harvestTo,
  onHarvestFromChange,
  onHarvestToChange,
  normalizedHarvestFrom,
  normalizedHarvestTo,
  onClearHarvestFrom,
  onClearHarvestTo,
  onClearStatusFilter,
}: BatchFiltersProps) => {
  const isWeb = Platform.OS === "web";
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const onChangeFrom = (_: any, date?: Date) => {
    setShowFromPicker(false);
    if (date) {
      onHarvestFromChange(date.toISOString().split("T")[0]);
    }
  };

  const onChangeTo = (_: any, date?: Date) => {
    setShowToPicker(false);
    if (date) {
      onHarvestToChange(date.toISOString().split("T")[0]);
    }
  };

  return (
    <View className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
      <View className="flex-row items-center gap-3 mb-4">
        <View className="flex-1 flex-row items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200 shadow-sm">
          <Search color="#9ca3af" size={20} />
          <TextInput
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Search produce, farm, or batch ID"
            className="flex-1 text-gray-900 text-sm"
            placeholderTextColor="#9ca3af"
          />
        </View>
        <TouchableOpacity
          onPress={onToggleFilters}
          className="flex-row items-center gap-1 px-3 h-10 bg-orange-50 rounded-lg border border-orange-200"
        >
          <Filter color="#ea580c" size={18} />
          {showFilters ? (
            <ChevronUp color="#ea580c" size={16} />
          ) : (
            <ChevronDown color="#ea580c" size={16} />
          )}
          <Text className="text-orange-700 text-xs font-semibold">Filters</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
        <View className="flex-row gap-2">
          {[
            { key: "ALL", label: "All" },
            { key: "IN_TRANSIT", label: "In Transit" },
            { key: "ARRIVED", label: "Arrived" },
            { key: "RETAILER_VERIFIED", label: "Verified" },
            { key: "ARCHIVED", label: "Archived" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onStatusChange(tab.key as BatchStatusFilter)}
              className={`px-4 py-2 rounded-full border ${
                statusFilter === tab.key
                  ? "bg-orange-50 border-orange-500"
                  : "bg-white border-gray-300"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  statusFilter === tab.key ? "text-orange-700" : "text-gray-700"
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
          <View className="flex-row gap-2 mb-1">
            <View className="flex-1">
              <Text className="text-gray-500 text-xs mb-1">Harvest From</Text>
              {isWeb ? (
                <View className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <input
                    type="date"
                    value={harvestFrom}
                    onChange={(e) => onHarvestFromChange(e.target.value)}
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
                    {displayDateValue(harvestFrom)}
                  </Text>
                </TouchableOpacity>
              )}
              {!isWeb && showFromPicker && (
                <DateTimePicker
                  value={harvestFrom ? new Date(harvestFrom) : new Date()}
                  mode="date"
                  display="default"
                  onChange={onChangeFrom}
                />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs mb-1">Harvest To</Text>
              {isWeb ? (
                <View className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <input
                    type="date"
                    value={harvestTo}
                    onChange={(e) => onHarvestToChange(e.target.value)}
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
                    {displayDateValue(harvestTo)}
                  </Text>
                </TouchableOpacity>
              )}
              {!isWeb && showToPicker && (
                <DateTimePicker
                  value={harvestTo ? new Date(harvestTo) : new Date()}
                  mode="date"
                  display="default"
                  onChange={onChangeTo}
                />
              )}
            </View>
          </View>
        </View>
      )}

      <View className="flex-row flex-wrap gap-2 mb-1">
        {statusFilter !== "ALL" && (
          <TouchableOpacity
            onPress={onClearStatusFilter}
            className="flex-row items-center gap-1 px-3 py-1.5 bg-orange-50 rounded-full border border-orange-200"
          >
            <Text className="text-xs text-orange-700 font-semibold">
              {getStatusLabel(statusFilter)}
            </Text>
            <X color="#ea580c" size={14} />
          </TouchableOpacity>
        )}
        {normalizedHarvestFrom && (
          <TouchableOpacity
            onPress={onClearHarvestFrom}
            className="flex-row items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full border border-gray-300"
          >
            <Text className="text-xs text-gray-700 font-semibold">
              From {displayDateValue(harvestFrom)}
            </Text>
            <X color="#4b5563" size={14} />
          </TouchableOpacity>
        )}
        {normalizedHarvestTo && (
          <TouchableOpacity
            onPress={onClearHarvestTo}
            className="flex-row items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full border border-gray-300"
          >
            <Text className="text-xs text-gray-700 font-semibold">
              To {displayDateValue(harvestTo)}
            </Text>
            <X color="#4b5563" size={14} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default BatchFilters;
