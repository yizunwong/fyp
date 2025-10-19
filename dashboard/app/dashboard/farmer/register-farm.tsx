import { useState } from "react";
import {
  View,
  ScrollView,
  Platform,
  useWindowDimensions,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FarmerLayout from "@/components/ui/FarmerLayout";
import FarmFormSection from "@/components/farmer/register-farm/FarmFormSection";
import FarmPreviewCard from "@/components/farmer/register-farm/FarmPreviewCard";
import FarmSuccessModal from "@/components/farmer/register-farm/FarmSuccessModal";
import RegisterFarmHeader from "@/components/farmer/register-farm/RegisterFarmHeader";
import {
  RegisterFarmFormData,
  RegisterFarmSuccessData,
} from "@/components/farmer/register-farm/types";
import { FARM_SIZE_UNITS, registerFarmSchema } from "@/validation/farm";

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

export default function RegisterFarmPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;

  const form = useForm<RegisterFarmFormData>({
    resolver: zodResolver(registerFarmSchema),
    defaultValues: createInitialForm(),
    mode: "onSubmit",
  });

  const { watch, clearErrors, reset, handleSubmit } = form;

  const formData = watch();

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<RegisterFarmSuccessData | null>(
    null
  );
  const handleReset = () => {
    reset(createInitialForm());
    clearErrors();
  };

  const handleInvalidSubmit = () => {
    Alert.alert(
      "Missing information",
      "Please complete the highlighted fields to continue."
    );
  };

  const handleValidSubmit = async (values: RegisterFarmFormData) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      reset(values);

      const farmId = `FRM-${Math.floor(Math.random() * 100000)
        .toString()
        .padStart(5, "0")}`;

      setSuccessData({
        farmId,
        name: values.name,
        location: values.location,
      });
      setShowSuccessModal(true);
    } catch (error) {
      Alert.alert("Error", "Failed to register farm. Please try again.");
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
    <View className="flex-1 bg-gray-50">
      <RegisterFarmHeader onBack={handleMobileBack} />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: 32,
        }}
      >
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
    </View>
  );
}
