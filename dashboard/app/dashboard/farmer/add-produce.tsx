import { useCallback, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { Alert, Platform, View } from "react-native";
import { useRouter } from "expo-router";

import {
  AddProduceBlockchainPreview,
  AddProduceForm,
  AddProduceSuccessModal,
  type AddProduceFarmOption,
  type AddProduceUnitOption,
} from "@/components/farmer/add-produce";
import {
  addProduceSchema,
  PRODUCE_UNITS,
  type AddProduceFormData,
} from "@/validation/produce";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useFarmerLayout } from "@/components/farmer/layout/FarmerLayoutContext";

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
  const { isDesktop } = useResponsiveLayout();

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

  const { reset } = formMethods;

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
    } catch (err) {
      console.error("Failed to record produce batch", err);
      Alert.alert("Error", "Failed to record produce. Please try again.");
    }
  };

  // ✅ Proper Reset Handler
  const handleReset = useCallback(() => {
    reset({
      name: "",
      harvestDate: "",
      farmId: "",
      quantity: "",
      unit: undefined,
      certifications: [],
    });
  }, [reset]);

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

  const layoutMeta = useMemo(
    () => ({
      title: "Add New Produce Batch",
      subtitle:
        "Register your produce to generate a traceable blockchain record",
    }),
    []
  );

  useFarmerLayout(layoutMeta);

  const addProduceForm = (
    <FormProvider {...formMethods}>
      <AddProduceForm
        farms={mockFarms}
        units={unitOptions}
        isDesktop={isDesktop}
        onReset={handleReset}
        onSubmit={formMethods.handleSubmit(onSubmit)}
      />
    </FormProvider>
  );

  return (
    <>
      {isDesktop ? (
        <View className="p-6">
          <View className="flex-row gap-6">
            {addProduceForm}
            <AddProduceBlockchainPreview />
          </View>
        </View>
      ) : (
        <View className="gap-6">{addProduceForm}</View>
      )}

      <AddProduceSuccessModal
        visible={showSuccessModal}
        txHash={successData?.txHash}
        batchId={successData?.batchId}
        onCopyTxHash={copyToClipboard}
        onGoToDashboard={handleGoToDashboard}
        onClose={handleCloseModal}
      />
    </>
  );
}
