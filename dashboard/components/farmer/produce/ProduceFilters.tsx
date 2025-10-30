import type { FC } from "react";
import { View, TextInput } from "react-native";
import { Search } from "lucide-react-native";
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
};

export const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: "All Statuses", value: "all" },
  { label: "Verified", value: "verified" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
];

export const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Harvest Date -> Newest", value: "harvest_desc" },
  { label: "Harvest Date -> Oldest", value: "harvest_asc" },
  { label: "Quantity -> High to Low", value: "quantity_desc" },
  { label: "Quantity -> Low to High", value: "quantity_asc" },
];

const ProduceFilters: FC<ProduceFiltersProps> = ({
  isDesktop,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortOption,
  onSortChange,
}) => (
  <View
    className={`gap-3 ${isDesktop ? "flex-row items-center mb-4" : "flex-col"}`}
  >
    <View className="flex-row items-center bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 flex-1">
      <Search color="#9ca3af" size={20} />
      <TextInput
        value={searchQuery}
        onChangeText={onSearchChange}
        placeholder="Search by produce name or batch ID"
        className="flex-1 ml-3 text-gray-900 text-[15px]"
        placeholderTextColor="#9ca3af"
      />
    </View>
    <View
      className={`flex-row ${
        isDesktop ? "gap-3 flex-none" : "gap-3 flex-wrap"
      }`}
    >
      <View className="relative min-w-[170px] flex-1">
        <Dropdown
          mode="outlined"
          placeholder="Blockchain status"
          value={statusFilter === "all" ? "" : statusFilter}
          options={STATUS_OPTIONS.map((option) => ({
            label: option.label,
            value: option.value,
          }))}
          onSelect={(value) =>
            onStatusChange((value as StatusFilter | null) ?? "all")
          }
          CustomDropdownInput={DropDownInput}
          CustomDropdownItem={DropdownItem}
          menuContentStyle={dropdownMenuContentStyle}
          hideMenuHeader
        />
      </View>
      <View className="relative min-w-[190px] flex-1">
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
);

export default ProduceFilters;
