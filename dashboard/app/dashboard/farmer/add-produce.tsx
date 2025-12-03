import { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { Alert, Platform, View } from "react-native";
import Toast from "react-native-toast-message";
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
  UploadProduceCertificatesDtoTypesItem,
  getFarmerControllerFindProducesQueryKey,
} from "@/api";
import { useFarmsQuery } from "@/hooks/useFarm";
import {
  useCreateProduceMutation,
  useUploadProduceImageMutation,
  useUploadProduceCertificatesMutation,
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
  const verifiedFarms = useMemo(
    () => farms.filter((farm) => farm.verificationStatus === "VERIFIED"),
    [farms]
  );
  const farmOptions = useMemo<AddProduceFarmOption[]>(
    () =>
      verifiedFarms.map((farm) => ({
        id: farm.id,
        name: farm.name,
        location: farm.location,
      })),
    [verifiedFarms]
  );

  const { createProduce } = useCreateProduceMutation();
  const { uploadProduceImage } = useUploadProduceImageMutation();
  const { uploadProduceCertificates } = useUploadProduceCertificatesMutation();

  const formMethods = useForm<AddProduceFormData>({
    resolver: zodResolver(addProduceSchema),
    defaultValues: createEmptyFormValues(),
  });

  const { reset, setValue, getValues } = formMethods;

  useEffect(() => {
    if (!verifiedFarms.length) return;
    const current = getValues("farmId");
    if (current) return;
    setValue("farmId", verifiedFarms[0].id);
  }, [verifiedFarms, getValues, setValue]);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    txHash?: string | null;
    qrCode?: string | null;
    batchId: string;
  } | null>(null);
  const [autoCloseSeconds, setAutoCloseSeconds] = useState<number | null>(null);

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

        const certificatePayloads = (values.certifications ?? [])
          .map((doc) => {
            const file = doc.file;
            if (typeof Blob === "undefined" || !(file instanceof Blob)) {
              return null;
            }
            return {
              file,
              type:
                doc.certificateType ??
                UploadProduceCertificatesDtoTypesItem.ORGANIC,
            };
          })
          .filter(
            (item): item is { file: Blob; type: UploadProduceCertificatesDtoTypesItem } =>
              item !== null
          );

        const certificateFiles = certificatePayloads.map((item) => item.file);
        const certificateTypes = certificatePayloads.map((item) => item.type);

        if (certificateFiles.length) {
          try {
            await uploadProduceCertificates(created.id, {
              certificates: certificateFiles,
              types: certificateTypes,
            });
          } catch (uploadError) {
            console.error("Failed to upload certificates", uploadError);
            const message =
              parseError(uploadError) ??
              "Produce saved, but certificate upload failed.";
            Alert.alert("Certificate upload failed", message);
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
        Toast.show({
          type: "error",
          text1: "Submission failed",
          text2: message,
        });
      }
    },
    [
      createProduce,
      farms,
      handleReset,
      queryClient,
      uploadProduceImage,
      uploadProduceCertificates,
    ]
  );

  const copyToClipboard = (text: string) => {
    if (Platform.OS === "web") {
      navigator.clipboard.writeText(text);
      Alert.alert("Copied", "Transaction hash copied to clipboard");
    }
  };

  const handleCloseModal = useCallback(() => {
    setShowSuccessModal(false);
    setSuccessData(null);
    setAutoCloseSeconds(null);
  }, []);

  const handleGoToDashboard = useCallback(() => {
    handleCloseModal();
    router.push("/dashboard/farmer");
  }, [handleCloseModal, router]);

  useEffect(() => {
    if (!showSuccessModal) return;
    setAutoCloseSeconds(10);

    const timer = setInterval(() => {
      setAutoCloseSeconds((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) {
          clearInterval(timer);
          handleCloseModal();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showSuccessModal, handleCloseModal]);

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
        autoCloseSeconds={autoCloseSeconds ?? undefined}
        onCopyTxHash={copyToClipboard}
        onGoToDashboard={handleGoToDashboard}
        onClose={handleCloseModal}
      />
    </>
  );
}
