import { useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  X,
} from "lucide-react-native";
import { Dropdown } from "react-native-paper-dropdown";
import type { FarmListRespondDtoVerificationStatus } from "@/api";
import {
  DropDownInput,
  DropdownItem,
  dropdownMenuContentStyle,
} from "@/components/ui/DropDownInput";
import { FARM_CATEGORY_OPTIONS, getFarmCategoryLabel } from "@/constants/farm";
import { FARM_SIZE_UNIT_LABELS, FARM_SIZE_UNITS } from "@/validation/farm";

export type FarmStatusFilter = "all" | FarmListRespondDtoVerificationStatus;
export type FarmSizeUnitFilter = "ALL" | (typeof FARM_SIZE_UNITS)[number];

type FarmFiltersProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: FarmStatusFilter;
  onStatusChange: (value: FarmStatusFilter) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  category: string;
  onCategoryChange: (value: string) => void;
  sizeUnit: FarmSizeUnitFilter;
  onSizeUnitChange: (value: FarmSizeUnitFilter) => void;
  minSize: string;
  maxSize: string;
  onMinSizeChange: (value: string) => void;
  onMaxSizeChange: (value: string) => void;
  onClearStatusFilter: () => void;
  onClearCategory: () => void;
  onClearSizeRange: () => void;
  onClearSizeUnit: () => void;
};

const STATUS_TABS: { key: FarmStatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "VERIFIED", label: "Verified" },
  { key: "PENDING", label: "Pending" },
  { key: "REJECTED", label: "Rejected" },
];

export function FarmFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  showFilters,
  onToggleFilters,
  category,
  onCategoryChange,
  sizeUnit,
  onSizeUnitChange,
  minSize,
  maxSize,
  onMinSizeChange,
  onMaxSizeChange,
  onClearStatusFilter,
  onClearCategory,
  onClearSizeRange,
  onClearSizeUnit,
}: FarmFiltersProps) {
  const hasSizeFilter = useMemo(
    () => !!minSize.trim() || !!maxSize.trim(),
    [minSize, maxSize]
  );
  const categoryOptions = useMemo(
    () =>
      [
        { label: "All categories", value: "" },
        ...FARM_CATEGORY_OPTIONS.map((option) => ({
          label: getFarmCategoryLabel(option),
          value: option,
        })),
      ] as { label: string; value: string }[],
    []
  );

  const sizeUnitOptions = useMemo(
    () =>
      [
        { label: "Any unit", value: "ALL" },
        ...FARM_SIZE_UNITS.map((unit) => ({
          label: FARM_SIZE_UNIT_LABELS[unit],
          value: unit,
        })),
      ] as { label: string; value: FarmSizeUnitFilter }[],
    []
  );

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-4">
      <View className="flex-row items-center gap-3 mb-4">
        <View className="flex-1 flex-row items-center gap-2 bg-white dark:bg-gray-700 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-600 shadow-sm">
          <Search color="#9ca3af" size={20} />
          <TextInput
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Search farms by name or location"
            className="flex-1 text-gray-900 dark:text-gray-100 text-sm"
            placeholderTextColor="#9ca3af"
          />
        </View>
        <TouchableOpacity
          onPress={onToggleFilters}
          className="flex-row items-center gap-1 px-3 h-10 bg-emerald-50 rounded-lg border border-emerald-200"
        >
          <Filter color="#047857" size={18} />
          {showFilters ? (
            <ChevronUp color="#047857" size={16} />
          ) : (
            <ChevronDown color="#047857" size={16} />
          )}
          <Text className="text-emerald-700 text-xs font-semibold">
            Advanced
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
        <View className="flex-row gap-2">
          {STATUS_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onStatusChange(tab.key)}
              className={`px-4 py-2 rounded-full border ${
                statusFilter === tab.key
                  ? "bg-emerald-50 border-emerald-500"
                  : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  statusFilter === tab.key 
                    ? "text-emerald-700 dark:text-emerald-400" 
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {showFilters && (
        <View className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 mb-2 shadow-sm">
          <Text className="text-gray-900 dark:text-gray-100 text-xs font-bold mb-3">
            Advanced Filters
          </Text>

          <View className="flex-row gap-2 mb-3">
            <View className="flex-1">
              <Text className="text-gray-500 text-xs mb-1">Min Size</Text>
              <TextInput
                value={minSize}
                onChangeText={onMinSizeChange}
                placeholder="e.g. 5"
                keyboardType="numeric"
                className="bg-gray-50 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                placeholderTextColor="#9ca3af"
              />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs mb-1">Max Size</Text>
              <TextInput
                value={maxSize}
                onChangeText={onMaxSizeChange}
                placeholder="e.g. 100"
                keyboardType="numeric"
                className="bg-gray-50 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <View className="flex-row gap-2">
            <View className="flex-1">
              <Text className="text-gray-500 text-xs mb-1">
                Category (produce grown)
              </Text>
              <Dropdown
                mode="outlined"
                placeholder="Select category"
                value={category}
                options={categoryOptions}
                onSelect={(value) => onCategoryChange((value ?? "") as string)}
                CustomDropdownInput={DropDownInput}
                CustomDropdownItem={DropdownItem}
                menuContentStyle={dropdownMenuContentStyle}
                hideMenuHeader
              />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs mb-1">Size Unit</Text>
              <Dropdown
                mode="outlined"
                placeholder="Any unit"
                value={sizeUnit}
                options={sizeUnitOptions}
                onSelect={(value) =>
                  onSizeUnitChange(
                    ((value ?? "ALL") as FarmSizeUnitFilter) || "ALL"
                  )
                }
                CustomDropdownInput={DropDownInput}
                CustomDropdownItem={DropdownItem}
                menuContentStyle={dropdownMenuContentStyle}
                hideMenuHeader
              />
            </View>
          </View>
        </View>
      )}

      <View className="flex-row flex-wrap gap-2 mb-1">
        {statusFilter !== "all" && (
          <TouchableOpacity
            onPress={onClearStatusFilter}
            className="flex-row items-center gap-1 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-200"
          >
            <Text className="text-xs text-emerald-700 font-semibold">
              {STATUS_TABS.find((tab) => tab.key === statusFilter)?.label ??
                "Status"}
            </Text>
            <X color="#047857" size={14} />
          </TouchableOpacity>
        )}

        {hasSizeFilter && (
          <TouchableOpacity
            onPress={onClearSizeRange}
            className="flex-row items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full border border-gray-300 dark:border-gray-600"
          >
            <Text className="text-xs text-gray-700 dark:text-gray-300 font-semibold">
              Size {minSize ? `from ${minSize}` : ""} {maxSize ? `to ${maxSize}` : ""}
            </Text>
            <X color="#4b5563" size={14} />
          </TouchableOpacity>
        )}

        {sizeUnit !== "ALL" && (
          <TouchableOpacity
            onPress={onClearSizeUnit}
            className="flex-row items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full border border-gray-300 dark:border-gray-600"
          >
            <Text className="text-xs text-gray-700 dark:text-gray-300 font-semibold">
              Unit: {FARM_SIZE_UNIT_LABELS[sizeUnit]}
            </Text>
            <X color="#4b5563" size={14} />
          </TouchableOpacity>
        )}

        {category.trim().length > 0 && (
          <TouchableOpacity
            onPress={onClearCategory}
            className="flex-row items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full border border-gray-300 dark:border-gray-600"
          >
            <Text className="text-xs text-gray-700 dark:text-gray-300 font-semibold">
              Category: {getFarmCategoryLabel(category)}
            </Text>
            <X color="#4b5563" size={14} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default FarmFilters;
