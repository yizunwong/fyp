import { useEffect, useRef, useState } from "react";
import { View, ScrollView, Platform, useWindowDimensions } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FarmerLayout from "@/components/ui/FarmerLayout";
import {
  FARM_SIZE_UNITS,
  RegisterFarmFormData,
  registerFarmSchema,
  RegisterFarmSuccessData,
} from "@/validation/farm";
import { useAuthControllerProfile } from "@/api";
import {
  useCreateFarmMutation,
  useFarmQuery,
  useUpdateFarmMutation,
} from "@/hooks/useFarm";
import { ThemedView } from "@/components/ThemedView";
import { parseError } from "@/utils/format-error";
import {
  buildSubmission,
  createInitialForm,
  extractFarmSummary,
  toRegisterFarmFormData,
} from "@/utils/farm";
import {
  FarmFormSection,
  FarmPreviewCard,
  FarmSuccessModal,
  RegisterFarmHeader,
} from "@/components/farmer/register-farm";

const cropSuggestions = ["Rice", "Vegetables", "Fruits", "Herbs", "Cocoa"];
const sizeUnits = [...FARM_SIZE_UNITS] as RegisterFarmFormData["sizeUnit"][];

export default function RegisterFarmPage() {
  const router = useRouter();
  const { farmId: farmIdParam } = useLocalSearchParams<{ farmId?: string }>();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && (width === 0 ? true : width >= 1024);

  const farmId = farmIdParam;
  const isEditMode = Boolean(farmId);

  const { data: profileData } = useAuthControllerProfile();
  const farmerId = profileData?.data?.id ?? "";
  const { createFarm } = useCreateFarmMutation();
  const { updateFarm } = useUpdateFarmMutation();
  const farmQuery = useFarmQuery(farmerId, farmId ?? "");

  const form = useForm<RegisterFarmFormData>({
    resolver: zodResolver(registerFarmSchema),
    defaultValues: createInitialForm(),
    mode: "onSubmit",
  });

  const { watch, clearErrors, reset, handleSubmit } = form;
  const formData = watch();

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] =
    useState<RegisterFarmSuccessData | null>(null);
  const farmInitialDataRef = useRef<RegisterFarmFormData | null>(null);
  const previousFarmSnapshotRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isEditMode) {
      farmInitialDataRef.current = null;
      previousFarmSnapshotRef.current = null;
      return;
    }

    const farm = farmQuery.data?.data;
    if (!farm) return;

    const snapshot = JSON.stringify(farm);
    if (previousFarmSnapshotRef.current === snapshot) return;

    previousFarmSnapshotRef.current = snapshot;
    const normalized = toRegisterFarmFormData(farm);
    farmInitialDataRef.current = normalized;
    reset(normalized);
    clearErrors();
  }, [isEditMode, farmQuery.data?.data, reset, clearErrors]);

  useEffect(() => {
    if (!farmQuery.error) return;
    Toast.show({
      type: "error",
      text1: "Unable to load farm",
      text2: parseError(farmQuery.error) ?? "Failed to fetch farm details.",
    });
  }, [farmQuery.error]);

  const handleReset = () => {
    const baseline = farmInitialDataRef.current ?? createInitialForm();
    reset(baseline);
    clearErrors();
  };

  const handleInvalidSubmit = () => {
    Toast.show({
      type: "error",
      text1: "Missing information",
      text2: "Please complete the highlighted fields to continue.",
    });
  };

  const handleValidSubmit = async (values: RegisterFarmFormData) => {
    if (!farmerId) {
      Toast.show({
        type: "error",
        text1: "Profile missing",
        text2: "We could not confirm your farmer profile. Please try again.",
      });
      return;
    }

    const { createPayload, normalizedValues, trimmedName, trimmedLocation } =
      buildSubmission(values);

    try {
      const createdFarm = await createFarm(farmerId, createPayload);
      const summary = extractFarmSummary(
        createdFarm,
        trimmedName,
        trimmedLocation
      );

      reset(normalizedValues);
      setSuccessData(summary);
      setShowSuccessModal(true);
    } catch (error) {
      const message = parseError(error) || "Failed to register farm.";
      form.setError("root", { message });
      Toast.show({
        type: "error",
        text1: "Registration failed",
        text2: message,
      });
    }
  };

  const handleValidUpdate = async (values: RegisterFarmFormData) => {
    if (!farmerId || !farmId) {
      Toast.show({
        type: "error",
        text1: "Update unavailable",
        text2: "Missing required identifiers for this farm.",
      });
      return;
    }

    const { updatePayload, normalizedValues, trimmedName } =
      buildSubmission(values);

    try {
      await updateFarm(farmerId, farmId, updatePayload);
      Toast.show({
        type: "success",
        text1: "Farm updated",
        text2: `${trimmedName || "Farm"} details saved successfully.`,
      });

      farmInitialDataRef.current = normalizedValues;
      reset(normalizedValues);
      previousFarmSnapshotRef.current = null;
      if (farmQuery.refetch) {
        await farmQuery.refetch();
      }
    } catch (error) {
      const message = parseError(error) || "Failed to update farm.";
      form.setError("root", { message });
      Toast.show({
        type: "error",
        text1: "Update failed",
        text2: message,
      });
    }
  };

  const submitForm = handleSubmit(
    isEditMode ? handleValidUpdate : handleValidSubmit,
    handleInvalidSubmit
  );

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessData(null);
  };

  const handleBackToDashboard = () => {
    closeSuccessModal();
    router.push("/dashboard/farmer");
  };

  const handleRegisterAnother = () => {
    closeSuccessModal();
    const baseline = createInitialForm();
    reset(baseline);
    clearErrors();
    farmInitialDataRef.current = null;
    previousFarmSnapshotRef.current = null;
  };

  const handleMobileBack = () => {
    router.back();
  };

  const scrollContentStyle = {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  };

  const headerTitle = isEditMode ? "Edit Farm" : "Register New Farm";
  const headerSubtitle = isEditMode
    ? "Update farm details to keep your records current"
    : "Capture farm details to link future produce batches";
  const submitLabel = isEditMode ? "Save Changes" : "Register Farm";

  if (isDesktop) {
    return (
      <>
        <FarmerLayout headerTitle={headerTitle} headerSubtitle={headerSubtitle}>
          <View className="p-6">
            <View className="flex-row gap-6">
              <View className="flex-1">
                <FarmFormSection
                  form={form}
                  sizeUnits={sizeUnits}
                  cropSuggestions={cropSuggestions}
                  onSubmit={submitForm}
                  onReset={handleReset}
                  submitLabel={submitLabel}
                />
              </View>
              <View className="w-[360px]">
                <FarmPreviewCard formData={formData} />
              </View>
            </View>
          </View>
        </FarmerLayout>
        <FarmSuccessModal
          visible={showSuccessModal}
          successData={successData}
          onBackToDashboard={handleBackToDashboard}
          onRegisterAnother={handleRegisterAnother}
          onClose={closeSuccessModal}
        />
      </>
    );
  }

  return (
    <ThemedView className="flex-1 bg-gray-50">
      <RegisterFarmHeader
        onBack={handleMobileBack}
        title={headerTitle}
        subtitle={headerSubtitle}
      />
      <ScrollView className="flex-1" contentContainerStyle={scrollContentStyle}>
        <FarmFormSection
          form={form}
          sizeUnits={sizeUnits}
          cropSuggestions={cropSuggestions}
          onSubmit={submitForm}
          onReset={handleReset}
          submitLabel={submitLabel}
        />
        <FarmPreviewCard formData={formData} compact />
      </ScrollView>
      <FarmSuccessModal
        visible={showSuccessModal}
        successData={successData}
        onBackToDashboard={handleBackToDashboard}
        onRegisterAnother={handleRegisterAnother}
        onClose={closeSuccessModal}
      />
    </ThemedView>
  );
}
