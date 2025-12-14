import { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Trash } from "lucide-react-native";
import { FARM_SIZE_UNIT_LABELS, FARM_SIZE_UNITS } from "@/validation/farm";
import type { EligibilityListField } from "./types";
import {
  CreateProgramDto,
  CreateProgramEligibilityDtoLandDocumentTypesItem,
} from "@/api";

const cropSuggestions = [
  "GRAINS",
  "VEGETABLES",
  "FRUITS",
  "INDUSTRIAL",
  "LEGUMES",
  "TUBERS",
  "HERBS_SPICES",
  "ORNAMENTAL",
  "FODDER_FEED",
  "BEVERAGE_CROPS",
  "OTHER",
];

const landDocumentTypeOptions = [
  { value: "GERAN_TANAH", label: "Geran Tanah (Land Title)" },
  { value: "PAJAK_GADAI", label: "Pajak Gadai (Lease/Pawn)" },
  { value: "SURAT_TAWARAN_TANAH", label: "Surat Tawaran Tanah" },
  { value: "SURAT_PENGESAHAN_PEMAJU", label: "Surat Pengesahan Pemaju" },
  { value: "SURAT_PENGESAHAN_PENGHULU", label: "Surat Pengesahan Penghulu" },
  { value: "LEASE_AGREEMENT", label: "Lease Agreement" },
  { value: "LAND_PERMISSION", label: "Land Permission" },
  { value: "LAND_TAX_RECEIPT", label: "Land Tax Receipt" },
  { value: "SURAT_HAKMILIK_SEMENTARA", label: "Surat Hakmilik Sementara" },
  { value: "OTHERS", label: "Others" },
];

const sizeUnits = [...FARM_SIZE_UNITS];

interface Props {
  programs: CreateProgramDto;
  onChange: (programs: CreateProgramDto) => void;
}

export function EligibilityBuilder({ programs, onChange }: Props) {
  const [farmSizeUnit, setFarmSizeUnit] = useState<
    (typeof FARM_SIZE_UNITS)[number]
  >(sizeUnits[0]);
  const [cropSheetVisible, setCropSheetVisible] = useState(false);
  const [cropSheetSearch, setCropSheetSearch] = useState("");
  const [cropSheetSelection, setCropSheetSelection] = useState<string[]>([]);
  const [landDocSheetVisible, setLandDocSheetVisible] = useState(false);
  const [landDocSheetSearch, setLandDocSheetSearch] = useState("");
  const [landDocSheetSelection, setLandDocSheetSelection] = useState<string[]>(
    []
  );
  const [showCropDropdown, setShowCropDropdown] = useState(false);
  const [showLandDocDropdown, setShowLandDocDropdown] = useState(false);

  const updateProgram = (updates: Partial<CreateProgramDto>) => {
    onChange({ ...programs, ...updates });
  };

  const updateEligibility = (
    updates: Partial<CreateProgramDto["eligibility"]> = {}
  ) => {
    updateProgram({
      eligibility: {
        ...programs.eligibility,
        ...updates,
        landDocumentTypes:
          updates.landDocumentTypes ??
          programs.eligibility?.landDocumentTypes ??
          [],
      },
    });
  };

  const updateEligibilityList = (field: EligibilityListField, text: string) => {
    const items = text
      .split(",")
      .map((item) => item.replace(/\s+/g, " "))
      .map((item) => item.replace(/^\s+/, ""));

    updateEligibility({
      [field]: items.filter((item) => item.trim().length > 0),
    });
  };

  const addEligibilityValue = (field: EligibilityListField, value: string) => {
    const normalized =
      field === "cropTypes" ? value.trim().toUpperCase() : value.trim();
    if (!normalized) return;
    const current = (programs.eligibility ?? {})[field] ?? [];
    if (current.includes(normalized)) return;
    updateEligibility({
      [field]: [...current, normalized],
    });
  };

  const addLandDocumentType = (value: string) => {
    const normalized = value.trim().replace(/\s+/g, "_").toUpperCase();
    if (!normalized) return;
    addEligibilityValue("landDocumentTypes", normalized);
  };

  const clearEligibility = (field: EligibilityListField) => {
    updateEligibility({ [field]: [] });
  };

  const removeEligibilityValue = (
    field: EligibilityListField,
    value: string
  ) => {
    updateEligibility({
      [field]: ((programs.eligibility ?? {})[field] ?? []).filter(
        (item) => item.toLowerCase() !== value.toLowerCase()
      ),
    });
  };

  const selectedCropTypes = programs.eligibility?.cropTypes ?? [];
  const availableCropOptions = cropSuggestions.filter(
    (crop) => !selectedCropTypes.includes(crop)
  );
  const filteredCropOptions = availableCropOptions.filter((crop) =>
    crop.toUpperCase().includes(cropSheetSearch.trim().toUpperCase())
  );

  const availableLandDocOptions = useMemo(() => {
    const selectedLandDocs = programs.eligibility?.landDocumentTypes ?? [];
    return landDocumentTypeOptions.filter(
      (opt) =>
        !selectedLandDocs.includes(
          opt.value as CreateProgramEligibilityDtoLandDocumentTypesItem
        )
    );
  }, [programs.eligibility?.landDocumentTypes]);
  const filteredLandDocOptions = availableLandDocOptions.filter((opt) =>
    opt.label.toUpperCase().includes(landDocSheetSearch.trim().toUpperCase())
  );

  const toggleCropSheetSelection = (crop: string) => {
    setCropSheetSelection((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop]
    );
  };

  const confirmCropSheetSelection = () => {
    cropSheetSelection.forEach((crop) =>
      addEligibilityValue("cropTypes", crop)
    );
    setCropSheetSelection([]);
    setCropSheetSearch("");
    setCropSheetVisible(false);
  };

  const toggleLandDocSheetSelection = (value: string) => {
    setLandDocSheetSelection((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const confirmLandDocSheetSelection = () => {
    landDocSheetSelection.forEach((doc) => addLandDocumentType(doc));
    setLandDocSheetSelection([]);
    setLandDocSheetSearch("");
    setLandDocSheetVisible(false);
  };

  return (
    <View className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
      <Text className="text-gray-900 text-base font-bold mb-3">
        B. Eligibility Builder
      </Text>
      <View className="gap-3">
        <View className="gap-2">
          <Text className="text-gray-700 text-sm font-semibold">Farm Size</Text>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-gray-600 text-xs mb-1">
                Minimum ({FARM_SIZE_UNIT_LABELS[farmSizeUnit].toLowerCase()})
              </Text>
              <View className="rounded-xl border border-gray-200 bg-white">
                <TextInput
                  value={programs.eligibility?.minFarmSize?.toString() || ""}
                  onChangeText={(text) =>
                    updateEligibility({
                      minFarmSize: text ? parseFloat(text) : undefined,
                    })
                  }
                  placeholder="e.g., 5.5"
                  keyboardType="numeric"
                  className="px-4 py-3 text-gray-900 text-base"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-gray-600 text-xs mb-1">
                Maximum ({FARM_SIZE_UNIT_LABELS[farmSizeUnit].toLowerCase()})
              </Text>
              <View className="rounded-xl border border-gray-200 bg-white">
                <TextInput
                  value={programs.eligibility?.maxFarmSize?.toString() || ""}
                  onChangeText={(text) =>
                    updateEligibility({
                      maxFarmSize: text ? parseFloat(text) : undefined,
                    })
                  }
                  placeholder="Leave blank for no cap"
                  keyboardType="numeric"
                  className="px-4 py-3 text-gray-900 text-base"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          </View>
          <View className="flex-row flex-wrap gap-2 mt-3">
            {sizeUnits.map((unit) => {
              const isSelected = farmSizeUnit === unit;
              const label =
                FARM_SIZE_UNIT_LABELS[
                  unit as keyof typeof FARM_SIZE_UNIT_LABELS
                ] ?? unit.replace(/_/g, " ").toLowerCase();
              return (
                <TouchableOpacity
                  key={unit}
                  onPress={() => setFarmSizeUnit(unit)}
                  className={`px-4 py-2 rounded-full border ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      isSelected ? "text-blue-700" : "text-gray-600"
                    }`}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text className="text-gray-500 text-xs">
            Selected unit applies to both min and max values.
          </Text>
        </View>

        <View>
          <Text className="text-gray-600 text-xs mb-1">States*</Text>
          <TextInput
            value={programs?.eligibility?.states?.join(", ")}
            onChangeText={(text) => updateEligibilityList("states", text)}
            placeholder="e.g., Kedah, Perlis, Penang"
            className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View>
          <Text className="text-gray-600 text-xs mb-1">Districts</Text>
          <TextInput
            value={programs?.eligibility?.districts?.join(", ")}
            onChangeText={(text) => updateEligibilityList("districts", text)}
            placeholder="e.g., Kubang Pasu, Kangar"
            className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View>
          <Text className="text-gray-600 text-xs mb-1">Crop Types*</Text>
          <View className="rounded-xl border border-gray-200 bg-white px-3 py-2">
            <View className="flex-row justify-between items-start gap-2">
              <View className="flex-1 flex-row flex-wrap gap-2">
                {(programs?.eligibility?.cropTypes ?? []).map((crop) => (
                  <View
                    key={crop}
                    className="flex-row items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200"
                  >
                    <Text className="text-sm font-medium text-blue-700">
                      {crop}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeEligibilityValue("cropTypes", crop)}
                    >
                      <Text className="text-xs text-blue-700">×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                onPress={() => clearEligibility("cropTypes")}
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
                  : setCropSheetVisible(true)
              }
              className="flex-row items-center justify-between px-4 py-3 rounded-lg border border-blue-200 bg-blue-50"
            >
              <Text className="text-sm font-semibold text-blue-800">
                Choose from list
              </Text>
              <Text className="text-blue-700 text-lg">
                {Platform.OS === "web" && showCropDropdown ? "▲" : "▼"}
              </Text>
            </TouchableOpacity>
            {Platform.OS === "web" && showCropDropdown ? (
              <View className="mt-2 rounded-lg border border-blue-200 bg-white max-h-52">
                <ScrollView>
                  {availableCropOptions.map((crop) => (
                    <TouchableOpacity
                      key={crop}
                      onPress={() => {
                        addEligibilityValue("cropTypes", crop);
                        setShowCropDropdown(false);
                      }}
                      className="px-4 py-2 border-b border-blue-100 last:border-b-0"
                    >
                      <Text className="text-sm text-blue-800">{crop}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </View>
        </View>

        <View>
          <Text className="text-gray-600 text-xs mb-1">
            Land Document Types
          </Text>
          <View className="rounded-xl border border-gray-200 bg-white px-3 py-2">
            <View className="flex-row justify-between items-start gap-2">
              <View className="flex-1 flex-row flex-wrap gap-2">
                {(programs?.eligibility?.landDocumentTypes ?? []).map(
                  (docType) => (
                    <View
                      key={docType}
                      className="flex-row items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200"
                    >
                      <Text className="text-sm font-medium text-blue-700">
                        {docType.replace(/_/g, " ")}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          removeEligibilityValue("landDocumentTypes", docType)
                        }
                      >
                        <Text className="text-xs text-blue-700">×</Text>
                      </TouchableOpacity>
                    </View>
                  )
                )}
              </View>
              <TouchableOpacity
                onPress={() => clearEligibility("landDocumentTypes")}
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
                  ? setShowLandDocDropdown((prev) => !prev)
                  : setLandDocSheetVisible(true)
              }
              className="flex-row items-center justify-between px-4 py-3 rounded-lg border border-blue-200 bg-blue-50"
            >
              <Text className="text-sm font-semibold text-blue-800">
                Choose from list
              </Text>
              <Text className="text-blue-700 text-lg">
                {Platform.OS === "web" && showLandDocDropdown ? "▲" : "▼"}
              </Text>
            </TouchableOpacity>
            {Platform.OS === "web" && showLandDocDropdown ? (
              <View className="mt-2 rounded-lg border border-blue-200 bg-white max-h-52">
                <ScrollView>
                  {availableLandDocOptions.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => {
                        addLandDocumentType(opt.value);
                        setShowLandDocDropdown(false);
                      }}
                      className="px-4 py-2 border-b border-blue-100 last:border-b-0"
                    >
                      <Text className="text-sm text-blue-800">{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </View>
        </View>

        <Modal
          visible={cropSheetVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setCropSheetVisible(false)}
        >
          <View className="flex-1 justify-end bg-black/40">
            <Pressable
              className="flex-1"
              onPress={() => setCropSheetVisible(false)}
            />
            <View className="bg-white rounded-t-3xl p-4 pt-2">
              <View className="items-center mb-3">
                <View className="h-1.5 w-14 bg-gray-300 rounded-full" />
              </View>
              <Text className="text-lg font-semibold text-blue-900 mb-2">
                Select Crop Types
              </Text>
              <TextInput
                value={cropSheetSearch}
                onChangeText={setCropSheetSearch}
                placeholder="Search crop categories"
                placeholderTextColor="#9ca3af"
                className="border border-blue-200 rounded-lg px-3 py-2 text-gray-900"
              />
              <ScrollView style={{ maxHeight: 320 }} className="mt-3">
                {filteredCropOptions.map((crop) => {
                  const checked = cropSheetSelection.includes(crop);
                  return (
                    <TouchableOpacity
                      key={crop}
                      onPress={() => toggleCropSheetSelection(crop)}
                      className="flex-row items-center gap-3 px-2 py-2 border-b border-blue-100 last:border-b-0"
                    >
                      <View
                        className={`w-5 h-5 rounded-md border ${
                          checked
                            ? "bg-blue-500 border-blue-600"
                            : "border-blue-300"
                        }`}
                      />
                      <Text className="text-base text-blue-900">{crop}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <TouchableOpacity
                onPress={confirmCropSheetSelection}
                className="mt-4 bg-blue-600 rounded-lg py-3 items-center"
              >
                <Text className="text-white font-semibold text-base">
                  Add Selected
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          visible={landDocSheetVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setLandDocSheetVisible(false)}
        >
          <View className="flex-1 justify-end bg-black/40">
            <Pressable
              className="flex-1"
              onPress={() => setLandDocSheetVisible(false)}
            />
            <View className="bg-white rounded-t-3xl p-4 pt-2">
              <View className="items-center mb-3">
                <View className="h-1.5 w-14 bg-gray-300 rounded-full" />
              </View>
              <Text className="text-lg font-semibold text-blue-900 mb-2">
                Select Land Document Types
              </Text>
              <TextInput
                value={landDocSheetSearch}
                onChangeText={setLandDocSheetSearch}
                placeholder="Search documents"
                placeholderTextColor="#9ca3af"
                className="border border-blue-200 rounded-lg px-3 py-2 text-gray-900"
              />
              <ScrollView style={{ maxHeight: 320 }} className="mt-3">
                {filteredLandDocOptions.map((opt) => {
                  const checked = landDocSheetSelection.includes(opt.value);
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => toggleLandDocSheetSelection(opt.value)}
                      className="flex-row items-center gap-3 px-2 py-2 border-b border-blue-100 last:border-b-0"
                    >
                      <View
                        className={`w-5 h-5 rounded-md border ${
                          checked
                            ? "bg-blue-500 border-blue-600"
                            : "border-blue-300"
                        }`}
                      />
                      <Text className="text-base text-blue-900">
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <TouchableOpacity
                onPress={confirmLandDocSheetSelection}
                className="mt-4 bg-blue-600 rounded-lg py-3 items-center"
              >
                <Text className="text-white font-semibold text-base">
                  Add Selected
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

export default EligibilityBuilder;
