import { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { Alert, Platform, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
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
import {
  CreateProduceDto,
  FarmListRespondDto,
  getFarmerControllerFindProducesQueryKey,
} from "@/api";
import { useFarmsQuery } from "@/hooks/useFarm";
import {
  useCreateProduceMutation,
  useUploadProduceImageMutation,
} from "@/hooks/useProduce";
import { parseError } from "@/utils/format-error";

const unitOptions: AddProduceUnitOption[] = PRODUCE_UNITS.map((unit) => ({
  value: unit,
}));

const createEmptyFormValues = (): Partial<AddProduceFormData> =>
  ({
    name: "",
    harvestDate: "",
    farmId: "",
    quantity: "",
    unit: undefined,
    produceImage: null,
    certifications: [],
  } as Partial<AddProduceFormData>);

const generateBatchId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0");
  return `BTH-${timestamp}-${random}`;
};

const deriveCategory = (
  farm?: FarmListRespondDto,
  produceName?: string
): string => {
  const [firstCategory] = farm?.produceCategories ?? [];
  if (firstCategory?.trim()) {
    return firstCategory.trim();
  }

  const nameSegment = produceName?.trim().split(/\s+/)[0];
  if (nameSegment) {
    return nameSegment;
  }

  return "General";
};

export default function AddProducePage() {
  const router = useRouter();
  const { isDesktop } = useResponsiveLayout();
  const queryClient = useQueryClient();

  const farmsQuery = useFarmsQuery();
  const farms = useMemo(
    () => (farmsQuery.data?.data ?? []) as FarmListRespondDto[],
    [farmsQuery.data?.data]
  );
  const farmOptions = useMemo<AddProduceFarmOption[]>(
    () =>
      farms.map((farm) => ({
        id: farm.id,
        name: farm.name,
      })),
    [farms]
  );

  const { createProduce } = useCreateProduceMutation();
  const { uploadProduceImage } = useUploadProduceImageMutation();

  const formMethods = useForm<AddProduceFormData>({
    resolver: zodResolver(addProduceSchema),
    defaultValues: createEmptyFormValues(),
  });

  const { reset, setValue, getValues } = formMethods;

  useEffect(() => {
    if (!farms.length) return;
    const current = getValues("farmId");
    if (current) return;
    setValue("farmId", farms[0].id);
  }, [farms, getValues, setValue]);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    txHash?: string | null;
    qrCode?: string | null;
    batchId: string;
  } | null>(null);

  const handleReset = useCallback(() => {
    reset(createEmptyFormValues());
  }, [reset]);

  const onSubmit = useCallback(
    async (values: AddProduceFormData) => {
      if (!values.farmId) {
        Alert.alert(
          "Farm required",
          "Select a farm before recording a produce batch."
        );
        return;
      }

      const selectedFarm = farms.find((farm) => farm.id === values.farmId);
      const payload: CreateProduceDto = {
        name: values.name.trim(),
        category: deriveCategory(selectedFarm, values.name),
        quantity: Number(values.quantity),
        unit: values.unit,
        batchId: generateBatchId(),
        harvestDate: values.harvestDate.trim(),
        isPublicQR: true,
      };

      if (values.certifications?.length) {
        const sanitizedDocuments = values.certifications.map(
          ({ file: _file, ...doc }) => doc
        );
        payload.certifications = {
          documents: sanitizedDocuments,
        };
      }

      try {
        const response = await createProduce(values.farmId, payload);
        const created = response?.data;
        if (!created) {
          throw new Error("No produce data returned from server.");
        }

        if (values.produceImage?.file) {
          try {
            await uploadProduceImage(created.id, {
              image: values.produceImage.file as Blob,
            });
          } catch (uploadError) {
            console.error("Failed to upload produce image", uploadError);
            const message =
              parseError(uploadError) ??
              "Produce saved, but the image upload failed.";
            Alert.alert("Image upload failed", message);
          }
        }

        await queryClient.invalidateQueries({
          queryKey: getFarmerControllerFindProducesQueryKey(),
        });

        setSuccessData({
          txHash: created.blockchainTx ?? null,
          qrCode: created.qrCode ?? null,
          batchId: created.batchId ?? payload.batchId,
        });
        setShowSuccessModal(true);
        handleReset();
      } catch (error) {
        console.error("Failed to record produce batch", error);
        const message =
          parseError(error) ?? "Failed to record produce. Please try again.";
        Alert.alert("Error", message);
      }
    },
    [createProduce, farms, handleReset, queryClient, uploadProduceImage]
  );

  const copyToClipboard = (text: string) => {
    if (Platform.OS === "web") {
      navigator.clipboard.writeText(text);
      Alert.alert("Copied", "Transaction hash copied to clipboard");
    }
  };

  const handleGoToDashboard = () => {
    setShowSuccessModal(false);
    setSuccessData(null);
    router.push("/dashboard/farmer");
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setSuccessData(null);
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
        farms={farmOptions}
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
        txHash={successData?.txHash ?? undefined}
        batchId={successData?.batchId}
        qrCode={successData?.qrCode ?? undefined}
        onCopyTxHash={copyToClipboard}
        onGoToDashboard={handleGoToDashboard}
        onClose={handleCloseModal}
      />
    </>
  );
}
