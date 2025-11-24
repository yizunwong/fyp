import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native";
import { Controller, type UseFormReturn } from "react-hook-form";
import {
  FARM_SIZE_UNIT_LABELS,
  type RegisterFarmFormData,
  type RegisterFarmFormField,
} from "@/validation/farm";
import FileUploadPanel, {
  MAX_UPLOAD_FILES,
  cleanupUploadedFiles,
} from "@/components/common/FileUploadPanel";
import { ClearButton } from '@/components/ui/CleanButton';
import SubmitButton from '@/components/ui/SubmitButton';

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
    render={({ field, fieldState }) => {
      const stringValue = typeof field.value === "string" ? field.value : "";

      return (
        <View className="mb-5">
          <Text className="text-gray-700 text-sm font-semibold mb-2">{label}</Text>
          <View
            className={`rounded-xl border ${
              fieldState.error ? "border-red-400" : "border-gray-200"
            } bg-white`}
          >
            <TextInput
              value={stringValue}
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
      );
    }}
  />
);

export interface FarmFormProps {
  form: UseFormReturn<RegisterFarmFormData>;
  sizeUnits: RegisterFarmFormData["sizeUnit"][];
  cropSuggestions: string[];
  onSubmit: () => void;
  onReset: () => void;
  submitLabel?: string;
}

export default function FarmForm({
  form,
  sizeUnits,
  cropSuggestions,
  onSubmit,
  onReset,
  submitLabel = "Register Farm",
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
              FARM_SIZE_UNIT_LABELS[
                unit as keyof typeof FARM_SIZE_UNIT_LABELS
              ] ?? unit.replace(/_/g, " ").toLowerCase();
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
        name="landDocuments"
        render={({ field, fieldState }) => (
          <FileUploadPanel
            title="Land & Farm Documents"
            subtitle="Proof of ownership / registration"
            helperLines={[
              "Examples: Land title scans, tenancy agreements, DOA farm registration",
              "Accepted formats: JPG, PNG or PDF",
            ]}
            buttonLabel="Upload Land Document"
            files={field.value ?? []}
            onFilesAdded={(newFiles) => {
              const existing = field.value ?? [];
              const existingKeys = new Set(
                existing.map(
                  (doc) =>
                    `${doc.name}-${doc.size ?? 0}-${doc.mimeType ?? "unknown"}`
                )
              );
              const filtered = newFiles.filter((doc) => {
                const key = `${doc.name}-${doc.size ?? 0}-${
                  doc.mimeType ?? "unknown"
                }`;
                if (existingKeys.has(key)) {
                  if (
                    doc.uri &&
                    doc.uri.startsWith("blob:") &&
                    Platform.OS === "web"
                  ) {
                    URL.revokeObjectURL(doc.uri);
                  }
                  return false;
                }
                existingKeys.add(key);
                return true;
              });

              if (!filtered.length) {
                return;
              }

              const next = [...existing, ...filtered].slice(
                0,
                MAX_UPLOAD_FILES
              );
              field.onChange(next);
              clearErrors("landDocuments");
            }}
            onRemoveFile={(fileId) => {
              const remaining = (field.value ?? []).filter(
                (doc) => doc.id !== fileId
              );
              const removed = (field.value ?? []).filter(
                (doc) => doc.id === fileId
              );
              cleanupUploadedFiles(removed);
              field.onChange(remaining);
              clearErrors("landDocuments");
            }}
            error={fieldState.error?.message}
          />
        )}
      />

      <View className="flex-row gap-3 mt-2">
        <ClearButton onPress={onReset} disabled={isSubmitting} />
        <SubmitButton
          onPress={onSubmit}
          loading={isSubmitting}
          gradientColors={["#22c55e", "#059669"]}
          loadingTitle=""
          className="flex-1 rounded-lg overflow-hidden"
        />
      </View>
    </View>
  );
}
