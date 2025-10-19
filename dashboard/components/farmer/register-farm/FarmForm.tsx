import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  RegisterFarmFormData,
  RegisterFarmFormErrors,
  RegisterFarmFormField,
} from "./types";
import { FARM_SIZE_UNIT_LABELS } from "@/validation/farm";

export interface FarmFormProps {
  formData: RegisterFarmFormData;
  errors: RegisterFarmFormErrors;
  isSubmitting: boolean;
  sizeUnits: RegisterFarmFormData["sizeUnit"][];
  cropSuggestions: string[];
  practiceSuggestions: string[];
  onChange: (field: RegisterFarmFormField, value: string) => void;
  onAddCrop: (crop: string) => void;
  onSelectSizeUnit: (unit: RegisterFarmFormData["sizeUnit"]) => void;
  onSubmit: () => void;
  onReset: () => void;
}

const renderInput = (
  label: string,
  field: RegisterFarmFormField,
  placeholder: string,
  value: string,
  onChange: (field: RegisterFarmFormField, value: string) => void,
  errorMessage?: string,
  options?: { multiline?: boolean; keyboardType?: "default" | "numeric" }
) => (
  <View className="mb-5" key={field}>
    <Text className="text-gray-700 text-sm font-semibold mb-2">{label}</Text>
    <View
      className={`rounded-xl border ${
        errorMessage ? "border-red-400" : "border-gray-200"
      } bg-white`}
    >
      <TextInput
        value={value}
        onChangeText={(text) => onChange(field, text)}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        multiline={options?.multiline}
        keyboardType={options?.keyboardType}
        className={`px-4 ${
          options?.multiline ? "py-3 min-h-[110px]" : "py-3"
        } text-gray-900 text-base`}
        style={options?.multiline ? { textAlignVertical: "top" } : undefined}
      />
    </View>
    {errorMessage && (
      <Text className="text-red-500 text-xs mt-2">{errorMessage}</Text>
    )}
  </View>
);

export default function FarmForm({
  formData,
  errors,
  isSubmitting,
  sizeUnits,
  cropSuggestions,
  practiceSuggestions,
  onChange,
  onAddCrop,
  onSelectSizeUnit,
  onSubmit,
  onReset,
}: FarmFormProps) {
  return (
    <View>
      {renderInput(
        "Farm Name",
        "name",
        "e.g. Green Valley Farm",
        formData.name,
        onChange,
        errors.name?.message?.toString()
      )}

      {renderInput(
        "Location",
        "location",
        "City, region or GPS coordinates",
        formData.location,
        onChange,
        errors.location?.message?.toString()
      )}

      <View className="mb-5">
        <Text className="text-gray-700 text-sm font-semibold mb-2">
          Farm Size
        </Text>
        <View
          className={`rounded-xl border ${
            errors.size ? "border-red-400" : "border-gray-200"
          } bg-white`}
        >
          <TextInput
            value={formData.size}
            onChangeText={(value) => onChange("size", value)}
            placeholder="e.g. 5.5"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            className="px-4 py-3 text-gray-900 text-base"
          />
        </View>
        <View className="flex-row flex-wrap gap-2 mt-3">
          {sizeUnits.map((unit) => {
            const isSelected = formData.sizeUnit === unit;
            const label =
              FARM_SIZE_UNIT_LABELS[unit as keyof typeof FARM_SIZE_UNIT_LABELS] ??
              unit.replace(/_/g, " ").toLowerCase();
            return (
              <TouchableOpacity
                key={unit}
                onPress={() => onSelectSizeUnit(unit)}
                className={`px-4 py-2 rounded-full border ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    isSelected ? "text-emerald-700" : "text-gray-600"
                  }`}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors.size?.message && (
          <Text className="text-red-500 text-xs mt-2">
            {errors.size?.message?.toString()}
          </Text>
        )}
      </View>

      <View className="mb-5">
        <Text className="text-gray-700 text-sm font-semibold mb-2">
          Primary Crops
        </Text>
        <View
          className={`rounded-xl border ${
            errors.primaryCrops ? "border-red-400" : "border-gray-200"
          } bg-white`}
        >
          <TextInput
            value={formData.primaryCrops}
            onChangeText={(value) => onChange("primaryCrops", value)}
            placeholder="e.g. Rice, Vegetables"
            placeholderTextColor="#9ca3af"
            className="px-4 py-3 text-gray-900 text-base"
          />
        </View>
        <View className="flex-row flex-wrap gap-2 mt-3">
          {cropSuggestions.map((crop) => (
            <TouchableOpacity
              key={crop}
              onPress={() => onAddCrop(crop)}
              className="px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100"
            >
              <Text className="text-sm font-medium text-emerald-700">{crop}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.primaryCrops?.message && (
          <Text className="text-red-500 text-xs mt-2">
            {errors.primaryCrops?.message?.toString()}
          </Text>
        )}
      </View>

      <View className="mb-5">
        <Text className="text-gray-700 text-sm font-semibold mb-2">
          Farming Practice
        </Text>
        <View
          className={`rounded-xl border ${
            errors.farmingPractice ? "border-red-400" : "border-gray-200"
          } bg-white`}
        >
          <TextInput
            value={formData.farmingPractice}
            onChangeText={(value) => onChange("farmingPractice", value)}
            placeholder="e.g. Organic farming"
            placeholderTextColor="#9ca3af"
            className="px-4 py-3 text-gray-900 text-base"
          />
        </View>
        <View className="flex-row flex-wrap gap-2 mt-3">
          {practiceSuggestions.map((practice) => (
            <TouchableOpacity
              key={practice}
              onPress={() => onChange("farmingPractice", practice)}
              className="px-4 py-2 rounded-full bg-white border border-gray-200"
            >
              <Text className="text-sm font-medium text-gray-600">
                {practice}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.farmingPractice?.message && (
          <Text className="text-red-500 text-xs mt-2">
            {errors.farmingPractice?.message?.toString()}
          </Text>
        )}
      </View>

      {renderInput(
        "Registration Identifier (optional)",
        "registrationNumber",
        "Enter government or association registration number",
        formData.registrationNumber,
        onChange,
        errors.registrationNumber?.message?.toString()
      )}

      {renderInput(
        "Additional Notes",
        "description",
        "Add a short description about this farm, irrigation setup or certifications",
        formData.description,
        onChange,
        errors.description?.message?.toString(),
        { multiline: true }
      )}

      <View className="flex-row gap-3 mt-2">
        <TouchableOpacity
          onPress={onReset}
          className="flex-1 border border-emerald-200 rounded-xl py-3 items-center justify-center"
          disabled={isSubmitting}
        >
          <Text className="text-emerald-700 text-sm font-semibold">
            Clear Form
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onSubmit}
          className="flex-1 rounded-xl overflow-hidden"
          disabled={isSubmitting}
        >
          <LinearGradient
            colors={["#22c55e", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-3 items-center justify-center"
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-sm font-semibold">
                Register Farm
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}
