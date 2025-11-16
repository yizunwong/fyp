import { useCallback, useEffect, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import {
  Alert,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar, UploadCloud } from "lucide-react-native";
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
import {
  DropDownInput,
  DropdownItem,
  dropdownMenuContentStyle,
} from "@/components/ui/DropDownInput";
import { ClearButton } from '@/components/ui/CleanButton';
import SubmitButton from '@/components/ui/SubmitButton';

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
  onSubmit: () => void;
  onReset: () => void;
}

const createUploadId = () => {
  try {
    const randomUUID = (globalThis as unknown as { crypto?: Crypto }).crypto?.randomUUID;
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
        isWeb && typeof URL !== "undefined" ? URL.createObjectURL(file) : undefined;

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
          value ? "border-emerald-200 bg-white" : "border-dashed border-gray-300 bg-gray-50"
        } overflow-hidden`}
      >
        {value?.uri ? (
          <Image
            source={{ uri: value.uri }}
            style={{ width: "100%", height: 220 }}
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
        <TouchableOpacity
          onPress={handleSelect}
          className="flex-1 rounded-xl overflow-hidden"
        >
          <LinearGradient
            colors={["#22c55e", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="px-4 py-3 flex-row items-center justify-center gap-2"
          >
            <UploadCloud color="#fff" size={16} />
            <Text className="text-white text-sm font-semibold">
              Choose Image
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        {value ? (
          <TouchableOpacity
            onPress={handleRemove}
            className="px-4 py-3 rounded-xl border border-gray-300 bg-white items-center justify-center"
          >
            <Text className="text-gray-700 text-sm font-semibold">Remove</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? <Text className="text-red-500 text-xs mt-2">{error}</Text> : null}

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
                    CustomDropdownInput={DropDownInput}
                    CustomDropdownItem={DropdownItem}
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
    </View>

      <View className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <Text className="text-gray-900 text-lg font-bold mb-2">
          Produce Photo
        </Text>
        <Text className="text-gray-600 text-sm mb-4">
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

      <View className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <Text className="text-gray-900 text-lg font-bold mb-2">
          Certifications / Documents
        </Text>
        <Controller
          control={control}
          name="certifications"
          render={({ field, fieldState }) => (
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
                  additions.push(doc);
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
                const remaining = existing.filter((doc) => doc.id !== fileId);
                const removed = existing.filter((doc) => doc.id === fileId);
                if (removed.length) {
                  cleanupUploadedFiles(removed);
                }
                field.onChange(remaining);
                clearErrors("certifications");
              }}
              error={fieldState.error?.message}
            />
          )}
        />

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
    </View>
  );
};

export default AddProduceForm;
