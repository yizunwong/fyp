import { FC } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { CheckCircle, Search } from "lucide-react-native";
import { Dropdown } from "react-native-paper-dropdown";
import {
  DropDownInput,
  DropdownItem,
  dropdownMenuContentStyle,
} from "@/components/ui/DropDownInput";

type FarmOption = {
  id: string;
  name: string;
};

interface ProduceFiltersProps {
  isDesktop: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  farms: FarmOption[];
  selectedFarm: string;
  onSelectFarm: (farmId: string) => void;
  showVerifiedOnly: boolean;
  onToggleVerified: () => void;
}

const ProduceFilters: FC<ProduceFiltersProps> = ({
  isDesktop,
  searchQuery,
  onSearchChange,
  farms,
  selectedFarm,
  onSelectFarm,
  showVerifiedOnly,
  onToggleVerified,
}) => {
  const dropdownOptions = [
    { label: "All Farms", value: "all" },
    ...farms.map((farm) => ({
      label: farm.name,
      value: farm.id,
    })),
  ];

  return (
    <View className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
      <View className={`gap-3 ${isDesktop ? "flex-row items-center" : ""}`}>
        <View
          className={`flex-row items-center bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 ${
            isDesktop ? "flex-1" : "mb-3"
          }`}
        >
          <Search color="#9ca3af" size={20} />
          <TextInput
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Search by batch ID or produce name"
            className="flex-1 ml-3 text-gray-900 text-[15px]"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View className={`flex-row gap-3 ${isDesktop ? "" : "flex-wrap"}`}>
          <View className="relative flex-1 min-w-[150px]">
            <Dropdown
              mode="outlined"
              placeholder="Choose a farm..."
              value={selectedFarm === "all" ? "" : selectedFarm}
              onSelect={(farmId) => onSelectFarm(farmId ?? "all")}
              options={dropdownOptions}
              CustomDropdownInput={DropDownInput}
              CustomDropdownItem={DropdownItem}
              menuContentStyle={dropdownMenuContentStyle}
              hideMenuHeader
            />
          </View>

          <TouchableOpacity
            onPress={onToggleVerified}
            className={`flex-row items-center gap-2 px-4 py-3 rounded-lg border ${
              showVerifiedOnly
                ? "bg-emerald-50 border-emerald-500"
                : "bg-white border-gray-300"
            }`}
          >
            <CheckCircle
              color={showVerifiedOnly ? "#059669" : "#6b7280"}
              size={20}
            />
            <Text
              className={`text-[15px] font-medium ${
                showVerifiedOnly ? "text-emerald-700" : "text-gray-700"
              }`}
            >
              Verified Only
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ProduceFilters;
