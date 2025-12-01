import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { CheckCircle, Save, ArrowLeft } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { useAgencyLayout } from "@/components/agency/layout/AgencyLayoutContext";
import usePolicy from "@/hooks/usePolicy";
import type {
  CreatePolicyDto,
  CreatePolicyEligibilityDto,
  CreatePolicyDtoStatus,
  CreatePolicyDtoType,
  CreatePayoutRuleDto,
  CreatePayoutRuleDtoBeneficiaryCategory,
  CreatePayoutRuleDtoFrequency,
} from "@/api";
import { useSubsidyPolicyCreation } from "@/hooks/useBlockchain";
import {
  FARM_SIZE_UNIT_LABELS,
  FARM_SIZE_UNITS,
} from "@/validation/farm";
import { Trash } from "lucide-react-native";

const payoutFrequencies: CreatePayoutRuleDtoFrequency[] = [
  "per_trigger",
  "annual",
  "monthly",
];

const beneficiaryCategories: CreatePayoutRuleDtoBeneficiaryCategory[] = [
  "all_farmers",
  "small_medium_farmers",
  "organic_farmers",
  "certified_farmers",
];

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

type PolicyForm = Omit<CreatePolicyDto, "eligibility" | "payoutRule"> & {
  eligibility: Omit<CreatePolicyEligibilityDto, "certifications"> & {
    landDocumentTypes?: string[];
  };
  payoutRule: CreatePayoutRuleDto;
  description: string;
  status: CreatePolicyDtoStatus;
};

type EligibilityListField =
  | "states"
  | "districts"
  | "cropTypes"
  | "landDocumentTypes";

const defaultPolicy: PolicyForm = {
  name: "",
  description: "",
  type: "manual",
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
  status: "draft",
  eligibility: {
    minFarmSize: undefined,
    maxFarmSize: undefined,
    states: [],
    districts: [],
    cropTypes: [],
    landDocumentTypes: [],
  },
  payoutRule: {
    amount: 0,
    frequency: "per_trigger",
    maxCap: 0,
    beneficiaryCategory: "all_farmers",
  },
  createdBy: "Current Officer",
};

export default function CreatePolicyScreen() {
  const [policy, setPolicy] = useState<PolicyForm>(defaultPolicy);
  const [farmSizeUnit, setFarmSizeUnit] = useState<
    (typeof FARM_SIZE_UNITS)[number]
  >(sizeUnits[0]);
  const { createPolicy, isCreatingPolicy } = usePolicy();
  const { createPolicyOnChain, isWriting, isWaitingReceipt } =
    useSubsidyPolicyCreation();

  useAgencyLayout({
    title: "Create Policy",
    subtitle: "Define a new subsidy policy for your agency",
  });

  const [cropSheetVisible, setCropSheetVisible] = useState(false);
  const [cropSheetSearch, setCropSheetSearch] = useState("");
  const [cropSheetSelection, setCropSheetSelection] = useState<string[]>([]);
  const [landDocSheetVisible, setLandDocSheetVisible] = useState(false);
  const [landDocSheetSearch, setLandDocSheetSearch] = useState("");
  const [landDocSheetSelection, setLandDocSheetSelection] = useState<string[]>(
    []
  );
  const [showCropDropdown, setShowCropDropdown] = useState(false); // web fallback
  const [showLandDocDropdown, setShowLandDocDropdown] = useState(false); // web fallback

  const updateEligibilityList = (field: EligibilityListField, text: string) => {
    setPolicy((prev) => ({
      ...prev,
      eligibility: {
        ...prev.eligibility,
        [field]: text
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      },
    }));
  };

  const addEligibilityValue = (field: EligibilityListField, value: string) => {
    const normalized =
      field === "cropTypes" ? value.trim().toUpperCase() : value.trim();
    if (!normalized) return;
    setPolicy((prev) => {
      const current = prev.eligibility[field] ?? [];
      if (current.includes(normalized)) return prev;
      return {
        ...prev,
        eligibility: {
          ...prev.eligibility,
          [field]: [...current, normalized],
        },
      };
    });
  };

  const addLandDocumentType = (value: string) => {
    const normalized = value.trim().replace(/\s+/g, "_").toUpperCase();
    if (!normalized) return;
    addEligibilityValue("landDocumentTypes", normalized);
  };

  const clearEligibility = (field: EligibilityListField) => {
    setPolicy((prev) => ({
      ...prev,
      eligibility: {
        ...prev.eligibility,
        [field]: [],
      },
    }));
  };

  const selectedCropTypes = policy.eligibility.cropTypes ?? [];
  const availableCropOptions = cropSuggestions.filter(
    (crop) => !selectedCropTypes.includes(crop)
  );
  const filteredCropOptions = availableCropOptions.filter((crop) =>
    crop.toUpperCase().includes(cropSheetSearch.trim().toUpperCase())
  );

  const selectedLandDocs = policy.eligibility.landDocumentTypes ?? [];
  const availableLandDocOptions = landDocumentTypeOptions.filter(
    (opt) => !selectedLandDocs.includes(opt.value)
  );
  const filteredLandDocOptions = availableLandDocOptions.filter((opt) =>
    opt.label.toUpperCase().includes(landDocSheetSearch.trim().toUpperCase())
  );

  const toggleCropSheetSelection = (crop: string) => {
    setCropSheetSelection((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop]
    );
  };

  const confirmCropSheetSelection = () => {
    cropSheetSelection.forEach((crop) => addEligibilityValue("cropTypes", crop));
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

  const removeEligibilityValue = (
    field: EligibilityListField,
    value: string
  ) => {
    setPolicy((prev) => ({
      ...prev,
      eligibility: {
        ...prev.eligibility,
        [field]: (prev.eligibility[field] ?? []).filter(
          (item) => item.toLowerCase() !== value.toLowerCase()
        ),
      },
    }));
  };

  const buildPayload = (status: CreatePolicyDtoStatus): CreatePolicyDto => {
    const eligibility = policy.eligibility;
    const payload = {
      name: policy.name,
      description: policy.description || undefined,
      type: policy.type,
      startDate: policy.startDate,
      endDate: policy.endDate,
      status,
      createdBy: policy.createdBy,
      eligibility: {
        ...eligibility,
        states: eligibility?.states?.length ? eligibility.states : undefined,
        districts: eligibility?.districts?.length
          ? eligibility.districts
          : undefined,
        cropTypes: eligibility?.cropTypes?.length
          ? eligibility.cropTypes
          : undefined,
        landDocumentTypes: eligibility?.landDocumentTypes?.length
          ? eligibility.landDocumentTypes
          : undefined,
      },
      payoutRule: {
        ...policy.payoutRule,
        frequency: policy.payoutRule.frequency as CreatePayoutRuleDtoFrequency,
        beneficiaryCategory: policy.payoutRule
          .beneficiaryCategory as CreatePayoutRuleDtoBeneficiaryCategory,
      },
    };
    return payload as unknown as CreatePolicyDto;
  };

  const handleSubmit = async (
    status: CreatePolicyDtoStatus,
    successMessage: { title: string; subtitle: string }
  ) => {
    const payload = buildPayload(status);
    try {
      const { policyId } = await createPolicyOnChain(payload);
      await createPolicy(payload);
      Toast.show({
        type: "success",
        text1: successMessage.title,
        text2:
          successMessage.subtitle +
          (policyId !== undefined ? ` (On-chain ID: ${policyId})` : ""),
      });
      router.push("/dashboard/agency/policies" as never);
    } catch (error) {
      console.error("Error creating policy:", error); 
      Toast.show({
        type: "error",
        text1: "Failed to save policy",
        text2: (error as Error)?.message ?? "Something went wrong",
      });
    }
  };

  const handleSaveDraft = () =>
    handleSubmit("draft", {
      title: "Draft saved",
      subtitle: "Policy created on-chain and stored as draft",
    });

  const handlePublish = () =>
    handleSubmit("active", {
      title: "Policy published",
      subtitle: "New policy is on-chain and saved in the dashboard",
    });

  const isSubmittingPolicy = isCreatingPolicy || isWriting || isWaitingReceipt;

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-white rounded-full items-center justify-center border border-gray-200"
          >
            <ArrowLeft color="#111827" size={20} />
          </TouchableOpacity>
          <View>
            <Text className="text-gray-900 text-xl font-bold">
              Create Policy
            </Text>
            <Text className="text-gray-600 text-sm">
              Configure eligibility and payouts
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/dashboard/agency/policies" as never)}
          className="px-3 py-2 rounded-lg bg-white border border-gray-200"
        >
          <Text className="text-gray-700 text-sm font-semibold">
            Back to Policies
          </Text>
        </TouchableOpacity>
      </View>

  <View className="px-6 pb-6">
    <View className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
      <Text className="text-gray-900 text-base font-bold mb-3">
        A. Policy Basics & Payout
      </Text>
      <View className="gap-3">
        <View>
          <Text className="text-gray-600 text-xs mb-1">Policy Name*</Text>
          <TextInput
                value={policy.name}
                onChangeText={(text) => setPolicy({ ...policy, name: text })}
                placeholder="e.g., Drought Relief Subsidy 2025"
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View>
              <Text className="text-gray-600 text-xs mb-1">Description*</Text>
              <TextInput
                value={policy.description}
                onChangeText={(text) =>
                  setPolicy({ ...policy, description: text })
                }
                placeholder="Brief description of the policy purpose"
                multiline
                numberOfLines={3}
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                placeholderTextColor="#9ca3af"
                style={{ textAlignVertical: "top" }}
              />
            </View>

            <View>
              <Text className="text-gray-600 text-xs mb-1">Policy Type*</Text>
              <View className="flex-row flex-wrap gap-2">
                {["drought", "flood", "crop_loss", "manual"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() =>
                      setPolicy({
                        ...policy,
                        type: type as CreatePolicyDtoType,
                      })
                    }
                    className={`px-4 py-2 rounded-lg border ${
                      policy.type === type
                        ? "bg-blue-50 border-blue-500"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium capitalize ${
                        policy.type === type ? "text-blue-700" : "text-gray-700"
                      }`}
                    >
                      {type.replace("_", " ")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-gray-600 text-xs mb-1">Start Date*</Text>
                <TextInput
                  value={policy.startDate}
                  onChangeText={(text) =>
                    setPolicy({ ...policy, startDate: text })
                  }
                  placeholder="YYYY-MM-DD"
                  className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-600 text-xs mb-1">End Date*</Text>
                <TextInput
                  value={policy.endDate}
                  onChangeText={(text) =>
                    setPolicy({ ...policy, endDate: text })
                  }
                  placeholder="YYYY-MM-DD"
                  className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          </View>
          </View>

          <View className="gap-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
            <Text className="text-blue-900 text-sm font-semibold">
              Payout Configuration
            </Text>
            {policy.type === "flood" ? (
              <Text className="text-blue-800 text-xs">
                Automated payouts run every 1 hour for flood policies (powered by Chainlink).
              </Text>
            ) : null}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-gray-700 text-xs mb-1">
                  Payout Amount (RM)*
                </Text>
                <TextInput
                  value={policy.payoutRule.amount.toString()}
                  onChangeText={(text) =>
                    setPolicy({
                      ...policy,
                      payoutRule: {
                        ...policy.payoutRule,
                        amount: parseFloat(text) || 0,
                      },
                    })
                  }
                  placeholder="5000"
                  keyboardType="numeric"
                  className="bg-white border border-blue-200 rounded-lg px-4 py-3 text-gray-900 text-sm"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 text-xs mb-1">
                  Maximum Cap (RM)
                </Text>
                <TextInput
                  value={policy.payoutRule.maxCap.toString()}
                  onChangeText={(text) =>
                    setPolicy({
                      ...policy,
                      payoutRule: {
                        ...policy.payoutRule,
                        maxCap: parseFloat(text) || 0,
                      },
                    })
                  }
                  placeholder="15000"
                  keyboardType="numeric"
                  className="bg-white border border-blue-200 rounded-lg px-4 py-3 text-gray-900 text-sm"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          </View>

          <View className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <Text className="text-gray-900 text-base font-bold mb-3">
            B. Eligibility Builder
          </Text>
          <View className="gap-3">
            <View className="gap-2">
              <Text className="text-gray-700 text-sm font-semibold">
                Farm Size
              </Text>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-gray-600 text-xs mb-1">
                    Minimum ({FARM_SIZE_UNIT_LABELS[farmSizeUnit].toLowerCase()})
                  </Text>
                  <View className="rounded-xl border border-gray-200 bg-white">
                    <TextInput
                      value={policy.eligibility.minFarmSize?.toString() || ""}
                      onChangeText={(text) =>
                        setPolicy({
                          ...policy,
                          eligibility: {
                            ...policy.eligibility,
                            minFarmSize: text ? parseFloat(text) : undefined,
                          },
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
                      value={policy.eligibility.maxFarmSize?.toString() || ""}
                      onChangeText={(text) =>
                        setPolicy({
                          ...policy,
                          eligibility: {
                            ...policy.eligibility,
                            maxFarmSize: text ? parseFloat(text) : undefined,
                          },
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
                value={policy?.eligibility?.states?.join(", ")}
                onChangeText={(text) => updateEligibilityList("states", text)}
                placeholder="e.g., Kedah, Perlis, Penang"
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View>
              <Text className="text-gray-600 text-xs mb-1">Districts</Text>
              <TextInput
                value={policy?.eligibility?.districts?.join(", ")}
                onChangeText={(text) =>
                  updateEligibilityList("districts", text)
                }
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
                    {(policy?.eligibility?.cropTypes ?? []).map((crop) => (
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
                          <Text className="text-xs text-blue-700">✕</Text>
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
                    {(policy?.eligibility?.landDocumentTypes ?? []).map(
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
                            <Text className="text-xs text-blue-700">✕</Text>
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
                          <Text className="text-sm text-blue-800">
                            {opt.label}
                          </Text>
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
                              checked ? "bg-blue-500 border-blue-600" : "border-blue-300"
                            }`}
                          />
                          <Text className="text-base text-blue-900">
                            {crop}
                          </Text>
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
                              checked ? "bg-blue-500 border-blue-600" : "border-blue-300"
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

        <View className="gap-3">
          <TouchableOpacity
            className="rounded-lg overflow-hidden"
            onPress={handlePublish}
            disabled={isSubmittingPolicy}
            style={{ opacity: isSubmittingPolicy ? 0.7 : 1 }}
          >
            <LinearGradient
              colors={["#22c55e", "#15803d"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="flex-row items-center justify-center gap-2 py-3"
            >
              <CheckCircle color="#fff" size={20} />
              <Text className="text-white text-[15px] font-bold">
                Publish Policy
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSaveDraft}
            disabled={isSubmittingPolicy}
            style={{ opacity: isSubmittingPolicy ? 0.7 : 1 }}
            className="flex-row items-center justify-center gap-2 bg-gray-100 border border-gray-300 rounded-lg py-3"
          >
            <Save color="#6b7280" size={20} />
            <Text className="text-gray-700 text-[15px] font-bold">
              Save as Draft
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
