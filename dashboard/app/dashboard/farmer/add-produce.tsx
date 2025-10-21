import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import {
  Alert,
  Platform,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";

import {
  AddProduceBlockchainPreview,
  AddProduceForm,
  AddProduceHeader,
  AddProduceSuccessModal,
  type AddProduceFarmOption,
  type AddProduceUnitOption,
} from "@/components/farmer/add-produce";
import FarmerLayout from "@/components/ui/FarmerLayout";
import {
  addProduceSchema,
  PRODUCE_UNITS,
  type AddProduceFormData,
} from "@/validation/produce";

const mockFarms: AddProduceFarmOption[] = [
  { id: "1", name: "Green Valley Farm" },
  { id: "2", name: "Sunrise Acres" },
  { id: "3", name: "Organic Fields Estate" },
];

const unitOptions: AddProduceUnitOption[] = PRODUCE_UNITS.map((unit) => ({
  value: unit,
}));

export default function AddProducePage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;

  const formMethods = useForm<AddProduceFormData>({
    resolver: zodResolver(addProduceSchema),
    defaultValues: {
      name: "",
      harvestDate: "",
      farmId: "",
      quantity: "",
      unit: undefined,
      certifications: [],
    } as Partial<AddProduceFormData>,
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    txHash: string;
    qrCode: string;
    batchId: string;
  } | null>(null);

  const onSubmit = async (values: AddProduceFormData) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockResponse = {
        txHash: `0x${Math.random().toString(16).substring(2, 42)}`,
        qrCode:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        batchId: `BTH-${Math.floor(Math.random() * 100000)
          .toString()
          .padStart(5, "0")}`,
      };

      setSuccessData(mockResponse);
      setShowSuccessModal(true);
    } catch (error) {
      Alert.alert("Error", "Failed to record produce. Please try again.");
    }
  };

  const copyToClipboard = (text: string) => {
    if (Platform.OS === "web") {
      navigator.clipboard.writeText(text);
      Alert.alert("Copied", "Transaction hash copied to clipboard");
    }
  };

  const handleGoToDashboard = () => {
    setShowSuccessModal(false);
    router.push("/dashboard/farmer");
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  const renderForm = (
    <FormProvider {...formMethods}>
      <AddProduceForm
        farms={mockFarms}
        units={unitOptions}
        isDesktop={isDesktop}
        onCancel={() => router.back()}
        onSubmit={onSubmit}
      />
    </FormProvider>
  );

  const successModal = (
    <AddProduceSuccessModal
      visible={showSuccessModal}
      txHash={successData?.txHash}
      batchId={successData?.batchId}
      onCopyTxHash={copyToClipboard}
      onGoToDashboard={handleGoToDashboard}
      onClose={handleCloseModal}
    />
  );

  if (isDesktop) {
    return (
      <>
        <FarmerLayout
          headerTitle="Add New Produce Batch"
          headerSubtitle="Register your produce to generate a traceable blockchain record"
        >
          <View className="p-6">
            <View className="flex-row gap-6">
              {renderForm}
              <AddProduceBlockchainPreview />
            </View>
          </View>
        </FarmerLayout>
        {successModal}
      </>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <AddProduceHeader onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 20,
        }}
      >
        {renderForm}
      </ScrollView>
      {successModal}
    </View>
  );
}
