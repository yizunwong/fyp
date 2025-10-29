import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Platform,
} from "react-native";
import { useMemo, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  Controller,
  type UseFormReturn,
  useFieldArray,
} from "react-hook-form";
import {
  CERTIFICATION_TYPES,
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
  const certificationValues = watch("certifications");

  const {
    fields: certificationFields,
    append: appendCertification,
    remove: removeCertification,
  } = useFieldArray({
    control,
    name: "certifications",
  });

  const certificationOptions = useMemo(
    () =>
      CERTIFICATION_TYPES.map((type) => ({
        value: type,
        label:
          type === "HALAL"
            ? "Halal"
            : type === "MYGAP"
            ? "MyGAP"
            : type === "ORGANIC"
            ? "Organic"
            : "Other",
      })),
    []
  );

  const [openTypeIndex, setOpenTypeIndex] = useState<number | null>(null);

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

  const handleAddCertification = () => {
    appendCertification({
      type: CERTIFICATION_TYPES[0],
      otherType: "",
      issueDate: "",
      expiryDate: "",
      documents: [],
    });
    clearErrors("certifications");
    setOpenTypeIndex(certificationFields.length);
  };

  const handleRemoveCertification = (index: number) => {
    const current = certificationValues?.[index];
    if (current?.documents?.length) {
      cleanupUploadedFiles(current.documents);
    }
    removeCertification(index);
    clearErrors(["certifications"]);
    setOpenTypeIndex((prev) => {
      if (prev === null) return null;
      if (prev === index) return null;
      return prev > index ? prev - 1 : prev;
    });
  };

  const handleSelectCertificationType = (
    index: number,
    type: RegisterFarmFormData["certifications"][number]["type"]
  ) => {
    setValue(`certifications.${index}.type` as const, type, {
      shouldDirty: true,
      shouldTouch: true,
    });
    clearErrors([`certifications.${index}.type` as const]);

    if (type !== "OTHER") {
      setValue(`certifications.${index}.otherType` as const, "", {
        shouldDirty: true,
        shouldTouch: true,
      });
      clearErrors([`certifications.${index}.otherType` as const]);
    }

    setOpenTypeIndex(null);
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

      <View className="mb-6">
        <Text className="text-gray-800 text-sm font-semibold">
          Certification Upload (Halal / MyGAP / Organic)
        </Text>
        <Text className="text-gray-500 text-xs mt-1">
          Provide compliance certificates to streamline retailer and government
          checks.
        </Text>
        <View className="mt-3 gap-1.5">
          <Text className="text-gray-500 text-xs">
            Files: Certificates with issue date & expiry date.
          </Text>
          <Text className="text-gray-500 text-xs">
            Format: JPG, PNG or PDF. Upload multiple certificates as needed.
          </Text>
        </View>

        {certificationFields.length ? (
          <View className="mt-4 gap-4">
            {certificationFields.map((certField, index) => {
              const current = certificationValues?.[index];
              const selectedType = current?.type ?? CERTIFICATION_TYPES[0];
              const displayLabel =
                certificationOptions.find(
                  (option) => option.value === selectedType
                )?.label ?? "Select type";

              return (
                <View
                  key={certField.id}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-800 text-sm font-semibold">
                      Certification #{index + 1}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveCertification(index)}
                      className="px-3 py-1 rounded-lg bg-red-50 border border-red-100"
                    >
                      <Text className="text-red-500 text-xs font-semibold">
                        Remove
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View className="mt-4">
                    <Text className="text-gray-700 text-xs font-semibold mb-1">
                      Certification Type
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setOpenTypeIndex((prev) =>
                          prev === index ? null : index
                        )
                      }
                      className="flex-row items-center justify-between border border-gray-200 rounded-xl px-4 py-3 bg-gray-50"
                      activeOpacity={0.85}
                    >
                      <Text className="text-gray-800 text-sm font-medium">
                        {displayLabel}
                      </Text>
                      <Text className="text-gray-400 text-base">
                        {openTypeIndex === index ? "^" : "v"}
                      </Text>
                    </TouchableOpacity>
                    {openTypeIndex === index ? (
                      <View className="border border-gray-200 rounded-xl mt-2 bg-white overflow-hidden">
                        {certificationOptions.map((option) => (
                          <TouchableOpacity
                            key={option.value}
                            onPress={() =>
                              handleSelectCertificationType(index, option.value)
                            }
                            className={`px-4 py-3 ${
                              option.value === selectedType
                                ? "bg-emerald-50"
                                : "bg-white"
                            }`}
                          >
                            <Text
                              className={`text-sm ${
                                option.value === selectedType
                                  ? "text-emerald-700 font-semibold"
                                  : "text-gray-700"
                              }`}
                            >
                              {option.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ) : null}
                  </View>

                  {selectedType === "OTHER" ? (
                    <Controller
                      control={control}
                      name={`certifications.${index}.otherType` as const}
                      render={({ field, fieldState }) => (
                        <View className="mt-4">
                          <Text className="text-gray-700 text-xs font-semibold mb-1">
                            Certification Name
                          </Text>
                          <View
                            className={`rounded-xl border ${
                              fieldState.error
                                ? "border-red-400"
                                : "border-gray-200"
                            } bg-white`}
                          >
                            <TextInput
                              value={field.value ?? ""}
                              onChangeText={(value) => {
                                field.onChange(value);
                                if (fieldState.error) {
                                  clearErrors([
                                    `certifications.${index}.otherType` as const,
                                  ]);
                                }
                              }}
                              onBlur={field.onBlur}
                              placeholder="Enter certification name"
                              placeholderTextColor="#9ca3af"
                              className="px-4 py-3 text-gray-900 text-sm"
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
                  ) : null}

                  <View className="mt-4 flex-row gap-3">
                    <Controller
                      control={control}
                      name={`certifications.${index}.issueDate` as const}
                      render={({ field, fieldState }) => (
                        <View className="flex-1">
                          <Text className="text-gray-700 text-xs font-semibold mb-1">
                            Issue Date (optional)
                          </Text>
                          <View
                            className={`rounded-xl border ${
                              fieldState.error
                                ? "border-red-400"
                                : "border-gray-200"
                            } bg-white`}
                          >
                            <TextInput
                              value={field.value ?? ""}
                              onChangeText={(value) => {
                                field.onChange(value);
                                if (fieldState.error) {
                                  clearErrors([
                                    `certifications.${index}.issueDate` as const,
                                  ]);
                                }
                              }}
                              onBlur={field.onBlur}
                              placeholder="YYYY-MM-DD"
                              placeholderTextColor="#9ca3af"
                              className="px-4 py-3 text-gray-900 text-sm"
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
                    <Controller
                      control={control}
                      name={`certifications.${index}.expiryDate` as const}
                      render={({ field, fieldState }) => (
                        <View className="flex-1">
                          <Text className="text-gray-700 text-xs font-semibold mb-1">
                            Expiry Date (optional)
                          </Text>
                          <View
                            className={`rounded-xl border ${
                              fieldState.error
                                ? "border-red-400"
                                : "border-gray-200"
                            } bg-white`}
                          >
                            <TextInput
                              value={field.value ?? ""}
                              onChangeText={(value) => {
                                field.onChange(value);
                                if (fieldState.error) {
                                  clearErrors([
                                    `certifications.${index}.expiryDate` as const,
                                  ]);
                                }
                              }}
                              onBlur={field.onBlur}
                              placeholder="YYYY-MM-DD"
                              placeholderTextColor="#9ca3af"
                              className="px-4 py-3 text-gray-900 text-sm"
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
                  </View>

                  <Controller
                    control={control}
                    name={`certifications.${index}.documents` as const}
                    render={({ field, fieldState }) => (
                      <FileUploadPanel
                        title="Certification Files"
                        subtitle="Attach the official certificate documents"
                        helperLines={[
                          "Upload scanned certificates or official PDFs.",
                          "Include all relevant pages if multi-page.",
                        ]}
                        buttonLabel="Upload Certification"
                        files={field.value ?? []}
                        onFilesAdded={(newFiles) => {
                          const existing = field.value ?? [];
                          const existingKeys = new Set(
                            existing.map(
                              (doc) =>
                                `${doc.name}-${doc.size ?? 0}-${
                                  doc.mimeType ?? "unknown"
                                }`
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

                          if (!filtered.length) return;

                          const next = [...existing, ...filtered].slice(
                            0,
                            MAX_UPLOAD_FILES
                          );
                          field.onChange(next);
                          clearErrors([
                            `certifications.${index}.documents` as const,
                          ]);
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
                          clearErrors([
                            `certifications.${index}.documents` as const,
                          ]);
                        }}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </View>
              );
            })}
          </View>
        ) : (
          <View className="mt-4 rounded-2xl border border-gray-200 bg-white px-4 py-3">
            <Text className="text-xs text-gray-500">
              No certification uploaded yet. Add a certification entry to attach
              documents.
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={handleAddCertification}
          className="mt-4 border border-emerald-200 bg-emerald-50 rounded-xl py-3 items-center justify-center"
          activeOpacity={0.85}
        >
          <Text className="text-emerald-700 text-sm font-semibold">
            Add Certification
          </Text>
        </TouchableOpacity>
      </View>

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
