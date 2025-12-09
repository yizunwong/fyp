import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Image } from "expo-image";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { Calendar, UploadCloud, Search, Check } from "lucide-react-native";
import { Dropdown } from "react-native-paper-dropdown";
import FileUploadPanel, {
  MAX_UPLOAD_FILES,
  cleanupUploadedFiles,
} from "@/components/common/FileUploadPanel";
import {
  PRODUCE_UNIT_LABELS,
  type AddProduceFormData,
  type ProduceUploadedDocument,
  type ProduceUnit,
} from "@/validation/produce";
import { UploadProduceCertificatesDtoTypesItem } from "@/api";
import {
  DropDownInput,
  DropdownItem,
  dropdownMenuContentStyle,
} from "@/components/ui/DropDownInput";
import { ClearButton } from "@/components/ui/CleanButton";
import SubmitButton from "@/components/ui/SubmitButton";
import DateTimePicker from "@react-native-community/datetimepicker";

export type AddProduceFarmOption = {
  id: string;
  name: string;
  location?: string;
};

export type AddProduceUnitOption = {
  value: ProduceUnit;
};

interface AddProduceFormProps {
  farms: AddProduceFarmOption[];
  units: AddProduceUnitOption[];
  isDesktop?: boolean;
  onSubmit: () => void;
  onReset: () => void;
}

const createUploadId = () => {
  try {
    const randomUUID = (globalThis as unknown as { crypto?: Crypto }).crypto
      ?.randomUUID;
    if (randomUUID) {
      return randomUUID();
    }
  } catch {
    // falls through to Math.random
  }
  return `upload-${Math.random().toString(36).slice(2, 10)}`;
};

type ProduceImageUploadFieldProps = {
  value?: ProduceUploadedDocument | null;
  onChange: (document?: ProduceUploadedDocument) => void;
  error?: string;
};

const cleanupImageUpload = (doc?: ProduceUploadedDocument | null) => {
  if (!doc) return;
  cleanupUploadedFiles([doc]);
};

const ProduceImageUploadField = ({
  value,
  onChange,
  error,
}: ProduceImageUploadFieldProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previousValueRef = useRef<ProduceUploadedDocument | null>(null);
  const isWeb = Platform.OS === "web";

  useEffect(() => {
    const previous = previousValueRef.current;
    if (previous && previous !== value) {
      cleanupImageUpload(previous);
    }
    previousValueRef.current = value ?? null;
  }, [value]);

  useEffect(() => {
    return () => {
      cleanupImageUpload(previousValueRef.current);
    };
  }, []);

  const handleSelect = useCallback(() => {
    if (isWeb) {
      inputRef.current?.click();
      return;
    }

    Alert.alert(
      "Upload unavailable",
      "Produce photos can currently be uploaded from the web dashboard."
    );
  }, [isWeb]);

  const handleFileSelection = useCallback(
    (fileList?: FileList | null) => {
      const file = fileList?.[0];
      if (!file) return;

      const mime = file.type?.toLowerCase() ?? "";
      if (mime && !mime.startsWith("image/")) {
        Alert.alert(
          "Unsupported file",
          "Please select an image file (JPG, PNG, HEIC)."
        );
        return;
      }

      if (value) {
        cleanupImageUpload(value);
      }

      const previewUri =
        isWeb && typeof URL !== "undefined"
          ? URL.createObjectURL(file)
          : undefined;

      onChange({
        id: createUploadId(),
        name: file.name,
        size: file.size,
        mimeType: file.type,
        kind: "image",
        uri: previewUri,
        file,
      });
    },
    [isWeb, onChange, value]
  );

  const handleRemove = useCallback(() => {
    if (value) {
      cleanupImageUpload(value);
    }
    onChange(undefined);
  }, [value, onChange]);

  return (
    <View>
      <TouchableOpacity
        onPress={handleSelect}
        activeOpacity={0.85}
        className={`rounded-2xl border ${
          value
            ? "border-emerald-200 bg-white"
            : "border-dashed border-gray-300 bg-gray-50"
        } overflow-hidden`}
      >
        {value?.uri ? (
          <Image
            source={{ uri: value.uri }}
            style={{ width: "100%", height: 500 }}
            contentFit="cover"
          />
        ) : (
          <View className="items-center py-10 px-4">
            <UploadCloud color="#059669" size={32} />
            <Text className="text-gray-800 text-sm font-semibold mt-3">
              Upload produce photo
            </Text>
            <Text className="text-gray-500 text-xs mt-1 text-center">
              Help buyers recognise this batch with a clear image.
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <View className="flex-row gap-3 mt-4">
        {value ? (
          <TouchableOpacity
            onPress={handleRemove}
            className="px-4 py-3 rounded-xl border border-gray-300 bg-white items-center justify-center"
          >
            <Text className="text-gray-700 text-sm font-semibold">Remove</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <Text className="text-red-500 text-xs mt-2">{error}</Text>
      ) : null}

      {isWeb ? (
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.heic,.heif,image/*"
          style={{ display: "none" }}
          onChange={(event) => {
            handleFileSelection(event.target.files);
            event.target.value = "";
          }}
        />
      ) : null}
    </View>
  );
};

const AddProduceForm = ({
  farms,
  units,
  isDesktop,
  onSubmit,
  onReset,
}: AddProduceFormProps) => {
  const {
    control,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useFormContext<AddProduceFormData>();
  const certificateTypeOptions = useMemo(
    () => Object.values(UploadProduceCertificatesDtoTypesItem),
    []
  );
  const defaultCertificateType =
    certificateTypeOptions[0] ?? UploadProduceCertificatesDtoTypesItem.ORGANIC;
  const [showHarvestPicker, setShowHarvestPicker] = useState(false);
  const isWeb = Platform.OS === "web";

  const unitOptions = units.map((unit) => ({
    label: PRODUCE_UNIT_LABELS[unit.value],
    value: unit.value,
  }));
  const [farmSearch, setFarmSearch] = useState("");
  const farmOptions = useMemo(
    () =>
      farms.map((farm) => ({
        label: farm.name,
        value: farm.id,
        location: farm.location,
      })),
    [farms]
  );
  const filteredFarmOptions = useMemo(() => {
    const normalized = farmSearch.trim().toLowerCase();
    if (!normalized) return farmOptions;
    return farmOptions.filter(
      (option) =>
        option.label.toLowerCase().includes(normalized) ||
        option.location?.toLowerCase().includes(normalized)
    );
  }, [farmOptions, farmSearch]);

  return (
    <View className={isDesktop ? "flex-1 pr-6" : ""}>
      <View className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <Text className="text-gray-900 text-lg font-bold mb-4">
          Produce Details
        </Text>

        <View className="mb-4">
          <Text className="text-gray-700 text-sm font-semibold mb-2">
            Verified Farm
          </Text>
          <Controller
            control={control}
            name="farmId"
            render={({ field: { value, onChange } }) => (
              <View className="gap-3">
                <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3">
                  <Search color="#9ca3af" size={18} />
                  <TextInput
                    value={farmSearch}
                    onChangeText={setFarmSearch}
                    placeholder="Search verified farms by name or location"
                    className="flex-1 ml-3 text-gray-900 text-base"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View className="border border-gray-200 rounded-xl bg-white max-h-56 overflow-hidden">
                  <ScrollView keyboardShouldPersistTaps="handled">
                    {filteredFarmOptions.length ? (
                      filteredFarmOptions.map((option, index) => (
                        <TouchableOpacity
                          key={option.value}
                          onPress={() => onChange(option.value)}
                          activeOpacity={0.8}
                          className={`px-4 py-3 ${
                            index !== filteredFarmOptions.length - 1
                              ? "border-b border-gray-100"
                              : ""
                          } ${
                            value === option.value
                              ? "bg-emerald-50 border-emerald-200"
                              : ""
                          }`}
                        >
                          <View className="flex-row items-center justify-between gap-3">
                            <View className="flex-1">
                              <Text className="text-gray-900 font-semibold">
                                {option.label}
                              </Text>
                              {option.location ? (
                                <Text className="text-gray-500 text-xs mt-0.5">
                                  {option.location}
                                </Text>
                              ) : null}
                            </View>
                            {value === option.value ? (
                              <Check color="#047857" size={18} />
                            ) : null}
                          </View>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View className="px-4 py-3">
                        <Text className="text-gray-500 text-sm">
                          No verified farms match your search.
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
                {errors.farmId?.message ? (
                  <Text className="text-red-500 text-xs mt-2">
                    {errors.farmId.message}
                  </Text>
                ) : null}
                {farmOptions.length === 0 ? (
                  <Text className="text-amber-700 text-xs mt-2">
                    You need a verified farm before adding produce.
                  </Text>
                ) : null}
              </View>
            )}
          />
        </View>

        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <Text className="text-gray-700 text-sm font-semibold mb-2">
              Produce Name
            </Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <>
                  <View
                    className={`rounded-xl border ${
                      fieldState.error ? "border-red-400" : "border-gray-200"
                    } bg-white`}
                  >
                    <TextInput
                      value={value}
                      onChangeText={(val) => {
                        onChange(val);
                        if (fieldState.error) clearErrors("name");
                      }}
                      onBlur={onBlur}
                      placeholder="e.g., Organic Tomatoes"
                      placeholderTextColor="#9ca3af"
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
          </View>

          <View className="flex-1">
            <Text className="text-gray-700 text-sm font-semibold mb-2">
              Harvest Date
            </Text>
            <Controller
              control={control}
              name="harvestDate"
              render={({ field: { value, onChange }, fieldState }) => {
                const handleChange = (event: any, selectedDate?: Date) => {
                  setShowHarvestPicker(false);
                  if (selectedDate) {
                    onChange(selectedDate.toISOString().split("T")[0]);
                    if (fieldState.error) clearErrors("harvestDate");
                  }
                };

                return (
                  <>
                    <View
                      className={`flex-row items-center rounded-xl border ${
                        fieldState.error ? "border-red-400" : "border-gray-200"
                      } bg-white px-4 py-3`}
                    >
                      <Calendar color="#6b7280" size={20} />
                      {isWeb ? (
                        <input
                          type="date"
                          value={value ?? ""}
                          onChange={(e) => {
                            onChange(e.target.value);
                            if (fieldState.error) clearErrors("harvestDate");
                          }}
                          className="flex-1 ml-3 text-gray-900 bg-white outline-none"
                          style={{ border: "none", padding: 0 }}
                        />
                      ) : (
                        <>
                          <Text
                            onPress={() => setShowHarvestPicker(true)}
                            className="flex-1 ml-3 text-gray-900 text-base"
                          >
                            {value || "Select date"}
                          </Text>
                          {showHarvestPicker && (
                            <DateTimePicker
                              value={value ? new Date(value) : new Date()}
                              mode="date"
                              display="default"
                              onChange={handleChange}
                            />
                          )}
                        </>
                      )}
                    </View>
                    {fieldState.error ? (
                      <Text className="text-red-500 text-xs mt-2">
                        {fieldState.error.message}
                      </Text>
                    ) : null}
                  </>
                );
              }}
            />
          </View>
        </View>

        <View className="mb-4">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-gray-700 text-sm font-semibold mb-2">
                Quantity
              </Text>
              <Controller
                control={control}
                name="quantity"
                render={({
                  field: { value, onChange, onBlur },
                  fieldState,
                }) => (
                  <>
                    <View
                      className={`rounded-xl border ${
                        fieldState.error ? "border-red-400" : "border-gray-200"
                      } bg-white`}
                    >
                      <TextInput
                        value={value}
                        onChangeText={(val) => {
                          onChange(val);
                          if (fieldState.error) clearErrors("quantity");
                        }}
                        onBlur={onBlur}
                        placeholder="e.g., 520"
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
            </View>

            <View className="w-36">
              <Text className="text-gray-700 text-sm font-semibold mb-2">
                Unit
              </Text>
              <Controller
                control={control}
                name="unit"
                render={({ field: { value, onChange }, fieldState }) => (
                  <>
                    <View
                      className={`rounded-xl border ${
                        fieldState.error ? "border-red-400" : "border-gray-200"
                      } bg-white`}
                    >
                      <Dropdown
                        mode="outlined"
                        placeholder="Select unit"
                        value={value ?? ""}
                        onSelect={(dropdownValue) => {
                          onChange(dropdownValue as ProduceUnit | undefined);
                          if (fieldState.error) clearErrors("unit");
                        }}
                        options={unitOptions}
                        error={!!fieldState.error}
                        CustomDropdownInput={DropDownInput}
                        CustomDropdownItem={DropdownItem}
                        menuContentStyle={dropdownMenuContentStyle}
                        hideMenuHeader
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
            </View>
          </View>
        </View>

        {/* Divider */}
        <View className="border-b border-gray-200 my-6" />

        {/* Produce Photo Section */}
        <View className="mb-4">
          <Text className="text-gray-900 text-lg font-bold mb-4">
            Produce Photo
          </Text>
          <Text className="text-gray-500 text-xs mb-3">
            Add a hero image to visually represent this batch (optional).
          </Text>
          <Controller
            control={control}
            name="produceImage"
            render={({ field: { value, onChange }, fieldState }) => (
              <ProduceImageUploadField
                value={value}
                error={fieldState.error?.message}
                onChange={(document) => {
                  onChange(document ?? null);
                  clearErrors("produceImage");
                }}
              />
            )}
          />
        </View>

        {/* Divider */}
        <View className="border-b border-gray-200 my-6" />

        {/* Certifications / Documents Section */}
        <View className="mb-4">
          <Text className="text-gray-900 text-lg font-bold mb-4">
            Certifications / Documents
          </Text>
          <Controller
            control={control}
            name="certifications"
            render={({ field, fieldState }) => {
              return (
                <FileUploadPanel
                  title="Certification Files"
                  subtitle="Attach DOA certificates, lab reports, or quality seals."
                  helperLines={[
                    "Optional but helps buyers verify quality claims.",
                    `Up to ${MAX_UPLOAD_FILES} files.`,
                  ]}
                  buttonLabel="Upload Documents"
                  files={field.value ?? []}
                  onFilesAdded={(newFiles) => {
                    if (!newFiles.length) return;
                    const existing = field.value ?? [];
                    const existingKeys = new Set(
                      existing.map(
                        (doc) =>
                          `${doc.name}-${doc.size ?? 0}-${
                            doc.mimeType ?? "unknown"
                          }`
                      )
                    );
                    const skipped: ProduceUploadedDocument[] = [];
                    const additions: ProduceUploadedDocument[] = [];
                    newFiles.forEach((doc) => {
                      const key = `${doc.name}-${doc.size ?? 0}-${
                        doc.mimeType ?? "unknown"
                      }`;
                      if (existingKeys.has(key)) {
                        skipped.push(doc);
                        return;
                      }
                      existingKeys.add(key);
                      additions.push({
                        ...doc,
                        certificateType: defaultCertificateType,
                      });
                    });
                    if (skipped.length) {
                      cleanupUploadedFiles(skipped);
                    }
                    if (!additions.length) {
                      return;
                    }
                    const next = [...existing, ...additions].slice(
                      0,
                      MAX_UPLOAD_FILES
                    );
                    field.onChange(next);
                    clearErrors("certifications");
                  }}
                  onRemoveFile={(fileId) => {
                    const existing = field.value ?? [];
                    const remaining = existing.filter(
                      (doc) => doc.id !== fileId
                    );
                    const removed = existing.filter((doc) => doc.id === fileId);
                    if (removed.length) {
                      cleanupUploadedFiles(removed);
                    }
                    field.onChange(remaining);
                    clearErrors("certifications");
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
                        value={file.certificateType ?? defaultCertificateType}
                        onChange={(event) =>
                          update({
                            certificateType: event.target
                              .value as UploadProduceCertificatesDtoTypesItem,
                          })
                        }
                        className="border border-gray-300 rounded-md px-2 py-1 text-xs text-gray-700 bg-white"
                      >
                        {certificateTypeOptions.map((type) => (
                          <option key={type} value={type}>
                            {type.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Text className="text-gray-500 text-xs">
                        Type: {file.certificateType ?? defaultCertificateType}
                      </Text>
                    )
                  }
                  error={fieldState.error?.message}
                />
              );
            }}
          />
        </View>

        <View className="flex-row gap-4">
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

      <Modal visible={isSubmitting} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-white rounded-2xl px-8 py-6 items-center gap-3">
            <ActivityIndicator size="large" color="#059669" />
            <Text className="text-gray-900 text-base font-semibold">
              Submitting produce...
            </Text>
            <Text className="text-gray-600 text-xs text-center">
              This may take a few seconds. Please keep the app open.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AddProduceForm;
