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
} from "lucide-react-native";
import { router } from "expo-router";
import { useFarmerLayout } from "@/components/farmer/layout/FarmerLayoutContext";
import { formatCurrency, formatDate } from "@/components/farmer/farm-produce/utils";
import { usePoliciesQuery } from "@/hooks/usePolicy";
import { useFarmsQuery } from "@/hooks/useFarm";
import { useSubsidyPayout } from "@/hooks/useBlockchain";
import { useRequestSubsidyMutation } from "@/hooks/useSubsidy";
import type { PolicyResponseDto, FarmListRespondDto } from "@/api";
import { formatFarmLocation } from "@/utils/farm";
import Toast from "react-native-toast-message";

export default function ApplySubsidyScreen() {
  const [formData, setFormData] = useState({
    programId: "",
    farmId: "",
    amount: "",
    remarks: "",
  });
  const [newReferenceId, setNewReferenceId] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [showEligibility, setShowEligibility] = useState(true);
  const [eligibilityErrors, setEligibilityErrors] = useState<string[]>([]);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(
    "Application Submitted Successfully!"
  );
  const [autoEnrolledPolicyId, setAutoEnrolledPolicyId] = useState<string | null>(null);
  const { policies, isLoading: isLoadingPrograms, error: programsError } =
    usePoliciesQuery();
  const {
    data: farmsData,
    isLoading: isLoadingFarms,
    error: farmsError,
  } = useFarmsQuery();
  const {
    walletAddress,
    enrollInPolicy,
    submitClaim,
    hashMetadata,
    isWriting,
    isWaitingReceipt,
  } = useSubsidyPayout();
  const { requestSubsidy, isPending: isRequestingSubsidy } =
    useRequestSubsidyMutation();

  const programOptions = policies ?? [];
  const farms = useMemo(
    () => (Array.isArray(farmsData?.data) ? farmsData.data : []),
    [farmsData?.data]
  );
  const verifiedFarms = useMemo(
    () => farms.filter((farm) => farm.verificationStatus === "VERIFIED"),
    [farms]
  );
  const selectedProgram = programOptions.find(
    (program) => program.id === formData.programId
  );
  const selectedFarm = verifiedFarms.find((farm) => farm.id === formData.farmId);
  const walletConnected = Boolean(walletAddress);
  const isFloodPolicy = selectedProgram?.type === "flood";
  const maxPayoutAmount =
    selectedProgram?.payoutRule?.amount !== undefined &&
    selectedProgram?.payoutRule?.amount !== null
      ? Number(selectedProgram.payoutRule.amount)
      : null;
  const amountNumeric = Number(formData.amount);
  const amountWithinMax =
    maxPayoutAmount && maxPayoutAmount > 0
      ? !Number.isNaN(amountNumeric) && amountNumeric <= maxPayoutAmount
      : true;
  const isAmountValid = isFloodPolicy
    ? true
    : formData.amount.trim().length > 0 &&
      !Number.isNaN(amountNumeric) &&
      amountNumeric > 0 &&
      amountWithinMax;
  const canSubmit = Boolean(
    !isFloodPolicy && formData.programId && formData.farmId && isAmountValid
  );
  const isActionDisabled =
    !walletConnected ||
    isSubmitting ||
    isWriting ||
    isWaitingReceipt ||
    isRequestingSubsidy;

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
    if (!selectedProgram || !isFloodPolicy || !walletConnected) return;
    if (autoEnrolledPolicyId === selectedProgram.id) return;
    const enrollFloodPolicy = async () => {
      try {
        setIsSubmitting(true);
        setNewReferenceId("");
        const policyIdBigInt = BigInt(selectedProgram.id);
        await enrollInPolicy(policyIdBigInt);
        setAutoEnrolledPolicyId(selectedProgram.id);
        setSuccessMessage(
          "Enrolled. Claims will be generated automatically if the flood trigger occurs."
        );
        setShowSuccess(true);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Failed to enroll in flood policy",
          text2: (error as Error)?.message ?? "Please try again",
        });
      } finally {
        setIsSubmitting(false);
      }
    };
    enrollFloodPolicy();
  }, [
    selectedProgram,
    isFloodPolicy,
    walletConnected,
    autoEnrolledPolicyId,
    enrollInPolicy,
  ]);

  const extractLandDocumentTypes = (
    farm?: { farmDocuments?: { type?: string | null }[] }
  ): string[] => {
    if (!farm) return [];

    const fromFarmDocuments = Array.isArray(farm.farmDocuments)
      ? farm.farmDocuments
          .map((doc) => (typeof doc?.type === "string" ? doc.type.trim() : null))
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
      const policyCrops = eligibility.cropTypes ?? [];
      const farmCrops = farm.produceCategories ?? [];
      if (policyCrops.length) {
        const overlap = farmCrops.filter((crop) =>
          policyCrops.includes(crop)
        );
        if (!overlap.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Selected farm crop types do not meet the policy crop requirements.",
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

      const policyStates =
        eligibility.states?.filter((state) => typeof state === "string") ?? [];
      const policyDistrictsRaw =
        eligibility.districts?.filter((district) => typeof district === "string") ??
        [];

      const normalizedStates = policyStates.map((s) => normalizeLocation(s));
      const normalizedDistricts = policyDistrictsRaw.map((d) => normalizeLocation(d));

      const locationMatches = (candidate: string) =>
        candidate &&
        (normalizedStates.includes(candidate) ||
          normalizedDistricts.includes(candidate));

      if (policyStates.length) {
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

      if (policyDistrictsRaw.length) {
        const farmDistrict = normalizeLocation(farm.district);
        const matchesDistrict = farmDistrict
          ? locationMatches(farmDistrict) ||
            normalizedDistricts.some(
              (district) =>
                district.includes(farmDistrict) || farmDistrict.includes(district)
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

      const policyDocs = eligibility.landDocumentTypes ?? [];
      if (policyDocs.length) {
        const farmDocs = extractLandDocumentTypes(farm);
        const missingDocs = policyDocs.filter(
          (required) => !farmDocs.includes(required)
        );
        if (missingDocs.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Missing required land documents: ${missingDocs.join(", ")}`,
            path: ["farm", "farmDocuments"],
          });
        }
      }
    });

  const getEligibilityIssues = (
    program?: PolicyResponseDto,
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
        {items && items.map((item) => (
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

  const handleSubmit = async () => {
    if (!selectedProgram || !formData.programId || !formData.farmId) return;
    if (isFloodPolicy) return;
    if (!walletConnected) {
      setAmountError("Connect your wallet to proceed.");
      return;
    }

    const parsedAmount = Number(formData.amount);
    if (!formData.amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setAmountError("Enter a payout amount greater than 0.");
      return;
    }
    if (
      maxPayoutAmount &&
      maxPayoutAmount > 0 &&
      parsedAmount > maxPayoutAmount
    ) {
      setAmountError(
        `Requested amount exceeds max payout of ${formatCurrency(maxPayoutAmount)}.`
      );
      return;
    }
    setAmountError(null);

    if (selectedFarm) {
      const issues = getEligibilityIssues(selectedProgram, selectedFarm);
      if (issues.length) {
        setEligibilityErrors(issues);
        return;
      }
      setEligibilityErrors([]);
    }

    try {
      setIsSubmitting(true);
      let policyIdBigInt: bigint;
      try {
        console.log("Enrolling in policy:", selectedProgram.id);
        policyIdBigInt = BigInt(selectedProgram.id);
      } catch {
        setAmountError("Policy id is not valid for on-chain enrollment.");
        return;
      }

      await enrollInPolicy(policyIdBigInt);

      const metadataPayload = JSON.stringify({
        amount: parsedAmount,
        remarks: formData.remarks ?? "",
        policyId: selectedProgram.id,
        timestamp: Date.now(),
      });
      const metadataHash = hashMetadata(metadataPayload);

      await submitClaim(policyIdBigInt, metadataHash);

      await requestSubsidy({
        amount: parsedAmount,
        policyId: selectedProgram.id,
        metadataHash,
      });

      const refId = `SUB-2025-${String(
        Math.floor(Math.random() * 9999)
      ).padStart(4, "0")}`;
      setNewReferenceId(refId);
      setSuccessMessage("Policy enrolled and claim submitted.");
      setShowSuccess(true);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Submission failed",
        text2: (error as Error)?.message ?? "Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndGoBack = () => {
    setFormData({ programId: "", farmId: "", amount: "", remarks: "" });
    setAmountError(null);
    setEligibilityErrors([]);
    setAutoEnrolledPolicyId(null);
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

        <View className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
          <Text className="text-gray-900 text-lg font-bold mb-1">
            Apply for Subsidy
          </Text>
          <Text className="text-gray-600 text-sm">
            Select a program, review its eligibility, add remarks, then submit
            your application.
          </Text>
        </View>

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

        <View className="bg-white rounded-2xl border border-gray-200 p-5 mb-4 shadow-sm">
          <Text className="text-gray-900 text-base font-semibold mb-2">
            Select Program *
          </Text>
          <Text className="text-gray-500 text-xs mb-3">
            Choose a policy to see its active period, payout, and eligibility.
          </Text>
          {isLoadingPrograms ? (
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
              {programOptions.map((program) => {
                const isSelected = formData.programId === program.id;
                return (
                  <TouchableOpacity
                    key={program.id}
                    disabled={isActionDisabled}
                    onPress={() =>
                      setFormData({ ...formData, programId: program.id })
                    }
                    className={`border rounded-xl p-4 ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/60"
                        : "border-gray-200 bg-white"
                    }`}
                    style={isActionDisabled ? { opacity: 0.5 } : undefined}
                  >
                    <Text
                      className={`text-sm font-semibold mb-1 ${
                        isSelected ? "text-emerald-700" : "text-gray-900"
                      }`}
                    >
                      {program.name}
                    </Text>
                    {!!program.description && (
                      <Text className="text-gray-600 text-xs mb-1">
                        {program.description}
                      </Text>
                    )}
                      <Text className="text-gray-500 text-xs">
                      Max payout: {formatCurrency(program.payoutRule?.amount ?? 0)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                onPress={() => {
                  setEligibilityErrors([]);
                  setAmountError(null);
                  setFormData({ programId: "", farmId: "", amount: "", remarks: "" });
                }}
                disabled={isActionDisabled}
                className="self-start px-3 py-2 rounded-lg border border-gray-200 bg-white mt-1"
                style={isActionDisabled ? { opacity: 0.5 } : undefined}
              >
                <Text className="text-gray-700 text-xs font-semibold">
                  Clear All
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {selectedProgram && (
          <View className="bg-white rounded-2xl border border-gray-200 p-5 mb-4 shadow-sm">
            <TouchableOpacity
              onPress={() => setShowDetails((prev) => !prev)}
              disabled={isActionDisabled}
              className="flex-row items-center justify-between mb-3"
              style={isActionDisabled ? { opacity: 0.6 } : undefined}
            >
              <Text className="text-gray-900 text-base font-semibold">
                Application Details
              </Text>
              {showDetails ? (
                <ChevronUp color="#111827" size={18} />
              ) : (
                <ChevronDown color="#111827" size={18} />
              )}
            </TouchableOpacity>
            <View className="gap-3">
              {showDetails && (
                <>
                  <View className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <Text className="text-gray-600 text-xs mb-1">Program</Text>
                    <Text className="text-gray-900 text-sm font-semibold">
                      {selectedProgram.name}
                    </Text>
                    {!!selectedProgram.description && (
                      <Text className="text-gray-600 text-xs mt-0.5">
                        {selectedProgram.description}
                      </Text>
                    )}
                  </View>
                  <View className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex-row justify-between">
                    <View>
                      <Text className="text-gray-600 text-xs mb-1">Active From</Text>
                      <Text className="text-gray-900 text-sm font-medium">
                        {formatDate(selectedProgram.startDate)}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-gray-600 text-xs mb-1">Until</Text>
                      <Text className="text-gray-900 text-sm font-medium">
                        {formatDate(selectedProgram.endDate)}
                      </Text>
                    </View>
                  </View>
                  <View className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex-row items-center justify-between">
                    <Text className="text-gray-600 text-xs">Payout Amount</Text>
                    <Text className="text-gray-900 text-sm font-bold">
                      {formatCurrency(selectedProgram.payoutRule?.amount ?? 0)}
                    </Text>
                  </View>
                </>
              )}
              <TouchableOpacity
                onPress={() => setShowEligibility((prev) => !prev)}
                disabled={isActionDisabled}
                className="flex-row items-center justify-between"
                style={isActionDisabled ? { opacity: 0.6 } : undefined}
              >
                <Text className="text-gray-900 text-base font-semibold">
                  Eligibility
                </Text>
                {showEligibility ? (
                  <ChevronUp color="#111827" size={18} />
                ) : (
                  <ChevronDown color="#111827" size={18} />
                )}
              </TouchableOpacity>
              {showEligibility && (
                <View className="gap-3">
                  <View className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Map color="#059669" size={14} />
                      <Text className="text-gray-600 text-xs">States</Text>
                    </View>
                    {renderChips(
                      selectedProgram.eligibility?.states ?? [],
                      "Any state",
                      "States not provided"
                    )}
                    <Text className="text-gray-500 text-[11px] mt-1">
                      Eligible states for this program.
                    </Text>
                  </View>
                  <View className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <View className="flex-row items-center gap-2 mb-1">
                      <MapPin color="#059669" size={14} />
                      <Text className="text-gray-600 text-xs">Districts</Text>
                    </View>
                    {renderChips(
                      selectedProgram.eligibility?.districts ?? [],
                      "Any district",
                      "Districts not provided"
                    )}
                    <Text className="text-gray-500 text-[11px] mt-1">
                      Narrow down by eligible districts.
                    </Text>
                  </View>
                  <View className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Leaf color="#059669" size={14} />
                      <Text className="text-gray-600 text-xs">Crop Types</Text>
                    </View>
                    {renderChips(
                      selectedProgram.eligibility?.cropTypes ?? [],
                      "Any crop type",
                      "Crop types not provided"
                    )}
                    <Text className="text-gray-500 text-[11px] mt-1">
                      Crops eligible for coverage.
                    </Text>
                  </View>
                  <View className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <View className="flex-row items-center gap-2 mb-1">
                      <FileText color="#059669" size={14} />
                      <Text className="text-gray-600 text-xs">Land Documents</Text>
                    </View>
                    {renderChips(
                      selectedProgram.eligibility?.landDocumentTypes ?? [],
                      "Any document",
                      "Documents not provided"
                    )}
                    <Text className="text-gray-500 text-[11px] mt-1">
                      Required land ownership documents.
                    </Text>
                  </View>
                  <View className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Ruler color="#059669" size={14} />
                      <Text className="text-gray-600 text-xs">Farm Size</Text>
                    </View>
                    <Text className="text-gray-900 text-xs">
                      {selectedProgram.eligibility?.minFarmSize ||
                      selectedProgram.eligibility?.maxFarmSize
                        ? `${selectedProgram.eligibility?.minFarmSize ?? "Any"} - ${
                            selectedProgram.eligibility?.maxFarmSize ?? "No cap"
                          }`
                        : "Any size"}
                    </Text>
                    <Text className="text-gray-500 text-[11px] mt-1">
                      Minimum and maximum eligible farm size.
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {selectedProgram && (
          <View className="bg-white rounded-2xl border border-gray-200 p-5 mb-4 shadow-sm">
            <Text className="text-gray-900 text-base font-semibold mb-2">
              Select Farm *
            </Text>
            <Text className="text-gray-500 text-xs mb-3">
              Choose a verified farm to link with this subsidy application.
            </Text>
            {isLoadingFarms ? (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color="#059669" />
                <Text className="text-gray-500 text-xs mt-2">Loading farms...</Text>
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
              <View className="flex-row flex-wrap gap-3">
                {verifiedFarms.map((farm) => {
                  const isSelected = formData.farmId === farm.id;
                  const issues = selectedProgram
                    ? getEligibilityIssues(selectedProgram, farm)
                    : [];
                  const isEligibleForProgram =
                    selectedProgram ? issues.length === 0 : true;
                  const locationLabel = formatFarmLocation(farm);
                  return (
                    <TouchableOpacity
                      key={farm.id}
                      disabled={isActionDisabled}
                      onPress={() => setFormData({ ...formData, farmId: farm.id })}
                      className={`flex-1 min-w-[220px] max-w-[300px] border rounded-xl p-4 ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50/60"
                          : "border-gray-200 bg-white"
                      }`}
                      style={isActionDisabled ? { opacity: 0.5 } : undefined}
                    >
                      <View className="flex-row items-center justify-between mb-2">
                        <Text
                          className={`text-sm font-semibold ${
                            isSelected ? "text-emerald-700" : "text-gray-900"
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
                              : farm.verificationStatus === "VERIFIED"
                                ? "bg-green-50 border-green-200"
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
                      <View className="flex-row items-center gap-2 mb-1">
                        <MapPin color="#6b7280" size={14} />
                        <Text className="text-gray-700 text-xs" numberOfLines={2}>
                          {locationLabel || "Location unavailable"}
                        </Text>
                      </View>
                      <Text className="text-gray-500 text-[11px]">
                        {selectedProgram && issues.length
                          ? "Eligibility requirements not met for this program."
                          : "Tap to select this farm."}
                      </Text>
                      {selectedProgram && issues.length > 0 && (
                        <View className="mt-2">
                          {issues.slice(0, 2).map((issue) => (
                            <Text
                              key={issue}
                              className="text-red-700 text-[11px]"
                              numberOfLines={2}
                            >
                              • {issue}
                            </Text>
                          ))}
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
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
        )}

        {selectedProgram && isFloodPolicy && (
          <View className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
            <Text className="text-emerald-900 text-sm font-semibold mb-1">
              Automated flood policy
            </Text>
            <Text className="text-emerald-800 text-xs">
              You’ll be enrolled automatically. Claims will be created by the
              oracle when the flood trigger occurs. No payout amount is needed.
            </Text>
          </View>
        )}

        {selectedProgram && !isFloodPolicy && (
          <View className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <Text className="text-gray-900 text-base font-semibold mb-2">
              Requested Payout Amount (RM) *
            </Text>
            <Text className="text-gray-500 text-xs mb-3">
              Enter how much payout you want to claim for this application.
            </Text>
            <TextInput
              value={formData.amount}
              onChangeText={(text) => {
                setAmountError(null);
                const sanitized = text.replace(/[^0-9.]/g, "");
                const parts = sanitized.split(".");
                let normalized =
                  parts.length <= 1
                    ? sanitized
                    : `${parts.shift() ?? ""}.${parts.join("").replace(/\./g, "")}`;
                const numericValue = Number(normalized);
                if (
                  maxPayoutAmount &&
                  maxPayoutAmount > 0 &&
                  !Number.isNaN(numericValue) &&
                  numericValue > maxPayoutAmount
                ) {
                  normalized = maxPayoutAmount.toString();
                  setAmountError(
                    `Cannot exceed max payout of ${formatCurrency(maxPayoutAmount)}.`
                  );
                }
                setFormData({ ...formData, amount: normalized });
              }}
              placeholder="e.g., 5000"
              keyboardType="numeric"
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
              placeholderTextColor="#9ca3af"
              editable={!isActionDisabled}
            />
            {amountError ? (
              <Text className="text-red-600 text-xs mt-1">{amountError}</Text>
            ) : (
              <Text className="text-gray-500 text-[11px] mt-1">
                Max payout for this program:{" "}
                {formatCurrency(selectedProgram.payoutRule?.amount ?? 0)}
              </Text>
            )}
          </View>
        )}

        <View className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <Text className="text-gray-900 text-base font-semibold mb-2">
            Remarks (Optional)
          </Text>
          <TextInput
            value={formData.remarks}
            onChangeText={(text) => setFormData({ ...formData, remarks: text })}
            placeholder="Add any additional notes..."
            multiline
            numberOfLines={4}
            className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
            placeholderTextColor="#9ca3af"
            style={{ textAlignVertical: "top" }}
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit || isActionDisabled}
          className="rounded-lg overflow-hidden"
          style={!canSubmit || isActionDisabled ? { opacity: 0.6 } : undefined}
        >
          <LinearGradient
            colors={
              canSubmit && !isActionDisabled
                ? ["#22c55e", "#059669"]
                : ["#9ca3af", "#6b7280"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-3 items-center"
          >
            <Text className="text-white text-[15px] font-semibold">
              Submit Application
            </Text>
          </LinearGradient>
        </TouchableOpacity>
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
