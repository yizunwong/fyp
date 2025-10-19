import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Controller,
  type UseFormReturn,
} from "react-hook-form";
import {
  RegisterFarmFormData,
  RegisterFarmFormField,
} from "./types";
import { FARM_SIZE_UNIT_LABELS } from "@/validation/farm";

interface ControlledTextFieldProps {
  name: RegisterFarmFormField;
  label: string;
  placeholder: string;
  control: UseFormReturn<RegisterFarmFormData>["control"];
  clearErrors: UseFormReturn<RegisterFarmFormData>["clearErrors"];
  multiline?: boolean;
  keyboardType?: "default" | "numeric";
}

const ControlledTextField = ({
  name,
  label,
  placeholder,
  control,
  clearErrors,
  multiline,
  keyboardType,
}: ControlledTextFieldProps) => (
  <Controller
    control={control}
    name={name}
    render={({ field, fieldState }) => (
      <View className="mb-5">
        <Text className="text-gray-700 text-sm font-semibold mb-2">{label}</Text>
        <View
          className={`rounded-xl border ${
            fieldState.error ? "border-red-400" : "border-gray-200"
          } bg-white`}
        >
          <TextInput
            value={field.value ?? ""}
            onChangeText={(value) => {
              if (fieldState.error) {
                clearErrors(name);
              }
              field.onChange(value);
            }}
            onBlur={field.onBlur}
            placeholder={placeholder}
            placeholderTextColor="#9ca3af"
            multiline={multiline}
            keyboardType={keyboardType}
            className={`px-4 ${
              multiline ? "py-3 min-h-[110px]" : "py-3"
            } text-gray-900 text-base`}
            style={multiline ? { textAlignVertical: "top" } : undefined}
          />
        </View>
        {fieldState.error ? (
          <Text className="text-red-500 text-xs mt-2">
            {fieldState.error.message}
          </Text>
        ) : null}
      </View>
    )}
  />
);

export interface FarmFormProps {
  form: UseFormReturn<RegisterFarmFormData>;
  sizeUnits: RegisterFarmFormData["sizeUnit"][];
  cropSuggestions: string[];
  practiceSuggestions: string[];
  onSubmit: () => void;
  onReset: () => void;
}

export default function FarmForm({
  form,
  sizeUnits,
  cropSuggestions,
  practiceSuggestions,
  onSubmit,
  onReset,
}: FarmFormProps) {
  const {
    control,
    clearErrors,
    setValue,
    getValues,
    watch,
    formState: { isSubmitting, errors },
  } = form;

  const selectedUnit = watch("sizeUnit");

  const handleSelectSizeUnit = (unit: RegisterFarmFormData["sizeUnit"]) => {
    setValue("sizeUnit", unit, { shouldDirty: true, shouldTouch: true });
    clearErrors("sizeUnit");
  };

  const handleAddCrop = (crop: string) => {
    const current = getValues("primaryCrops") ?? "";
    const hasCrop = current
      .toLowerCase()
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .includes(crop.toLowerCase());

    if (hasCrop) return;

    const nextValue = current ? `${current}, ${crop}` : crop;
    setValue("primaryCrops", nextValue, { shouldDirty: true, shouldTouch: true });
    clearErrors("primaryCrops");
  };

  return (
    <View>
      <ControlledTextField
        name="name"
        label="Farm Name"
        placeholder="e.g. Green Valley Farm"
        control={control}
        clearErrors={clearErrors}
      />

      <ControlledTextField
        name="location"
        label="Location"
        placeholder="City, region or GPS coordinates"
        control={control}
        clearErrors={clearErrors}
      />

      <View className="mb-5">
        <Text className="text-gray-700 text-sm font-semibold mb-2">
          Farm Size
        </Text>
        <Controller
          control={control}
          name="size"
          render={({ field, fieldState }) => (
            <>
              <View
                className={`rounded-xl border ${
                  fieldState.error ? "border-red-400" : "border-gray-200"
                } bg-white`}
              >
                <TextInput
                  value={field.value ?? ""}
                  onChangeText={(value) => {
                    if (fieldState.error) {
                      clearErrors("size");
                    }
                    field.onChange(value);
                  }}
                  onBlur={field.onBlur}
                  placeholder="e.g. 5.5"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  className="px-4 py-3 text-gray-900 text-base"
                />
              </View>
              {fieldState.error ? (
                <Text className="text-red-500 text-xs mt-2">
                  {fieldState.error.message}
                </Text>
              ) : null}
            </>
          )}
        />

        <View className="flex-row flex-wrap gap-2 mt-3">
          {sizeUnits.map((unit) => {
            const isSelected = selectedUnit === unit;
            const label =
              FARM_SIZE_UNIT_LABELS[unit as keyof typeof FARM_SIZE_UNIT_LABELS] ??
              unit.replace(/_/g, " ").toLowerCase();
            return (
              <TouchableOpacity
                key={unit}
                onPress={() => handleSelectSizeUnit(unit)}
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
        {errors.sizeUnit?.message ? (
          <Text className="text-red-500 text-xs mt-2">
            {errors.sizeUnit.message}
          </Text>
        ) : null}
      </View>

      <Controller
        control={control}
        name="primaryCrops"
        render={({ field, fieldState }) => (
          <View className="mb-5">
            <Text className="text-gray-700 text-sm font-semibold mb-2">
              Primary Crops
            </Text>
            <View
              className={`rounded-xl border ${
                fieldState.error ? "border-red-400" : "border-gray-200"
              } bg-white`}
            >
              <TextInput
                value={field.value ?? ""}
                onChangeText={(value) => {
                  if (fieldState.error) {
                    clearErrors("primaryCrops");
                  }
                  field.onChange(value);
                }}
                onBlur={field.onBlur}
                placeholder="e.g. Rice, Vegetables"
                placeholderTextColor="#9ca3af"
                className="px-4 py-3 text-gray-900 text-base"
              />
            </View>
            <View className="flex-row flex-wrap gap-2 mt-3">
              {cropSuggestions.map((crop) => (
                <TouchableOpacity
                  key={crop}
                  onPress={() => handleAddCrop(crop)}
                  className="px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100"
                >
                  <Text className="text-sm font-medium text-emerald-700">
                    {crop}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {fieldState.error ? (
              <Text className="text-red-500 text-xs mt-2">
                {fieldState.error.message}
              </Text>
            ) : null}
          </View>
        )}
      />

      <Controller
        control={control}
        name="farmingPractice"
        render={({ field, fieldState }) => (
          <View className="mb-5">
            <Text className="text-gray-700 text-sm font-semibold mb-2">
              Farming Practice
            </Text>
            <View
              className={`rounded-xl border ${
                fieldState.error ? "border-red-400" : "border-gray-200"
              } bg-white`}
            >
              <TextInput
                value={field.value ?? ""}
                onChangeText={(value) => {
                  if (fieldState.error) {
                    clearErrors("farmingPractice");
                  }
                  field.onChange(value);
                }}
                onBlur={field.onBlur}
                placeholder="e.g. Organic farming"
                placeholderTextColor="#9ca3af"
                className="px-4 py-3 text-gray-900 text-base"
              />
            </View>
            <View className="flex-row flex-wrap gap-2 mt-3">
              {practiceSuggestions.map((practice) => (
                <TouchableOpacity
                  key={practice}
                  onPress={() => {
                    field.onChange(practice);
                    clearErrors("farmingPractice");
                  }}
                  className="px-4 py-2 rounded-full bg-white border border-gray-200"
                >
                  <Text className="text-sm font-medium text-gray-600">
                    {practice}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {fieldState.error ? (
              <Text className="text-red-500 text-xs mt-2">
                {fieldState.error.message}
              </Text>
            ) : null}
          </View>
        )}
      />

      <ControlledTextField
        name="registrationNumber"
        label="Registration Identifier (optional)"
        placeholder="Enter government or association registration number"
        control={control}
        clearErrors={clearErrors}
      />

      <ControlledTextField
        name="description"
        label="Additional Notes"
        placeholder="Add a short description about this farm, irrigation setup or certifications"
        control={control}
        clearErrors={clearErrors}
        multiline
      />

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
