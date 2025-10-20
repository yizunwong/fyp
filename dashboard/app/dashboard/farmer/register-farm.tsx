import { useState } from "react";
import { View, ScrollView, Platform, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FarmerLayout from "@/components/ui/FarmerLayout";
import FarmFormSection from "@/components/farmer/register-farm/FarmFormSection";
import FarmPreviewCard from "@/components/farmer/register-farm/FarmPreviewCard";
import FarmSuccessModal from "@/components/farmer/register-farm/FarmSuccessModal";
import RegisterFarmHeader from "@/components/farmer/register-farm/RegisterFarmHeader";
import {
  FarmUploadedDocument,
  RegisterFarmFormData,
  RegisterFarmSuccessData,
} from "@/components/farmer/register-farm/types";
import { FARM_SIZE_UNITS, registerFarmSchema } from "@/validation/farm";
import { CreateFarmDto, useAuthControllerProfile } from "@/api";
import { useCreateFarmMutation } from "@/hooks/useFarm";
import { ThemedView } from "@/components/ThemedView";
import { parseError } from "@/utils/format-error";

const sizeUnits = [...FARM_SIZE_UNITS] as RegisterFarmFormData["sizeUnit"][];
const cropSuggestions = ["Rice", "Vegetables", "Fruits", "Herbs", "Cocoa"];

const createInitialForm = (): RegisterFarmFormData => ({
  name: "",
  location: "",
  size: "",
  sizeUnit: FARM_SIZE_UNITS[0],
  primaryCrops: "",
  landDocuments: [],
  certifications: [],
});

const serializeUploadedDocument = (doc: FarmUploadedDocument) => ({
  id: doc.id,
  name: doc.name,
  uri: doc.uri,
  mimeType: doc.mimeType,
  size: doc.size,
});

const buildDocumentsPayload = (
  values: RegisterFarmFormData
): CreateFarmDto["documents"] => {
  const landDocuments = (values.landDocuments ?? []).map(
    serializeUploadedDocument
  );
  const certifications = (values.certifications ?? []).map((cert) => ({
    type: cert.type,
    otherType: cert.otherType?.trim() || undefined,
    issueDate: cert.issueDate?.trim() || undefined,
    expiryDate: cert.expiryDate?.trim() || undefined,
    documents: (cert.documents ?? []).map(serializeUploadedDocument),
  }));

  return {
    landDocuments,
    certifications,
  };
};

export default function RegisterFarmPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && (width === 0 ? true : width >= 1024);

  const { data: profileData } = useAuthControllerProfile();
  const farmerId = profileData?.data?.id ?? '';
  const { createFarm } = useCreateFarmMutation();

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
  const handleReset = () => {
    reset(createInitialForm());
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
    const trimmedName = values.name.trim();
    const trimmedLocation = values.location.trim();
    const produceCategories = values.primaryCrops
      .split(",")
      .map((crop) => crop.trim())
      .filter(Boolean);
    const documents = buildDocumentsPayload(values);
    const payload: CreateFarmDto = {
      name: trimmedName,
      location: trimmedLocation,
      size: Number(values.size),
      sizeUnit: values.sizeUnit,
      produceCategories: produceCategories.length
        ? produceCategories
        : [values.primaryCrops.trim()],
      documents: documents ?? {},
    };

    try {
      const createdFarm = (await createFarm(farmerId!, payload)) as Partial<{
        id: string;
        name?: string;
        location?: string;
      }> | void;

      reset(values);
      setSuccessData({
        name:
          createdFarm && typeof createdFarm === "object" && createdFarm?.name
            ? String(createdFarm.name)
            : trimmedName,
        location:
          createdFarm &&
          typeof createdFarm === "object" &&
          createdFarm?.location
            ? String(createdFarm.location)
            : trimmedLocation,
      });
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

  const submitForm = handleSubmit(handleValidSubmit, handleInvalidSubmit);

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
    handleReset();
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

  if (isDesktop) {
    return (
      <>
        <FarmerLayout
          headerTitle="Register New Farm"
          headerSubtitle="Capture farm details to link future produce batches"
        >
          <View className="p-6">
            <View className="flex-row gap-6">
              <View className="flex-1">
                <FarmFormSection
                  form={form}
                  sizeUnits={sizeUnits}
                  cropSuggestions={cropSuggestions}
                  onSubmit={submitForm}
                  onReset={handleReset}
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
      <RegisterFarmHeader onBack={handleMobileBack} />
      <ScrollView className="flex-1" contentContainerStyle={scrollContentStyle}>
        <FarmFormSection
          form={form}
          sizeUnits={sizeUnits}
          cropSuggestions={cropSuggestions}
          onSubmit={submitForm}
          onReset={handleReset}
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
