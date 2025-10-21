import { Controller, useFormContext } from "react-hook-form";
import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { ViewStyle } from "react-native";
import { Calendar, ChevronDown, Plus } from "lucide-react-native";
import { Dropdown } from "react-native-paper-dropdown";
import type {
  DropdownInputProps,
  DropdownItemProps,
} from "react-native-paper-dropdown";
import {
  PRODUCE_UNIT_LABELS,
  type AddProduceFormData,
  type ProduceUnit,
} from "@/validation/produce";

export type AddProduceFarmOption = {
  id: string;
  name: string;
};

export type AddProduceUnitOption = {
  value: ProduceUnit;
};

interface AddProduceFormProps {
  farms: AddProduceFarmOption[];
  units: AddProduceUnitOption[];
  isDesktop?: boolean;
  onSubmit: (values: AddProduceFormData) => Promise<void> | void;
  onCancel: () => void;
}

const AddProduceDropdownInput = ({
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

const AddProduceDropdownItem = ({
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
      className={`px-4 py-3 ${
        isLast ? "" : "border-b border-gray-100"
      } ${isSelected ? "bg-emerald-50" : "bg-white"}`}
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

const dropdownMenuContentStyle: ViewStyle = {
  backgroundColor: "#ffffff",
  borderWidth: 1,
  borderColor: "#d1d5db",
  borderRadius: 12,
  paddingVertical: 0,
};

const AddProduceForm = ({
  farms,
  units,
  isDesktop,
  onSubmit,
  onCancel,
}: AddProduceFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useFormContext<AddProduceFormData>();

  const unitOptions = units.map((unit) => ({
    label: PRODUCE_UNIT_LABELS[unit.value],
    value: unit.value,
  }));
  const farmOptions = farms.map((farm) => ({
    label: farm.name,
    value: farm.id,
  }));

  return (
    <View className={isDesktop ? "flex-1 pr-6" : ""}>
      <View className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <Text className="text-gray-900 text-lg font-bold mb-4">
          General Information
        </Text>

        <View className="mb-4">
          <Text className="text-gray-700 text-sm font-semibold mb-2">
            Produce Name
          </Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="e.g., Organic Tomatoes"
                className={`bg-gray-50 rounded-lg px-4 py-3 text-gray-900 border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
            )}
          />
          {errors.name?.message && (
            <Text className="text-red-500 text-xs mt-1">
              {errors.name.message}
            </Text>
          )}
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 text-sm font-semibold mb-2">
            Harvest Date
          </Text>
          <View
            className={`flex-row items-center bg-gray-50 rounded-lg px-4 py-3 border ${
              errors.harvestDate ? "border-red-500" : "border-gray-300"
            }`}
          >
            <Calendar color="#6b7280" size={20} />
            <Controller
              control={control}
              name="harvestDate"
              render={({ field: { value, onChange } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="YYYY-MM-DD"
                  className="flex-1 ml-3 text-gray-900"
                />
              )}
            />
          </View>
          {errors.harvestDate?.message && (
            <Text className="text-red-500 text-xs mt-1">
              {errors.harvestDate.message}
            </Text>
          )}
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 text-sm font-semibold mb-2">
            Quantity
          </Text>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Controller
                control={control}
                name="quantity"
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="e.g., 520"
                    keyboardType="numeric"
                    className={`bg-gray-50 rounded-lg px-4 py-3 text-gray-900 border ${
                      errors.quantity ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                )}
              />
              {errors.quantity?.message && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.quantity.message}
                </Text>
              )}
            </View>

            <View className="w-36">
              <Controller
                control={control}
                name="unit"
                render={({ field: { value, onChange } }) => (
                  <Dropdown
                    mode="outlined"
                    placeholder="Select unit"
                    value={value ?? ""}
                    onSelect={(dropdownValue) =>
                      onChange(dropdownValue as ProduceUnit | undefined)
                    }
                    options={unitOptions}
                    error={!!errors.unit}
                    CustomDropdownInput={AddProduceDropdownInput}
                    CustomDropdownItem={AddProduceDropdownItem}
                    menuContentStyle={dropdownMenuContentStyle}
                    hideMenuHeader
                  />
                )}
              />
              {errors.unit?.message && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.unit.message}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 text-sm font-semibold mb-2">
            Select Farm
          </Text>
          <Controller
            control={control}
            name="farmId"
            render={({ field: { value, onChange } }) => (
              <Dropdown
                mode="outlined"
                placeholder="Choose a farm..."
                value={value ?? ""}
                onSelect={(dropdownValue) => onChange(dropdownValue ?? "")}
                options={farmOptions}
                error={!!errors.farmId}
                CustomDropdownInput={AddProduceDropdownInput}
                CustomDropdownItem={AddProduceDropdownItem}
                menuContentStyle={dropdownMenuContentStyle}
                hideMenuHeader
              />
            )}
          />
          {errors.farmId?.message && (
            <Text className="text-red-500 text-xs mt-1">
              {errors.farmId.message}
            </Text>
          )}
        </View>
      </View>

      <View className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <Text className="text-gray-900 text-lg font-bold mb-2">
          Certifications / Documents
        </Text>
        <Text className="text-gray-600 text-sm mb-4">Optional</Text>

        <TouchableOpacity className="border-2 border-dashed border-gray-300 rounded-lg py-6 items-center hover:border-emerald-500 hover:bg-emerald-50">
          <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mb-2">
            <Plus color="#6b7280" size={24} />
          </View>
          <Text className="text-gray-700 text-sm font-semibold">Add File</Text>
          <Text className="text-gray-500 text-xs">
            DOA certificates, land titles, etc.
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row gap-4">
        <TouchableOpacity
          onPress={onCancel}
          className="flex-1 bg-gray-100 rounded-lg py-4 items-center justify-center"
        >
          <Text className="text-gray-700 text-base font-semibold">Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="flex-1 rounded-lg overflow-hidden"
        >
          <LinearGradient
            colors={["#22c55e", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="w-full py-4 items-center justify-center"
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-semibold">
                Record Produce
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddProduceForm;
