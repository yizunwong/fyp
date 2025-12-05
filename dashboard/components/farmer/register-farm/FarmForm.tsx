import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import { Controller, type UseFormReturn } from "react-hook-form";
import {
  FARM_SIZE_UNIT_LABELS,
  type RegisterFarmFormData,
  type RegisterFarmFormField,
} from "@/validation/farm";
import { UploadFarmDocumentsDtoTypesItem } from "@/api";
import FileUploadPanel, {
  MAX_UPLOAD_FILES,
  cleanupUploadedFiles,
} from "@/components/common/FileUploadPanel";
import { ClearButton } from '@/components/ui/CleanButton';
import SubmitButton from '@/components/ui/SubmitButton';
import { Trash } from "lucide-react-native";
import FarmLocationPicker from "./FarmLocationPicker";

interface ControlledTextFieldProps {
  name: RegisterFarmFormField;
  label: string;
  placeholder: string;
  control: UseFormReturn<RegisterFarmFormData>["control"];
  clearErrors: UseFormReturn<RegisterFarmFormData>["clearErrors"];
  multiline?: boolean;
  keyboardType?: "default" | "numeric";
  editable?: boolean;
}

const ControlledTextField = ({
  name,
  label,
  placeholder,
  control,
  clearErrors,
  multiline,
  keyboardType,
  editable = true,
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
                if (!editable) return;
                if (fieldState.error) clearErrors(name);
                field.onChange(value);
              }}
              onBlur={field.onBlur}
              placeholder={placeholder}
              placeholderTextColor="#9ca3af"
              multiline={multiline}
              keyboardType={keyboardType}
              editable={editable}
              className={`px-4 ${
                multiline ? "py-3 min-h-[110px]" : "py-3"
              } text-gray-900 text-base ${editable ? "" : "bg-gray-50 text-gray-500"}`}
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
  const landDocOptions = useMemo(
    () => Object.values(UploadFarmDocumentsDtoTypesItem),
    []
  );
  const defaultLandDocType =
    landDocOptions[0] ?? UploadFarmDocumentsDtoTypesItem.OTHERS;
  const [isCropSheetVisible, setIsCropSheetVisible] = useState(false);
  const [cropSheetSearch, setCropSheetSearch] = useState("");
  const [cropSheetSelection, setCropSheetSelection] = useState<string[]>([]);
  const [showCropDropdown, setShowCropDropdown] = useState(false); // web fallback

  const handleSelectSizeUnit = (unit: RegisterFarmFormData["sizeUnit"]) => {
    setValue("sizeUnit", unit, { shouldDirty: true, shouldTouch: true });
    clearErrors("sizeUnit");
  };

  const handleAddCrop = (crop: string) => {
    const normalized = crop.trim().toUpperCase();
    if (!normalized) return;
    const current = getValues("primaryCrops") ?? "";
    const hasCrop = current
      .toUpperCase()
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .includes(normalized);

    if (hasCrop) return;

    const nextValue = current ? `${current}, ${normalized}` : normalized;
    setValue("primaryCrops", nextValue, { shouldDirty: true, shouldTouch: true });
    clearErrors("primaryCrops");
  };

  const removeCrop = (crop: string) => {
    const current = getValues("primaryCrops") ?? "";
    const remaining = current
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length && item.toUpperCase() !== crop.toUpperCase());
    setValue("primaryCrops", remaining.join(", "));
  };

  const clearAllCrops = () => {
    setValue("primaryCrops", "", { shouldDirty: true, shouldTouch: true });
    clearErrors("primaryCrops");
  };

  const selectedCrops = (getValues("primaryCrops") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const availableCropOptions = cropSuggestions.filter(
    (crop) => !selectedCrops.includes(crop)
  );

  const filteredCropOptions = availableCropOptions.filter((crop) =>
    crop.toUpperCase().includes(cropSheetSearch.trim().toUpperCase())
  );

  const toggleCropSheetSelection = (crop: string) => {
    setCropSheetSelection((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop]
    );
  };

  const confirmCropSheetSelection = () => {
    cropSheetSelection.forEach((crop) => handleAddCrop(crop));
    setCropSheetSelection([]);
    setCropSheetSearch("");
    setIsCropSheetVisible(false);
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

      <Controller
        control={control}
        name="address"
        render={({ field, fieldState }) => {
          const value = typeof field.value === "string" ? field.value : "";
          return (
            <View className="mb-5">
              <FarmLocationPicker
                value={value}
                onChange={(next) => {
                  field.onChange(next);
                  if (fieldState.error) {
                    clearErrors("address");
                  }
                }}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                onAddressPartsChange={({ address, district, state }) => {
                  setValue("address", address, {
                    shouldDirty: true,
                    shouldTouch: true,
                  });
                  clearErrors("address");
                  if (district !== undefined) {
                    setValue("district", district, {
                      shouldDirty: true,
                      shouldTouch: true,
                    });
                    clearErrors("district");
                  }
                  if (state !== undefined) {
                    setValue("state", state, {
                      shouldDirty: true,
                      shouldTouch: true,
                    });
                    clearErrors("state");
                  }
                }}
              />
              <View className="mt-3">
                <Text className="text-gray-700 text-sm font-semibold mb-2">
                  Farm Address
                </Text>
                <View
                  className={`rounded-xl border ${
                    fieldState.error ? "border-red-400" : "border-gray-200"
                  } bg-white`}
                >
                  <TextInput
                    value={value}
                    editable={false}
                    placeholder="Auto-filled when you search or drop a pin"
                    placeholderTextColor="#9ca3af"
                    className="px-4 py-3 text-gray-900 text-base"
                    multiline
                    style={{ textAlignVertical: "top" }}
                  />
                </View>
                {fieldState.error ? (
                  <Text className="text-red-500 text-xs mt-2">
                    {fieldState.error.message}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        }}
      />

      <View className="flex-row gap-3">
        <View className="flex-1">
          <ControlledTextField
            name="district"
            label="District"
            placeholder="e.g. Kuala Terengganu"
            control={control}
            clearErrors={clearErrors}
            editable={false}
          />
        </View>
        <View className="flex-1">
          <ControlledTextField
            name="state"
            label="State"
            placeholder="e.g. Terengganu"
            control={control}
            clearErrors={clearErrors}
            editable={false}
          />
        </View>
      </View>

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
            <View className="rounded-xl border border-gray-200 bg-white px-3 py-2">
              <View className="flex-row justify-between items-start gap-2">
                <View className="flex-1 flex-row flex-wrap gap-2">
                  {(field.value ?? "")
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
                    .map((crop) => (
                      <View
                        key={crop}
                        className="flex-row items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100"
                      >
                        <Text className="text-sm font-medium text-emerald-700">
                          {crop}
                        </Text>
                        <TouchableOpacity onPress={() => removeCrop(crop)}>
                          <Text className="text-xs text-emerald-700">✕</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                </View>
                <TouchableOpacity
                  onPress={clearAllCrops}
                  className="mt-1 px-3 py-2 rounded-md bg-red-50 border border-red-200 flex-row items-center gap-2"
                >
                  <Trash size={14} color="#dc2626" />
                  <Text className="text-xs font-semibold text-red-600">
                    Clear
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View className="mt-3">
              <TouchableOpacity
                onPress={() =>
                  Platform.OS === "web"
                    ? setShowCropDropdown((prev) => !prev)
                    : setIsCropSheetVisible(true)
                }
                className="flex-row items-center justify-between px-4 py-3 rounded-lg border border-emerald-200 bg-emerald-50"
              >
                <Text className="text-sm font-semibold text-emerald-800">
                  Choose from list
                </Text>
                <Text className="text-emerald-700 text-lg">
                  {Platform.OS === "web" && showCropDropdown ? "▲" : "▼"}
                </Text>
              </TouchableOpacity>
              {Platform.OS === "web" && showCropDropdown ? (
                <View className="mt-2 rounded-lg border border-emerald-200 bg-white max-h-52">
                  <ScrollView>
                    {availableCropOptions.map((crop) => (
                      <TouchableOpacity
                        key={crop}
                        onPress={() => {
                          handleAddCrop(crop);
                          setShowCropDropdown(false);
                        }}
                        className="px-4 py-2 border-b border-emerald-100 last:border-b-0"
                      >
                        <Text className="text-sm text-emerald-800">{crop}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ) : null}
            </View>
            <Modal
              visible={isCropSheetVisible}
              transparent
              animationType="slide"
              onRequestClose={() => setIsCropSheetVisible(false)}
            >
              <View className="flex-1 justify-end bg-black/40">
                <Pressable
                  className="flex-1"
                  onPress={() => setIsCropSheetVisible(false)}
                />
                <View className="bg-white rounded-t-3xl p-4 pt-2">
                  <View className="items-center mb-3">
                    <View className="h-1.5 w-14 bg-gray-300 rounded-full" />
                  </View>
                  <Text className="text-lg font-semibold text-emerald-900 mb-2">
                    Select Primary Crops
                  </Text>
                  <TextInput
                    value={cropSheetSearch}
                    onChangeText={setCropSheetSearch}
                    placeholder="Search crops"
                    placeholderTextColor="#9ca3af"
                    className="border border-emerald-200 rounded-lg px-3 py-2 text-gray-900"
                  />
                  <ScrollView style={{ maxHeight: 320 }} className="mt-3">
                    {filteredCropOptions.map((crop) => {
                      const checked = cropSheetSelection.includes(crop);
                      return (
                        <TouchableOpacity
                          key={crop}
                          onPress={() => toggleCropSheetSelection(crop)}
                          className="flex-row items-center gap-3 px-2 py-2 border-b border-emerald-100 last:border-b-0"
                        >
                          <View
                            className={`w-5 h-5 rounded-md border ${
                              checked ? "bg-emerald-500 border-emerald-600" : "border-emerald-300"
                            }`}
                          />
                          <Text className="text-base text-emerald-900">
                            {crop}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                  <TouchableOpacity
                    onPress={confirmCropSheetSelection}
                    className="mt-4 bg-emerald-600 rounded-lg py-3 items-center"
                  >
                    <Text className="text-white font-semibold text-base">
                      Add Selected
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
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
        render={({ field, fieldState }) => {
          return (
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
                const filtered = newFiles
                  .map((doc) => ({
                    ...doc,
                    landDocumentType: defaultLandDocType,
                  }))
                  .filter((doc) => {
                    const key = `${doc.name}-${doc.size ?? 0}-${doc.mimeType ?? "unknown"}`;
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

                const next = [...(field.value ?? []), ...filtered].slice(
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
              onUpdateFile={(fileId, patch) => {
                const existing = field.value ?? [];
                const next = existing.map((doc) =>
                  doc.id === fileId ? { ...doc, ...patch } : doc
                );
                field.onChange(next);
              }}
              renderAccessory={(file, update) =>
                Platform.OS === "web" ? (
                  <select
                    value={file.landDocumentType ?? defaultLandDocType}
                    onChange={(event) =>
                      update({
                        landDocumentType:
                          event.target.value as UploadFarmDocumentsDtoTypesItem,
                      })
                    }
                    className="border border-gray-300 rounded-md px-2 py-1 text-xs text-gray-700 bg-white"
                  >
                    {landDocOptions.map((type) => (
                      <option key={type} value={type}>
                        {type.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Text className="text-gray-500 text-xs">
                    Type: {file.landDocumentType ?? defaultLandDocType}
                  </Text>
                )
              }
              error={fieldState.error?.message}
            />
          );
        }}
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
