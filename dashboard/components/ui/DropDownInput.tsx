import { ChevronDown } from "lucide-react-native";
import { View, TouchableOpacity, ViewStyle, Text } from "react-native";
import {
  DropdownInputProps,
  DropdownItemProps,
} from "react-native-paper-dropdown";


export const DropDownInput = ({
  selectedLabel,
  placeholder,
  error,
}: DropdownInputProps) => {
  const isPlaceholder = !selectedLabel;
  const displayText = selectedLabel ?? placeholder ?? "";

  return (
    <View
      className={`bg-gray-50 rounded-lg px-4 py-3 border flex-row items-center justify-between ${
        error ? "border-red-500" : "border-gray-300"
      }`}
    >
      <Text
        className={`text-sm ${
          isPlaceholder ? "text-gray-500" : "text-gray-900"
        }`}
        numberOfLines={1}
      >
        {displayText}
      </Text>
      <ChevronDown color="#6b7280" size={18} />
    </View>
  );
};

export const DropdownItem = ({
  option,
  value,
  onSelect,
  toggleMenu,
  isLast,
  menuItemTestID,
  width: _width,
}: DropdownItemProps) => {
  const isSelected = value === option.value;

  return (
    <TouchableOpacity
      testID={menuItemTestID}
      onPress={() => {
        onSelect?.(option.value);
        toggleMenu();
      }}
      className={`px-4 py-3 ${isLast ? "" : "border-b border-gray-100"} ${
        isSelected ? "bg-emerald-50" : "bg-white"
      }`}
    >
      <Text
        className={`text-gray-900 ${isSelected ? "font-semibold" : ""}`}
        numberOfLines={1}
      >
        {option.label}
      </Text>
    </TouchableOpacity>
  );
};

export const dropdownMenuContentStyle: ViewStyle = {
  backgroundColor: "#ffffff",
  borderWidth: 1,
  borderColor: "#d1d5db",
  borderRadius: 12,
  paddingVertical: 0,
};
