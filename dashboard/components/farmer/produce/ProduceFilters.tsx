import { type FC, useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ChevronDown, ChevronUp, Filter, Search, X } from "lucide-react-native";
import { Dropdown } from "react-native-paper-dropdown";
import {
  DropDownInput,
  DropdownItem,
  dropdownMenuContentStyle,
} from "@/components/ui/DropDownInput";
import type { SortOption, StatusFilter } from "../farm-produce/types";

type ProduceFiltersProps = {
  isDesktop: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  sortOption: SortOption;
  onSortChange: (value: SortOption) => void;
  showFilters?: boolean;
  harvestFrom?: string;
  harvestTo?: string;
  normalizedHarvestFrom?: string;
  normalizedHarvestTo?: string;
  onToggleFilters?: () => void;
  onHarvestFromChange?: (value: string) => void;
  onHarvestToChange?: (value: string) => void;
  onClearHarvestFrom?: () => void;
  onClearHarvestTo?: () => void;
  onClearStatusFilter?: () => void;
};

export const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "DRAFT" },
  { label: "Pending Chain", value: "PENDING_CHAIN" },
  { label: "On-chain Confirmed", value: "ONCHAIN_CONFIRMED" },
  { label: "In Transit", value: "IN_TRANSIT" },
  { label: "Arrived", value: "ARRIVED" },
  { label: "Verified", value: "RETAILER_VERIFIED" },
  { label: "Archived", value: "ARCHIVED" },
];

export const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Harvest Date -> Newest", value: "harvest_desc" },
  { label: "Harvest Date -> Oldest", value: "harvest_asc" },
  { label: "Quantity -> High to Low", value: "quantity_desc" },
  { label: "Quantity -> Low to High", value: "quantity_asc" },
];

const formatDateValue = (value?: string) =>
  value?.trim() ? value.trim() : "Select date";

const getStatusLabel = (value: StatusFilter) =>
  STATUS_OPTIONS.find((option) => option.value === value)?.label ?? "All";

const getSortLabel = (value: SortOption) =>
  SORT_OPTIONS.find((option) => option.value === value)?.label ??
  "Harvest Date -> Newest";

const ProduceFilters: FC<ProduceFiltersProps> = ({
  isDesktop,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortOption,
  onSortChange,
  showFilters,
  harvestFrom,
  harvestTo,
  normalizedHarvestFrom,
  normalizedHarvestTo,
  onToggleFilters,
  onHarvestFromChange,
  onHarvestToChange,
  onClearHarvestFrom,
  onClearHarvestTo,
  onClearStatusFilter,
}) => {
  const isWeb = Platform.OS === "web";
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const filtersOpen = onToggleFilters ? Boolean(showFilters) : true;
  const hasDateFilters = Boolean(onHarvestFromChange || onHarvestToChange);

  const clearStatus = onClearStatusFilter ?? (() => onStatusChange("all"));
  const clearFrom =
    onClearHarvestFrom ??
    (() => {
      if (onHarvestFromChange) onHarvestFromChange("");
    });
  const clearTo =
    onClearHarvestTo ??
    (() => {
      if (onHarvestToChange) onHarvestToChange("");
    });

  const handleFromChange = (_: any, date?: Date) => {
    setShowFromPicker(false);
    if (date && onHarvestFromChange) {
      onHarvestFromChange(date.toISOString().split("T")[0]);
    }
  };

  const handleToChange = (_: any, date?: Date) => {
    setShowToPicker(false);
    if (date && onHarvestToChange) {
      onHarvestToChange(date.toISOString().split("T")[0]);
    }
  };

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
      <View className="flex-row items-center gap-3 mb-4">
        <View className="flex-1 flex-row items-center gap-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 shadow-sm">
          <Search color="#9ca3af" size={20} />
          <TextInput
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Search produce, farm, or batch ID"
            className="flex-1 text-gray-900 text-sm"
            placeholderTextColor="#9ca3af"
          />
        </View>
        {onToggleFilters ? (
          <TouchableOpacity
            onPress={onToggleFilters}
            className="flex-row items-center gap-1 px-3 h-10 bg-emerald-50 rounded-lg border border-emerald-200"
          >
            <Filter color="#047857" size={18} />
            {filtersOpen ? (
              <ChevronUp color="#047857" size={16} />
            ) : (
              <ChevronDown color="#047857" size={16} />
            )}
            <Text className="text-emerald-700 text-xs font-semibold">
              Filters
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-3"
      >
        <View className="flex-row gap-2">
          {STATUS_OPTIONS.map((tab) => (
            <TouchableOpacity
              key={tab.value}
              onPress={() => onStatusChange(tab.value)}
              className={`px-4 py-2 rounded-full border ${
                statusFilter === tab.value
                  ? "bg-emerald-50 border-emerald-500"
                  : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  statusFilter === tab.value
                    ? "text-emerald-700"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {(filtersOpen || !onToggleFilters) && (
        <View className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 mb-2 shadow-sm">
          <Text className="text-gray-900 dark:text-gray-100 text-xs font-bold mb-3">
            Advanced Filters
          </Text>
          <View
            className={`${
              isDesktop ? "flex-row items-end gap-3" : "gap-3"
            }`}
          >
            {hasDateFilters && (
              <View className={`${isDesktop ? "flex-row flex-1 gap-2" : "gap-2"}`}>
                {onHarvestFromChange ? (
                  <View className="flex-1">
                    <Text className="text-gray-500 text-xs mb-1">
                      Harvest From
                    </Text>
                    {isWeb ? (
                      <View className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2">
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
                        className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2"
                      >
                        <Text className="text-gray-900 dark:text-gray-100 text-sm">
                          {formatDateValue(harvestFrom)}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {!isWeb && showFromPicker && (
                      <DateTimePicker
                        value={harvestFrom ? new Date(harvestFrom) : new Date()}
                        mode="date"
                        display="default"
                        onChange={handleFromChange}
                      />
                    )}
                  </View>
                ) : null}

                {onHarvestToChange ? (
                  <View className="flex-1">
                    <Text className="text-gray-500 text-xs mb-1">
                      Harvest To
                    </Text>
                    {isWeb ? (
                      <View className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2">
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
                        className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2"
                      >
                        <Text className="text-gray-900 dark:text-gray-100 text-sm">
                          {formatDateValue(harvestTo)}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {!isWeb && showToPicker && (
                      <DateTimePicker
                        value={harvestTo ? new Date(harvestTo) : new Date()}
                        mode="date"
                        display="default"
                        onChange={handleToChange}
                      />
                    )}
                  </View>
                ) : null}
              </View>
            )}

            <View className={isDesktop ? "min-w-[220px]" : "w-full"}>
              <Text className="text-gray-500 text-xs mb-1">Sort by</Text>
              <Dropdown
                mode="outlined"
                placeholder="Sort batches"
                value={sortOption}
                options={SORT_OPTIONS.map((option) => ({
                  label: option.label,
                  value: option.value,
                }))}
                onSelect={(value) =>
                  onSortChange((value as SortOption | null) ?? "harvest_desc")
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

      <View className="flex-row flex-wrap gap-2 mt-1">
        {statusFilter !== "all" && (
          <TouchableOpacity
            onPress={clearStatus}
            className="flex-row items-center gap-1 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-200"
          >
            <Text className="text-xs text-emerald-700 font-semibold">
              {getStatusLabel(statusFilter)}
            </Text>
            <X color="#047857" size={14} />
          </TouchableOpacity>
        )}

        {normalizedHarvestFrom && (
          <TouchableOpacity
            onPress={clearFrom}
            className="flex-row items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full border border-gray-300 dark:border-gray-600"
          >
            <Text className="text-xs text-gray-700 font-semibold">
              From {formatDateValue(harvestFrom)}
            </Text>
            <X color="#4b5563" size={14} />
          </TouchableOpacity>
        )}

        {normalizedHarvestTo && (
          <TouchableOpacity
            onPress={clearTo}
            className="flex-row items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full border border-gray-300 dark:border-gray-600"
          >
            <Text className="text-xs text-gray-700 font-semibold">
              To {formatDateValue(harvestTo)}
            </Text>
            <X color="#4b5563" size={14} />
          </TouchableOpacity>
        )}

        {sortOption !== "harvest_desc" && (
          <TouchableOpacity
            onPress={() => onSortChange("harvest_desc")}
            className="flex-row items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-700 rounded-full border border-gray-300 dark:border-gray-600"
          >
            <Text className="text-xs text-gray-700 font-semibold">
              {getSortLabel(sortOption)}
            </Text>
            <X color="#4b5563" size={14} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ProduceFilters;
