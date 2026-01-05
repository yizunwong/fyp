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
import { ProgramResponseDtoStatus } from "@/api";

type ProgramFilterProps = {
  searchName: string;
  onSearchChange: (value: string) => void;
  statusFilter: ProgramResponseDtoStatus | "all";
  onStatusFilterChange: (value: ProgramResponseDtoStatus | "all") => void;
  activeFrom: string;
  activeTo: string;
  normalizedActiveFrom: string;
  normalizedActiveTo: string;
  onActiveFromChange: (value: string) => void;
  onActiveToChange: (value: string) => void;
  onClearStatusFilter: () => void;
  onClearActiveFrom: () => void;
  onClearActiveTo: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
};

const formatDateValue = (value?: string) =>
  value?.trim() ? value.trim() : "Select date";

export const ProgramFilter: FC<ProgramFilterProps> = ({
  searchName,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  activeFrom,
  activeTo,
  normalizedActiveFrom,
  normalizedActiveTo,
  onActiveFromChange,
  onActiveToChange,
  onClearStatusFilter,
  onClearActiveFrom,
  onClearActiveTo,
  showFilters,
  onToggleFilters,
}) => {
  const isWeb = Platform.OS === "web";
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const handleFromChange = (_: any, date?: Date) => {
    setShowFromPicker(false);
    if (date) {
      onActiveFromChange(date.toISOString().split("T")[0]);
    }
  };

  const handleToChange = (_: any, date?: Date) => {
    setShowToPicker(false);
    if (date) {
      onActiveToChange(date.toISOString().split("T")[0]);
    }
  };

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
      <View className="flex-row items-center gap-3 mb-4">
        <View className="flex-1 flex-row items-center gap-2 bg-white dark:bg-gray-700 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-600 shadow-sm">
          <Search color="#9ca3af" size={20} />
          <TextInput
            value={searchName}
            onChangeText={onSearchChange}
            placeholder="Search by program name"
            className="flex-1 text-gray-900 dark:text-gray-100 text-sm"
            placeholderTextColor="#9ca3af"
          />
        </View>
        <TouchableOpacity
          onPress={onToggleFilters}
          className="flex-row items-center gap-1 px-3 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <Filter color="#2563eb" size={18} />
          {showFilters ? (
            <ChevronUp color="#2563eb" size={16} />
          ) : (
            <ChevronDown color="#2563eb" size={16} />
          )}
          <Text className="text-blue-700 dark:text-blue-300 text-xs font-semibold">Filters</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
        <View className="flex-row gap-2">
          {[
            { key: "all", label: "All" },
            { key: ProgramResponseDtoStatus.active, label: "Active" },
            { key: ProgramResponseDtoStatus.draft, label: "Draft" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() =>
                onStatusFilterChange(tab.key as ProgramResponseDtoStatus | "all")
              }
              className={`px-4 py-2 rounded-full border ${
                statusFilter === tab.key
                  ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-600"
                  : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  statusFilter === tab.key ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"
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
            Active Period
          </Text>
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Text className="text-gray-500 dark:text-gray-400 text-xs mb-1">From</Text>
              {isWeb ? (
                <View className="bg-gray-50 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg px-3 py-2">
                  <input
                    type="date"
                    value={activeFrom}
                    onChange={(e) => onActiveFromChange(e.target.value)}
                    className="text-gray-900 dark:text-gray-100 text-sm bg-transparent outline-none w-full"
                    style={{ border: "none", padding: 0 }}
                  />
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setShowFromPicker(true)}
                  className="bg-gray-50 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg px-3 py-2"
                >
                  <Text className="text-gray-900 dark:text-gray-100 text-sm">
                    {formatDateValue(activeFrom)}
                  </Text>
                </TouchableOpacity>
              )}
              {!isWeb && showFromPicker && (
                <DateTimePicker
                  value={activeFrom ? new Date(activeFrom) : new Date()}
                  mode="date"
                  display="default"
                  onChange={handleFromChange}
                />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 dark:text-gray-400 text-xs mb-1">To</Text>
              {isWeb ? (
                <View className="bg-gray-50 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg px-3 py-2">
                  <input
                    type="date"
                    value={activeTo}
                    onChange={(e) => onActiveToChange(e.target.value)}
                    className="text-gray-900 dark:text-gray-100 text-sm bg-transparent outline-none w-full"
                    style={{ border: "none", padding: 0 }}
                  />
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setShowToPicker(true)}
                  className="bg-gray-50 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg px-3 py-2"
                >
                  <Text className="text-gray-900 dark:text-gray-100 text-sm">
                    {formatDateValue(activeTo)}
                  </Text>
                </TouchableOpacity>
              )}
              {!isWeb && showToPicker && (
                <DateTimePicker
                  value={activeTo ? new Date(activeTo) : new Date()}
                  mode="date"
                  display="default"
                  onChange={handleToChange}
                />
              )}
            </View>
          </View>
        </View>
      )}

      <View className="flex-row flex-wrap gap-2 mb-1">
        {statusFilter !== "all" && (
          <TouchableOpacity
            onPress={onClearStatusFilter}
            className="flex-row items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-200 dark:border-blue-800"
          >
            <Text className="text-xs text-blue-700 dark:text-blue-300 font-semibold capitalize">
              {statusFilter}
            </Text>
            <X color="#2563eb" size={14} />
          </TouchableOpacity>
        )}
        {normalizedActiveFrom && (
          <TouchableOpacity
            onPress={onClearActiveFrom}
            className="flex-row items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full border border-gray-300 dark:border-gray-600"
          >
            <Text className="text-xs text-gray-700 dark:text-gray-300 font-semibold">
              From {normalizedActiveFrom}
            </Text>
            <X color="#4b5563" size={14} />
          </TouchableOpacity>
        )}
        {normalizedActiveTo && (
          <TouchableOpacity
            onPress={onClearActiveTo}
            className="flex-row items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full border border-gray-300 dark:border-gray-600"
          >
            <Text className="text-xs text-gray-700 dark:text-gray-300 font-semibold">
              To {normalizedActiveTo}
            </Text>
            <X color="#4b5563" size={14} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
