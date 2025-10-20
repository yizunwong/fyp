import { useEffect, useRef, useState } from "react";
import { View, ScrollView, Platform, useWindowDimensions } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
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
import {
  CreateFarmDto,
  type FarmDetailResponseDto,
  useAuthControllerProfile,
} from "@/api";
import {
  useCreateFarmMutation,
  useFarmQuery,
  useUpdateFarmMutation,
} from "@/hooks/useFarm";
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

const inferDocumentKind = (
  mimeType?: string,
  name?: string
): FarmUploadedDocument["kind"] => {
  const normalizedMime = mimeType?.toLowerCase();
  if (normalizedMime?.includes("pdf")) {
    return "pdf";
  }
  if (normalizedMime?.startsWith("image/")) {
    return "image";
  }
  const normalizedName = name?.toLowerCase() ?? "";
  if (normalizedName.endsWith(".pdf")) {
    return "pdf";
  }
  if (
    [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".heic", ".heif"].some(
      (ext) => normalizedName.endsWith(ext)
    )
  ) {
    return "image";
  }
  return "other";
};

const normalizeFarmDocument = (
  doc: unknown,
  fallbackIdPrefix: string
): FarmUploadedDocument | null => {
  if (!doc || typeof doc !== "object") {
    return null;
  }

  const record = doc as Record<string, unknown>;
  const name =
    typeof record.name === "string" && record.name.length
      ? record.name
      : "Document";
  const mimeType =
    typeof record.mimeType === "string" && record.mimeType.length
      ? record.mimeType
      : undefined;
  const uri =
    typeof record.uri === "string" && record.uri.length
      ? record.uri
      : typeof record.url === "string" && record.url.length
      ? record.url
      : undefined;
  const size =
    typeof record.size === "number" && Number.isFinite(record.size)
      ? record.size
      : undefined;
  const providedKind = record.kind;
  const kind =
    providedKind === "image" || providedKind === "pdf" || providedKind === "other"
      ? providedKind
      : inferDocumentKind(mimeType, typeof record.name === "string" ? record.name : undefined);
  const id =
    (typeof record.id === "string" && record.id.length
      ? record.id
      : typeof record.key === "string" && record.key.length
      ? record.key
      : undefined) ?? `${fallbackIdPrefix}-${name}-${size ?? "unknown"}`;

  return {
    id,
    name,
    uri,
    mimeType,
    size,
    kind,
  };
};

const toRegisterFarmFormData = (
  farm: FarmDetailResponseDto
): RegisterFarmFormData => {
  const documents = (farm.documents ?? {}) as Record<string, unknown>;
  const landDocumentsSource = Array.isArray(documents.landDocuments)
    ? documents.landDocuments
    : [];
  const certificationsSource = Array.isArray(documents.certifications)
    ? documents.certifications
    : [];

  const landDocuments = landDocumentsSource
    .map((doc, index) => normalizeFarmDocument(doc, `land-${index}`))
    .filter((doc): doc is FarmUploadedDocument => doc !== null);

  const certifications = certificationsSource
    .map((cert, certIndex) => {
      if (!cert || typeof cert !== "object") {
        return null;
      }
      const certRecord = cert as Record<string, unknown>;
      const documentsSource = Array.isArray(certRecord.documents)
        ? certRecord.documents
        : [];
      const normalizedDocs = documentsSource
        .map((doc, docIndex) =>
          normalizeFarmDocument(doc, `cert-${certIndex}-${docIndex}`)
        )
        .filter((doc): doc is FarmUploadedDocument => doc !== null);

      const type =
        typeof certRecord.type === "string" && certRecord.type.length
          ? (certRecord.type as RegisterFarmFormData["certifications"][number]["type"])
          : "OTHER";

      return {
        type,
        otherType:
          typeof certRecord.otherType === "string" ? certRecord.otherType : "",
        issueDate:
          typeof certRecord.issueDate === "string"
            ? certRecord.issueDate
            : undefined,
        expiryDate:
          typeof certRecord.expiryDate === "string"
            ? certRecord.expiryDate
            : undefined,
        documents: normalizedDocs,
      };
    })
    .filter(
      (cert): cert is RegisterFarmFormData["certifications"][number] =>
        cert !== null
    );

  return {
    name: farm.name ?? "",
    location: farm.location ?? "",
    size: farm.size ? String(farm.size) : "",
    sizeUnit:
      (farm.sizeUnit as RegisterFarmFormData["sizeUnit"]) ?? FARM_SIZE_UNITS[0],
    primaryCrops: Array.isArray(farm.produceCategories)
      ? farm.produceCategories.join(", ")
      : "",
    landDocuments,
    certifications,
  };
};

export default function RegisterFarmPage() {
  const router = useRouter();
  const { farmId: farmIdParam } = useLocalSearchParams<{ farmId?: string }>();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && (width === 0 ? true : width >= 1024);
  const farmId =
    typeof farmIdParam === "string"
      ? farmIdParam
      : Array.isArray(farmIdParam)
      ? farmIdParam[0]
      : undefined;
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
  const hydratedSnapshotRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isEditMode) {
      farmInitialDataRef.current = null;
      hydratedSnapshotRef.current = null;
      return;
    }

    const farm = farmQuery.data?.data;
    if (!farm) {
      return;
    }

    const normalized = toRegisterFarmFormData(farm);
    const snapshot = JSON.stringify(normalized);
    if (hydratedSnapshotRef.current === snapshot) {
      return;
    }

    farmInitialDataRef.current = normalized;
    hydratedSnapshotRef.current = snapshot;
    reset(normalized);
    clearErrors();
  }, [isEditMode, farmId, farmQuery.data?.data, reset, clearErrors]);

  useEffect(() => {
    if (!farmQuery.error) return;
    Toast.show({
      type: "error",
      text1: "Unable to load farm",
      text2:
        typeof farmQuery.error === "string"
          ? farmQuery.error
          : "Failed to fetch farm details.",
    });
  }, [farmQuery.error]);

  const handleReset = () => {
    if (isEditMode && farmInitialDataRef.current) {
      reset(farmInitialDataRef.current);
    } else {
      reset(createInitialForm());
    }
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
      const createdFarm = (await createFarm(farmerId, payload)) as Partial<{
        id: string;
        name?: string;
        location?: string;
      }> | void;

      const normalizedPrimaryCrops = produceCategories.join(", ");
      const nextValues: RegisterFarmFormData = {
        ...values,
        name: trimmedName,
        location: trimmedLocation,
        size: String(payload.size),
        sizeUnit: payload.sizeUnit,
        primaryCrops: normalizedPrimaryCrops,
      };

      reset(nextValues);
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

  const handleValidUpdate = async (values: RegisterFarmFormData) => {
    if (!farmerId || !farmId) {
      Toast.show({
        type: "error",
        text1: "Update unavailable",
        text2: "Missing required identifiers for this farm.",
      });
      return;
    }

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
      await updateFarm(farmerId, farmId, payload);
      Toast.show({
        type: "success",
        text1: "Farm updated",
        text2: `${trimmedName || "Farm"} details saved successfully.`,
      });

      const normalizedPrimaryCrops = produceCategories.join(", ");
      const refreshedValues: RegisterFarmFormData = {
        ...values,
        name: trimmedName,
        location: trimmedLocation,
        size: String(payload.size),
        sizeUnit: payload.sizeUnit,
        primaryCrops: normalizedPrimaryCrops,
      };

      farmInitialDataRef.current = refreshedValues;
      reset(refreshedValues);
      hydratedSnapshotRef.current = null;
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
    reset(createInitialForm());
    clearErrors();
    farmInitialDataRef.current = null;
    hydratedSnapshotRef.current = null;
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
        <FarmerLayout
          headerTitle={headerTitle}
          headerSubtitle={headerSubtitle}
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
