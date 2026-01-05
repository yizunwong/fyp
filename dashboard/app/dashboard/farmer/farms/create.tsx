import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FARM_SIZE_UNITS,
  RegisterFarmFormData,
  registerFarmSchema,
  RegisterFarmSuccessData,
} from "@/validation/farm";
import { UploadFarmDocumentsDtoTypesItem } from "@/api";
import {
  useCreateFarmMutation,
  useFarmQuery,
  useUpdateFarmMutation,
  useUploadFarmDocumentsMutation,
} from "@/hooks/useFarm";
import { parseError } from "@/utils/format-error";
import {
  buildSubmission,
  createInitialForm,
  extractFarmSummary,
} from "@/utils/farm";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { FarmRegistrationContent } from '@/components/farmer/register-farm/RegisterFarmContent';
import { useAppLayout } from '@/components/layout';

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
const sizeUnits = [...FARM_SIZE_UNITS] as RegisterFarmFormData["sizeUnit"][];

export default function RegisterFarmPage() {
  const router = useRouter();
  const { farmId: farmIdParam } = useLocalSearchParams<{ farmId?: string }>();
  const { isDesktop } = useResponsiveLayout();

  const farmId = farmIdParam;
  const isEditMode = Boolean(farmId);

  const { createFarm } = useCreateFarmMutation();
  const { updateFarm } = useUpdateFarmMutation();
  const { uploadFarmDocuments } = useUploadFarmDocumentsMutation();
  const farmQuery = useFarmQuery(farmId ?? "");

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

  // ✅ Load existing farm if in edit mode
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
    const mappedFarm: RegisterFarmFormData = {
      name: farm.name ?? "",
      address: farm.address ?? "",
      district: farm.district ?? "",
      state: farm.state ?? "",
      size: farm.size ?? 0,
      sizeUnit: farm.sizeUnit ?? sizeUnits[0],
      produceCategories: farm.produceCategories ?? [],
      farmDocuments:
        farm.farmDocuments?.map((doc) => ({
          id: doc.id,
          name:
            typeof doc.fileName === "string"
              ? doc.fileName
              : typeof doc.ipfsUrl === "string"
                ? doc.ipfsUrl.split("/").pop() ?? "Document"
                : "Document",
          uri: typeof doc.ipfsUrl === "string" ? doc.ipfsUrl : undefined,
          mimeType: typeof doc.mimeType === "string" ? doc.mimeType : undefined,
          size: typeof doc.fileSize === "number" ? doc.fileSize : undefined,
          kind: "other",
          landDocumentType:
            (doc.type as UploadFarmDocumentsDtoTypesItem) ??
            UploadFarmDocumentsDtoTypesItem.OTHERS,
        })) ?? [],
    };

    farmInitialDataRef.current = mappedFarm;
    reset(mappedFarm);
    clearErrors();
  }, [isEditMode, farmQuery.data?.data, reset, clearErrors]);

  // ✅ Toast error if fetching fails
  useEffect(() => {
    if (!farmQuery.error) return;
    Toast.show({
      type: "error",
      text1: "Unable to load farm",
      text2: parseError(farmQuery.error) ?? "Failed to fetch farm details.",
    });
  }, [farmQuery.error]);

  const handleReset = useCallback(() => {
    const baseline = farmInitialDataRef.current ?? createInitialForm();
    reset(baseline);
    clearErrors();
  }, [reset, clearErrors]);

  const handleInvalidSubmit = useCallback(() => {
    Toast.show({
      type: "error",
      text1: "Missing information",
      text2: "Please complete the highlighted fields to continue.",
    });
  }, []);

  const handleValidSubmit = useCallback(
    async (values: RegisterFarmFormData) => {
      const {
        createPayload,
        normalizedValues,
        trimmedName,
        trimmedAddress,
        trimmedDistrict,
        trimmedState,
      } =
        buildSubmission(values);

      try {
        const createdFarm = await createFarm(createPayload);
        const farmIdFromResponse = createdFarm?.data?.id;

        const summary = extractFarmSummary(
          createdFarm.data,
          trimmedName,
          trimmedAddress,
          trimmedDistrict,
          trimmedState
        );

        if (farmIdFromResponse) {
          try {
            const landDocs = values.farmDocuments  ?? [];
            const hasFiles =
              landDocs?.some(
                (doc) =>
                  typeof Blob !== "undefined" && doc.file instanceof Blob
              ) ?? false;

            if (hasFiles) {
              console.log("Uploading land documents...", landDocs?.length ?? 0);
              await uploadFarmDocuments(farmIdFromResponse, landDocs);
            }
          } catch (uploadError) {
            console.error("Land document upload failed:", uploadError);
            const msg =
              parseError(uploadError) ??
              "Farm saved, but land documents upload failed.";
            Toast.show({
              type: "error",
              text1: "Document upload failed",
              text2: msg,
            });
          }
        }

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
    },
    [createFarm, form, reset, uploadFarmDocuments]
  );

  const handleValidUpdate = useCallback(
    async (values: RegisterFarmFormData) => {
      const { updatePayload, normalizedValues, trimmedName } =
        buildSubmission(values);

      try {
        await updateFarm(farmId!, updatePayload);

        try {
          const landDocs = values.farmDocuments ?? [];
          const hasFiles =
            landDocs?.some(
              (doc) => typeof Blob !== "undefined" && doc.file instanceof Blob
            ) ?? false;

          if (hasFiles) {
            await uploadFarmDocuments(farmId!, landDocs);
          }
        } catch (uploadError) {
          console.error("Land document upload failed:", uploadError);
          const msg =
            parseError(uploadError) ??
            "Farm saved, but land documents upload failed.";
          Toast.show({
            type: "error",
            text1: "Document upload failed",
            text2: msg,
          });
        }

        Toast.show({
          type: "success",
          text1: "Farm updated",
          text2: `${trimmedName || "Farm"} details saved successfully.`,
        });

        farmInitialDataRef.current = normalizedValues;
        reset(normalizedValues);
        previousFarmSnapshotRef.current = null;
        if (farmQuery.refetch) await farmQuery.refetch();
      } catch (error) {
        const message = parseError(error) || "Failed to update farm.";
        form.setError("root", { message });
        Toast.show({
          type: "error",
          text1: "Update failed",
          text2: message,
        });
      }
    },
    [updateFarm, farmId, form, reset, farmQuery, uploadFarmDocuments]
  );

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

  const headerTitle = isEditMode ? "Edit Farm" : "Register New Farm";
  const headerSubtitle = isEditMode
    ? "Update farm details to keep your records current"
    : "Capture farm details to link future produce batches";
  const submitLabel = isEditMode ? "Save Changes" : "Register Farm";

  const layoutMeta = useMemo(
    () => ({
      title: headerTitle,
      subtitle: headerSubtitle,
    }),
    [headerTitle, headerSubtitle]
  );

  useAppLayout(layoutMeta);

  return (
    <>
      <FarmRegistrationContent
        isDesktop={isDesktop}
        form={form}
        formData={formData}
        sizeUnits={sizeUnits}
        cropSuggestions={cropSuggestions}
        submitLabel={submitLabel}
        showSuccessModal={showSuccessModal}
        successData={successData}
        onSubmit={submitForm}
        onReset={handleReset}
        onBackToDashboard={handleBackToDashboard}
        onRegisterAnother={handleRegisterAnother}
        onCloseSuccess={closeSuccessModal}
      />
    </>
  );
}
