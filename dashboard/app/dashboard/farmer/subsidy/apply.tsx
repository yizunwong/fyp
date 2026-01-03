import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Map,
  MapPin,
  Leaf,
  FileText,
  Ruler,
  Search,
  Check,
} from "lucide-react-native";
import { router } from "expo-router";
import { useFarmerLayout } from "@/components/farmer/layout/FarmerLayoutContext";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { formatDate } from "@/components/farmer/farm-produce/utils";
import EthAmountDisplay from "@/components/common/EthAmountDisplay";
import {
  useEnrollProgramMutation,
  useFarmerProgramsQuery,
  useProgramsQuery,
} from "@/hooks/useProgram";
import { useFarmsQuery } from "@/hooks/useFarm";
import { useSubsidyPayout } from "@/hooks/useBlockchain";
import type { ProgramResponseDto, FarmListRespondDto } from "@/api";
import { formatFarmLocation } from "@/utils/farm";
import Toast from "react-native-toast-message";

export default function ApplySubsidyScreen() {
  const { isDesktop } = useResponsiveLayout();
  const [formData, setFormData] = useState({
    programId: "",
    farmId: "",
    amount: "",
    remarks: "",
  });
  const [newReferenceId, setNewReferenceId] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showEligibility, setShowEligibility] = useState(true);
  const [eligibilityErrors, setEligibilityErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(
    "Application Submitted Successfully!"
  );
  const [autoEnrolledProgramId, setAutoEnrolledProgramId] = useState<
    string | null
  >(null);
  const [programSearch, setProgramSearch] = useState("");
  const [farmSearch, setFarmSearch] = useState("");
  const {
    programs,
    isLoading: isLoadingPrograms,
    error: programsError,
  } = useProgramsQuery();
  const { programs: enrolledPrograms, isLoading: isLoadingEnrolled } =
    useFarmerProgramsQuery();
  const {
    data: farmsData,
    isLoading: isLoadingFarms,
    error: farmsError,
  } = useFarmsQuery();
  const { walletAddress, enrollInProgram, isWriting, isWaitingReceipt } =
    useSubsidyPayout();
  const { enrollProgram, isEnrollingProgram } = useEnrollProgramMutation();
  const isRequestingSubsidy = false;

  const programOptions = useMemo(() => programs ?? [], [programs]);
  const farms = useMemo(
    () => (Array.isArray(farmsData?.data) ? farmsData.data : []),
    [farmsData?.data]
  );
  const verifiedFarms = useMemo(
    () => farms.filter((farm) => farm.verificationStatus === "VERIFIED"),
    [farms]
  );

  const filteredProgramOptions = useMemo(() => {
    const normalized = programSearch.trim().toLowerCase();
    if (!normalized) return programOptions;
    return programOptions.filter(
      (program) =>
        program.name.toLowerCase().includes(normalized) ||
        program.description?.toLowerCase().includes(normalized)
    );
  }, [programOptions, programSearch]);

  const filteredFarmOptions = useMemo(() => {
    const normalized = farmSearch.trim().toLowerCase();
    if (!normalized) return verifiedFarms;
    return verifiedFarms.filter(
      (farm) =>
        farm.name.toLowerCase().includes(normalized) ||
        formatFarmLocation(farm).toLowerCase().includes(normalized)
    );
  }, [verifiedFarms, farmSearch]);
  const selectedProgram = programOptions.find(
    (program) => program.id === formData.programId
  );
  const isEnrolledInSelected = Boolean(
    selectedProgram &&
      enrolledPrograms?.some((programs) => programs.id === selectedProgram.id)
  );
  const selectedProgramOnChainId = selectedProgram?.onchainId;
  console.log("selectedProgramOnChainId", selectedProgramOnChainId);
  const walletConnected = Boolean(walletAddress);
  const isFloodProgram = selectedProgram?.type === "flood";
  const isActionDisabled =
    !walletConnected ||
    isSubmitting ||
    isWriting ||
    isWaitingReceipt ||
    isRequestingSubsidy ||
    isEnrollingProgram;

  const normalizeLocation = (value?: string) =>
    (value ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9]/gi, "")
      .trim();

  useEffect(() => {
    if (!formData.farmId && verifiedFarms.length > 0) {
      setFormData((prev) => ({ ...prev, farmId: verifiedFarms[0].id }));
    }
  }, [verifiedFarms, formData.farmId]);

  useEffect(() => {
    if (!selectedProgram || !isFloodProgram || !walletConnected) return;
    if (autoEnrolledProgramId === selectedProgram.id) return;
    if (!selectedProgramOnChainId && selectedProgramOnChainId !== 0) return;
    const enrollFloodProgram = async () => {
      try {
        setIsSubmitting(true);
        setNewReferenceId("");
        const programsIdBigInt = BigInt(selectedProgramOnChainId);
        try {
          await enrollInProgram(programsIdBigInt);
        } catch (err) {
          const msg = (err as Error)?.message ?? "";
          if (!msg.includes("Already enrolled")) {
            throw err;
          }
        }
        setAutoEnrolledProgramId(selectedProgram.id);
        setSuccessMessage(
          "Enrolled. Claims will be generated automatically if the flood trigger occurs."
        );
        setShowSuccess(true);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Failed to enroll in flood programs",
          text2: (error as Error)?.message ?? "Please try again",
        });
      } finally {
        setIsSubmitting(false);
      }
    };
    enrollFloodProgram();
  }, [
    selectedProgram,
    selectedProgramOnChainId,
    isFloodProgram,
    walletConnected,
    autoEnrolledProgramId,
    enrollInProgram,
  ]);

  const extractLandDocumentTypes = (farm?: {
    farmDocuments?: { type?: string | null }[];
  }): string[] => {
    if (!farm) return [];

    const fromFarmDocuments = Array.isArray(farm.farmDocuments)
      ? farm.farmDocuments
          .map((doc) =>
            typeof doc?.type === "string" ? doc.type.trim() : null
          )
          .filter((t): t is string => Boolean(t))
      : [];

    return Array.from(new Set(fromFarmDocuments));
  };

  const eligibilityValidationSchema = z
    .object({
      program: z.object({
        eligibility: z
          .object({
            cropTypes: z.array(z.string()).optional(),
            landDocumentTypes: z.array(z.string()).optional(),
            minFarmSize: z.number().optional(),
            maxFarmSize: z.number().optional(),
            states: z.array(z.string()).optional(),
            districts: z.array(z.string()).optional(),
          })
          .partial()
          .optional(),
      }),
      farm: z.object({
        produceCategories: z.array(z.string()).optional(),
        size: z.number().optional(),
        farmDocuments: z
          .array(
            z
              .object({
                type: z.string().optional(),
              })
              .passthrough()
          )
          .optional(),
        state: z.string().optional(),
        district: z.string().optional(),
      }),
    })
    .superRefine(({ program, farm }, ctx) => {
      const eligibility = program.eligibility || {};
      const programsCrops = eligibility.cropTypes ?? [];
      const farmCrops = farm.produceCategories ?? [];
      if (programsCrops.length) {
        const overlap = farmCrops.filter((crop) =>
          programsCrops.includes(crop)
        );
        if (!overlap.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Selected farm crop types do not meet the programs crop requirements.",
            path: ["farm", "produceCategories"],
          });
        }
      }

      if (
        typeof eligibility.minFarmSize === "number" &&
        typeof farm.size === "number" &&
        farm.size < eligibility.minFarmSize
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Farm size is below the minimum requirement (${eligibility.minFarmSize}).`,
          path: ["farm", "size"],
        });
      }
      if (
        typeof eligibility.maxFarmSize === "number" &&
        typeof farm.size === "number" &&
        farm.size > eligibility.maxFarmSize
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Farm size exceeds the maximum allowed (${eligibility.maxFarmSize}).`,
          path: ["farm", "size"],
        });
      }

      const programsStates =
        eligibility.states?.filter((state) => typeof state === "string") ?? [];
      const programsDistrictsRaw =
        eligibility.districts?.filter(
          (district) => typeof district === "string"
        ) ?? [];

      const normalizedStates = programsStates.map((s) => normalizeLocation(s));
      const normalizedDistricts = programsDistrictsRaw.map((d) =>
        normalizeLocation(d)
      );

      const locationMatches = (candidate: string) =>
        candidate &&
        (normalizedStates.includes(candidate) ||
          normalizedDistricts.includes(candidate));

      if (programsStates.length) {
        const farmState = normalizeLocation(farm.state);
        const matchesState = farmState
          ? locationMatches(farmState) ||
            normalizedStates.some(
              (state) => state.includes(farmState) || farmState.includes(state)
            )
          : false;
        if (!matchesState) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Farm state is not eligible for this program.",
            path: ["farm", "state"],
          });
        }
      }

      if (programsDistrictsRaw.length) {
        const farmDistrict = normalizeLocation(farm.district);
        const matchesDistrict = farmDistrict
          ? locationMatches(farmDistrict) ||
            normalizedDistricts.some(
              (district) =>
                district.includes(farmDistrict) ||
                farmDistrict.includes(district)
            )
          : false;
        if (!matchesDistrict) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Farm district is not eligible for this program.",
            path: ["farm", "district"],
          });
        }
      }

      const programsDocs = eligibility.landDocumentTypes ?? [];
      if (programsDocs.length) {
        const farmDocs = extractLandDocumentTypes(farm);
        const missingDocs = programsDocs.filter(
          (required) => !farmDocs.includes(required)
        );
        if (missingDocs.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Missing required land documents: ${missingDocs.join(
              ", "
            )}`,
            path: ["farm", "farmDocuments"],
          });
        }
      }
    });

  const getEligibilityIssues = (
    program?: ProgramResponseDto,
    farm?: FarmListRespondDto
  ) => {
    if (!program || !farm) return [];
    const validation = eligibilityValidationSchema.safeParse({
      program,
      farm,
    });
    if (validation.success) return [];
    return validation.error.errors.map((issue) => issue.message);
  };

  const renderChips = (
    items?: string[],
    neutralLabel?: string,
    missingLabel?: string
  ) => {
    if (!items || items.length === 0) {
      if (missingLabel) {
        return (
          <View className="px-3 py-1 rounded-full bg-orange-50 border border-orange-200">
            <Text className="text-orange-700 text-xs font-semibold">
              {missingLabel}
            </Text>
          </View>
        );
      }
      if (neutralLabel) {
        return (
          <View className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200">
            <Text className="text-gray-700 text-xs font-semibold">
              {neutralLabel}
            </Text>
          </View>
        );
      }
    }
    return (
      <View className="flex-row flex-wrap gap-2">
        {items &&
          items.map((item) => (
            <View
              key={item}
              className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 hover:-translate-y-0.5 hover:shadow-sm transition"
            >
              <Text className="text-emerald-800 text-xs font-semibold">
                {item}
              </Text>
            </View>
          ))}
      </View>
    );
  };

  const layoutMeta = useMemo(
    () => ({
      title: "Apply for Subsidy",
      subtitle: "Choose a program and review eligibility before submitting",
    }),
    []
  );

  useFarmerLayout(layoutMeta);

  const handleEnroll = async () => {
    if (!selectedProgram) return;
    if (isFloodProgram) return;
    if (!walletConnected) {
      Toast.show({
        type: "error",
        text1: "Connect your wallet to enroll.",
      });
      return;
    }

    const onChainId = selectedProgramOnChainId;
    if (onChainId === undefined || onChainId === null) {
      Toast.show({
        type: "error",
        text1: "Program on-chain ID is not available.",
      });
      return;
    }

    let programsIdBigInt: bigint;
    try {
      programsIdBigInt = BigInt(onChainId);
    } catch {
      Toast.show({
        type: "error",
        text1: "Program on-chain ID is not valid for enrollment.",
      });
      return;
    }

    try {
      await enrollInProgram(programsIdBigInt);
      await enrollProgram(selectedProgram.id);

      Toast.show({
        type: "success",
        text1: "Enrolled successfully",
        text2: "You can Submit Subsidys from the Subsidy Management page.",
      });
    } catch (err) {
      const msg = (err as Error)?.message ?? "";
      if (msg.includes("Already enrolled")) {
        try {
          await enrollProgram(selectedProgram.id);
        } catch {
          // ignore backend duplicate
        }
        Toast.show({
          type: "info",
          text1: "Already enrolled",
          text2: "You can Submit Subsidys from the Subsidy Management page.",
        });
        return;
      }
      Toast.show({
        type: "error",
        text1: "Failed to enroll in programs",
        text2: msg || "Please try again.",
      });
    }
  };

  const resetAndGoBack = () => {
    setFormData({ programId: "", farmId: "", amount: "", remarks: "" });
    setEligibilityErrors([]);
    setAutoEnrolledProgramId(null);
    setSuccessMessage("Application Submitted Successfully!");
    setShowSuccess(false);
    router.replace("/dashboard/farmer/subsidy");
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24 }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center gap-2 mb-4"
        >
          <ArrowLeft color="#111827" size={18} />
          <Text className="text-gray-900 text-sm font-semibold">
            Back to Subsidies
          </Text>
        </TouchableOpacity>

        {!walletConnected && (
          <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <Text className="text-amber-800 text-sm font-semibold mb-1">
              Connect Wallet
            </Text>
            <Text className="text-amber-700 text-xs">
              Please connect your wallet before enrolling or submitting claims.
              All actions are disabled until a wallet is connected.
            </Text>
          </View>
        )}

        <View className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          {/* Program Selection */}
          <View className="mb-4">
            <Text className="text-gray-900 text-lg font-bold mb-4">
              Select Program *
            </Text>
            {isLoadingPrograms || isLoadingEnrolled ? (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color="#059669" />
                <Text className="text-gray-500 text-xs mt-2">
                  Loading programs...
                </Text>
              </View>
            ) : programsError ? (
              <Text className="text-red-600 text-sm">
                Failed to load programs. Please try again.
              </Text>
            ) : programOptions.length === 0 ? (
              <Text className="text-gray-600 text-sm">
                No programs available to apply right now.
              </Text>
            ) : (
              <View className="gap-3">
                <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3">
                  <Search color="#9ca3af" size={18} />
                  <TextInput
                    value={programSearch}
                    onChangeText={setProgramSearch}
                    placeholder="Search programs by name or description"
                    className="flex-1 ml-3 text-gray-900 text-base"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View className="border border-gray-200 rounded-xl bg-white max-h-64 overflow-hidden">
                  <ScrollView keyboardShouldPersistTaps="handled">
                    {filteredProgramOptions.length ? (
                      filteredProgramOptions.map((program, index) => {
                        const isSelected = formData.programId === program.id;
                        return (
                          <TouchableOpacity
                            key={program.id}
                            disabled={isActionDisabled}
                            onPress={() =>
                              setFormData({
                                ...formData,
                                programId: program.id,
                              })
                            }
                            activeOpacity={0.8}
                            className={`px-4 py-3 ${
                              index !== filteredProgramOptions.length - 1
                                ? "border-b border-gray-100"
                                : ""
                            } ${
                              isSelected
                                ? "bg-emerald-50 border-emerald-200"
                                : ""
                            }`}
                            style={
                              isActionDisabled ? { opacity: 0.5 } : undefined
                            }
                          >
                            <View className="flex-row items-center justify-between gap-3">
                              <View className="flex-1">
                                <Text
                                  className={`text-sm font-semibold ${
                                    isSelected
                                      ? "text-emerald-700"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {program.name}
                                </Text>
                                {program.description && (
                                  <Text className="text-gray-500 text-xs mt-0.5">
                                    {program.description}
                                  </Text>
                                )}
                                <View className="flex-row items-center gap-1 mt-1">
                                  <Text className="text-gray-500 text-xs">
                                    Max Payout:
                                  </Text>
                                  <EthAmountDisplay
                                    ethAmount={program.payoutRule?.maxCap ?? 0}
                                    textClassName="text-gray-500 text-xs font-semibold"
                                    myrClassName="text-gray-400 text-[10px]"
                                  />
                                </View>
                                {isSelected && isEnrolledInSelected && (
                                  <Text className="text-emerald-700 text-xs font-semibold mt-1">
                                    Already enrolled
                                  </Text>
                                )}
                              </View>
                              {isSelected ? (
                                <Check color="#047857" size={18} />
                              ) : null}
                            </View>
                          </TouchableOpacity>
                        );
                      })
                    ) : (
                      <View className="px-4 py-3">
                        <Text className="text-gray-500 text-sm">
                          No programs match your search.
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              </View>
            )}
          </View>

          {/* Divider */}
          {selectedProgram && (
            <View className="border-b border-gray-200 my-6" />
          )}

          {/* Program Details & Eligibility */}
          {selectedProgram && (
            <>
              <View className="mb-4">
                <Text className="text-gray-900 text-lg font-bold mb-4">
                  Program Details
                </Text>
                <View className="gap-3">
                  <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                    <Text className="text-gray-600 text-xs mb-1">
                      Program Name
                    </Text>
                    <Text className="text-gray-900 text-sm font-semibold">
                      {selectedProgram.name}
                    </Text>
                    {!!selectedProgram.description && (
                      <Text className="text-gray-600 text-xs mt-1">
                        {selectedProgram.description}
                      </Text>
                    )}
                  </View>
                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                        <Text className="text-gray-600 text-xs mb-1">
                          Active From
                        </Text>
                        <Text className="text-gray-900 text-sm font-medium">
                          {formatDate(selectedProgram.startDate)}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-1">
                      <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                        <Text className="text-gray-600 text-xs mb-1">
                          Until
                        </Text>
                        <Text className="text-gray-900 text-sm font-medium">
                          {formatDate(selectedProgram.endDate)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                    <Text className="text-gray-600 text-xs mb-1">
                      Maximum Payout
                    </Text>
                    <EthAmountDisplay
                      ethAmount={selectedProgram.payoutRule?.maxCap ?? 0}
                      textClassName="text-gray-900 text-sm font-bold"
                      myrClassName="text-gray-500 text-xs"
                    />
                  </View>
                </View>
              </View>

              {/* Divider */}
              <View className="border-b border-gray-200 my-6" />

              {/* Eligibility Section */}
              <View className="mb-2">
                <TouchableOpacity
                  onPress={() => setShowEligibility((prev) => !prev)}
                  disabled={isActionDisabled}
                  className="flex-row items-center justify-between mb-3"
                  style={isActionDisabled ? { opacity: 0.6 } : undefined}
                >
                  <Text className="text-gray-900 text-lg font-bold mb-4">
                    Eligibility Requirements
                  </Text>
                  {showEligibility ? (
                    <ChevronUp color="#6b7280" size={16} />
                  ) : (
                    <ChevronDown color="#6b7280" size={16} />
                  )}
                </TouchableOpacity>
                {showEligibility && (
                  <View
                    className={isDesktop ? "flex-row flex-wrap gap-3" : "gap-3"}
                  >
                    <View
                      className={`bg-gray-50 rounded-xl p-3 border border-gray-100 ${
                        isDesktop ? "flex-1 min-w-[48%]" : ""
                      }`}
                    >
                      <View className="flex-row items-center gap-2 mb-1">
                        <Map color="#059669" size={14} />
                        <Text className="text-gray-600 text-xs">States</Text>
                      </View>
                      {renderChips(
                        selectedProgram.eligibility?.states ?? [],
                        "Any state",
                        "States not provided"
                      )}
                    </View>
                    <View
                      className={`bg-gray-50 rounded-xl p-3 border border-gray-100 ${
                        isDesktop ? "flex-1 min-w-[48%]" : ""
                      }`}
                    >
                      <View className="flex-row items-center gap-2 mb-1">
                        <MapPin color="#059669" size={14} />
                        <Text className="text-gray-600 text-xs">Districts</Text>
                      </View>
                      {renderChips(
                        selectedProgram.eligibility?.districts ?? [],
                        "Any district",
                        "Districts not provided"
                      )}
                    </View>
                    <View
                      className={`bg-gray-50 rounded-xl p-3 border border-gray-100 ${
                        isDesktop ? "flex-1 min-w-[48%]" : ""
                      }`}
                    >
                      <View className="flex-row items-center gap-2 mb-1">
                        <Leaf color="#059669" size={14} />
                        <Text className="text-gray-600 text-xs">
                          Crop Types
                        </Text>
                      </View>
                      {renderChips(
                        selectedProgram.eligibility?.cropTypes ?? [],
                        "Any crop type",
                        "Crop types not provided"
                      )}
                    </View>
                    <View
                      className={`bg-gray-50 rounded-xl p-3 border border-gray-100 ${
                        isDesktop ? "flex-1 min-w-[48%]" : ""
                      }`}
                    >
                      <View className="flex-row items-center gap-2 mb-1">
                        <FileText color="#059669" size={14} />
                        <Text className="text-gray-600 text-xs">
                          Land Documents
                        </Text>
                      </View>
                      {renderChips(
                        selectedProgram.eligibility?.landDocumentTypes ?? [],
                        "Any document",
                        "Documents not provided"
                      )}
                    </View>
                    <View
                      className={`bg-gray-50 rounded-xl p-3 border border-gray-100 ${
                        isDesktop ? "flex-1 min-w-[48%]" : ""
                      }`}
                    >
                      <View className="flex-row items-center gap-2 mb-1">
                        <Ruler color="#059669" size={14} />
                        <Text className="text-gray-600 text-xs">Farm Size</Text>
                      </View>
                      <Text className="text-gray-900 text-xs">
                        {selectedProgram.eligibility?.minFarmSize ||
                        selectedProgram.eligibility?.maxFarmSize
                          ? `${
                              selectedProgram.eligibility?.minFarmSize ?? "Any"
                            } - ${
                              selectedProgram.eligibility?.maxFarmSize ??
                              "No cap"
                            }`
                          : "Any size"}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Divider */}
              <View className="border-b border-gray-200 my-6" />

              {/* Farm Selection */}
              <View className="mb-4">
                <Text className="text-gray-900 text-lg font-bold mb-2">
                  Select Farm *
                </Text>
                {isLoadingFarms ? (
                  <View className="items-center py-4">
                    <ActivityIndicator size="small" color="#059669" />
                    <Text className="text-gray-500 text-xs mt-2">
                      Loading farms...
                    </Text>
                  </View>
                ) : farmsError ? (
                  <Text className="text-red-600 text-sm">
                    Failed to load farms. Please try again.
                  </Text>
                ) : verifiedFarms.length === 0 ? (
                  <Text className="text-gray-600 text-sm">
                    No verified farms available. Verify a farm to proceed.
                  </Text>
                ) : (
                  <View className="gap-3">
                    <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3">
                      <Search color="#9ca3af" size={18} />
                      <TextInput
                        value={farmSearch}
                        onChangeText={setFarmSearch}
                        placeholder="Search farms by name or location"
                        className="flex-1 ml-3 text-gray-900 text-base"
                        placeholderTextColor="#9ca3af"
                      />
                    </View>
                    <View className="border border-gray-200 rounded-xl bg-white max-h-64 overflow-hidden">
                      <ScrollView keyboardShouldPersistTaps="handled">
                        {filteredFarmOptions.length ? (
                          filteredFarmOptions.map((farm, index) => {
                            const isSelected = formData.farmId === farm.id;
                            const issues = selectedProgram
                              ? getEligibilityIssues(selectedProgram, farm)
                              : [];
                            const isEligibleForProgram = selectedProgram
                              ? issues.length === 0
                              : true;
                            const locationLabel = formatFarmLocation(farm);
                            return (
                              <TouchableOpacity
                                key={farm.id}
                                disabled={isActionDisabled}
                                onPress={() =>
                                  setFormData({ ...formData, farmId: farm.id })
                                }
                                activeOpacity={0.8}
                                className={`px-4 py-3 ${
                                  index !== filteredFarmOptions.length - 1
                                    ? "border-b border-gray-100"
                                    : ""
                                } ${
                                  isSelected
                                    ? "bg-emerald-50 border-emerald-200"
                                    : ""
                                }`}
                                style={
                                  isActionDisabled
                                    ? { opacity: 0.5 }
                                    : undefined
                                }
                              >
                                <View className="flex-row items-center justify-between gap-3">
                                  <View className="flex-1">
                                    <View className="flex-row items-center justify-between mb-1">
                                      <Text
                                        className={`text-sm font-semibold ${
                                          isSelected
                                            ? "text-emerald-700"
                                            : "text-gray-900"
                                        }`}
                                        numberOfLines={1}
                                      >
                                        {farm.name}
                                      </Text>
                                      <View
                                        className={`px-2 py-0.5 rounded-full border ${
                                          selectedProgram
                                            ? isEligibleForProgram
                                              ? "bg-green-50 border-green-200"
                                              : "bg-red-50 border-red-200"
                                            : "bg-gray-50 border-gray-200"
                                        }`}
                                      >
                                        <Text
                                          className={`text-[10px] font-semibold ${
                                            selectedProgram
                                              ? isEligibleForProgram
                                                ? "text-green-700"
                                                : "text-red-700"
                                              : "text-gray-700"
                                          }`}
                                        >
                                          {selectedProgram
                                            ? isEligibleForProgram
                                              ? "Eligible"
                                              : "Not eligible"
                                            : "Select program"}
                                        </Text>
                                      </View>
                                    </View>
                                    <View className="flex-row items-center gap-2">
                                      <MapPin color="#6b7280" size={14} />
                                      <Text
                                        className="text-gray-500 text-xs"
                                        numberOfLines={1}
                                      >
                                        {locationLabel ||
                                          "Location unavailable"}
                                      </Text>
                                    </View>
                                    {selectedProgram && issues.length > 0 && (
                                      <Text
                                        className="text-red-700 text-[11px] mt-1"
                                        numberOfLines={1}
                                      >
                                        {issues[0]}
                                      </Text>
                                    )}
                                  </View>
                                  {isSelected ? (
                                    <Check color="#047857" size={18} />
                                  ) : null}
                                </View>
                              </TouchableOpacity>
                            );
                          })
                        ) : (
                          <View className="px-4 py-3">
                            <Text className="text-gray-500 text-sm">
                              No farms match your search.
                            </Text>
                          </View>
                        )}
                      </ScrollView>
                    </View>
                  </View>
                )}
                {eligibilityErrors.length > 0 && (
                  <View className="mt-3 p-3 rounded-lg border border-orange-200 bg-orange-50">
                    <Text className="text-orange-700 text-xs font-semibold mb-1">
                      Eligibility issues
                    </Text>
                    {eligibilityErrors.map((err) => (
                      <Text key={err} className="text-orange-700 text-xs">
                        • {err}
                      </Text>
                    ))}
                  </View>
                )}
              </View>

              {/* Divider */}
              <View className="border-b border-gray-200 my-6" />

              {/* Enroll Button */}
              {!isFloodProgram && (
                <View className="mb-4">
                  <TouchableOpacity
                    onPress={handleEnroll}
                    disabled={isActionDisabled || isEnrolledInSelected}
                    className="rounded-lg overflow-hidden"
                    style={
                      isActionDisabled || isEnrolledInSelected
                        ? { opacity: 0.6 }
                        : undefined
                    }
                  >
                    <LinearGradient
                      colors={["#22c55e", "#059669"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="py-3 items-center"
                    >
                      <Text className="text-white text-[15px] font-bold">
                        {isEnrolledInSelected
                          ? "Already Enrolled"
                          : "Enroll in Program"}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

              {isFloodProgram && (
                <View className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4">
                  <Text className="text-emerald-900 text-sm font-semibold mb-1">
                    Automated flood programs
                  </Text>
                  <Text className="text-emerald-800 text-xs">
                    You&apos;ll be enrolled automatically. Claims will be
                    created by the oracle when the flood trigger occurs. No
                    payout amount is needed.
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Submit-claim UI has been moved to Subsidy Management page */}
      </ScrollView>

      {showSuccess && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center px-6">
          <View className="bg-white rounded-2xl p-8 items-center max-w-sm w-full">
            <View className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-4">
              <CheckCircle color="#059669" size={40} />
            </View>
            <Text className="text-gray-900 text-xl font-bold mb-2 text-center">
              {successMessage}
            </Text>
            <Text className="text-gray-600 text-sm text-center mb-4">
              Your subsidy action has been recorded.
            </Text>
            {newReferenceId ? (
              <View className="bg-gray-100 rounded-lg p-3 w-full mb-4">
                <Text className="text-gray-600 text-xs text-center mb-1">
                  Reference ID
                </Text>
                <Text className="text-gray-900 text-[15px] font-bold text-center">
                  {newReferenceId}
                </Text>
              </View>
            ) : null}
            <TouchableOpacity
              onPress={resetAndGoBack}
              className="rounded-lg overflow-hidden w-full"
            >
              <LinearGradient
                colors={["#22c55e", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-3 items-center"
              >
                <Text className="text-white text-[15px] font-semibold">
                  Back to Subsidies
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
