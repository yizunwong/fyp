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
import {
  CERTIFICATION_TYPES,
  FARM_SIZE_UNITS,
  registerFarmSchema,
} from "@/validation/farm";
import {
  CreateFarmDto,
  type FarmDetailResponseDto,
  UpdateFarmDto,
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

type CertificationForm = RegisterFarmFormData["certifications"][number];

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const optionalString = (value: unknown) =>
  isNonEmptyString(value) ? value : undefined;

const optionalNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : null;

const ensureArray = <T,>(value: unknown): T[] =>
  Array.isArray(value) ? (value as T[]) : [];

const IMAGE_FILE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".bmp",
  ".webp",
  ".heic",
  ".heif",
]);

const deriveDocumentKind = (
  mimeType?: string,
  name?: string
): FarmUploadedDocument["kind"] => {
  const normalizedMime = mimeType?.toLowerCase();
  if (normalizedMime?.includes("pdf")) return "pdf";
  if (normalizedMime?.startsWith("image/")) return "image";

  const normalizedName = name?.toLowerCase() ?? "";
  if (normalizedName.endsWith(".pdf")) return "pdf";
  if ([...IMAGE_FILE_EXTENSIONS].some((ext) => normalizedName.endsWith(ext))) {
    return "image";
  }
  return "other";
};

type RawDocument = Partial<{
  id: string;
  key: string;
  name: string;
  uri: string;
  url: string;
  mimeType: string;
  size: number;
  kind: FarmUploadedDocument["kind"];
}>;

type RawCertification = Partial<{
  type: CertificationForm["type"];
  otherType?: string;
  issueDate?: string;
  expiryDate?: string;
  documents?: RawDocument[];
}>;

type RawDocuments = Partial<{
  landDocuments: RawDocument[];
  certifications: RawCertification[];
}>;

const parseCertificationType = (
  value: unknown
): CertificationForm["type"] => {
  if (!isNonEmptyString(value)) return "OTHER";
  const match = CERTIFICATION_TYPES.find((option) => option === value);
  return (match ?? "OTHER") as CertificationForm["type"];
};

const normalizeFarmDocument = (
  doc: unknown,
  fallbackIdPrefix: string
): FarmUploadedDocument | null => {
  const record = asRecord(doc);
  if (!record) return null;

  const typedRecord = record as RawDocument;
  const name = optionalString(typedRecord.name) ?? "Document";
  const mimeType = optionalString(typedRecord.mimeType);
  const uri =
    optionalString(typedRecord.uri) ?? optionalString(typedRecord.url);
  const size = optionalNumber(typedRecord.size);
  const explicitKind = typedRecord.kind;
  const kind =
    explicitKind && ["image", "pdf", "other"].includes(explicitKind)
      ? explicitKind
      : deriveDocumentKind(mimeType, optionalString(typedRecord.name));

  const id =
    optionalString(typedRecord.id) ??
    optionalString(typedRecord.key) ??
    `${fallbackIdPrefix}-${name}-${size ?? "unknown"}`;

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
  const documentRecord = (asRecord(farm.documents) ?? {}) as RawDocuments;

  const landDocuments = ensureArray<RawDocument>(documentRecord.landDocuments)
    .map((doc, index) => normalizeFarmDocument(doc, `land-${index}`))
    .filter((doc): doc is FarmUploadedDocument => doc !== null);

  const certifications = ensureArray<RawCertification>(
    documentRecord.certifications
  ).reduce<RegisterFarmFormData["certifications"]>(
    (acc, certification, certIndex) => {
      if (!certification) return acc;

      const normalizedDocs = ensureArray<RawDocument>(
        certification.documents
      )
        .map((doc, docIndex) =>
          normalizeFarmDocument(doc, `cert-${certIndex}-${docIndex}`)
        )
        .filter((doc): doc is FarmUploadedDocument => doc !== null);

      acc.push({
        type: parseCertificationType(certification.type),
        otherType: optionalString(certification.otherType) ?? "",
        issueDate: optionalString(certification.issueDate),
        expiryDate: optionalString(certification.expiryDate),
        documents: normalizedDocs,
      });

      return acc;
    },
    []
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

const createInitialForm = (): RegisterFarmFormData => ({
  name: "",
  location: "",
  size: "",
  sizeUnit: FARM_SIZE_UNITS[0],
  primaryCrops: "",
  landDocuments: [],
  certifications: [],
});

const splitProduceCategories = (value: string) =>
  value
    .split(",")
    .map((crop) => crop.trim())
    .filter(Boolean);

const mapUploadedDocuments = (uploads?: FarmUploadedDocument[]) =>
  (uploads ?? []).map((doc) => ({
    id: doc.id,
    name: doc.name,
    uri: doc.uri,
    mimeType: doc.mimeType,
    size: doc.size,
  }));

const buildDocumentsPayload = (
  values: RegisterFarmFormData
): CreateFarmDto["documents"] => ({
  landDocuments: mapUploadedDocuments(values.landDocuments),
  certifications: (values.certifications ?? []).map((cert) => ({
    type: cert.type,
    otherType: cert.otherType?.trim() || undefined,
    issueDate: cert.issueDate?.trim() || undefined,
    expiryDate: cert.expiryDate?.trim() || undefined,
    documents: mapUploadedDocuments(cert.documents),
  })),
});

const buildSubmission = (values: RegisterFarmFormData) => {
  const trimmedName = values.name.trim();
  const trimmedLocation = values.location.trim();
  const produceCategories = splitProduceCategories(values.primaryCrops);
  const documents = buildDocumentsPayload(values);

  const createPayload: CreateFarmDto = {
    name: trimmedName,
    location: trimmedLocation,
    size: Number(values.size),
    sizeUnit: values.sizeUnit,
    produceCategories: produceCategories.length
      ? produceCategories
      : [values.primaryCrops.trim()],
    documents,
  };

  const updatePayload: UpdateFarmDto = {
    ...createPayload,
  };

  const normalizedValues: RegisterFarmFormData = {
    ...values,
    name: trimmedName,
    location: trimmedLocation,
    size: String(createPayload.size),
    sizeUnit: createPayload.sizeUnit,
    primaryCrops: produceCategories.join(", "),
    landDocuments: values.landDocuments ?? [],
    certifications: values.certifications ?? [],
  };

  return {
    createPayload,
    updatePayload,
    normalizedValues,
    trimmedName,
    trimmedLocation,
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

    const {
      createPayload,
      normalizedValues,
      trimmedName,
      trimmedLocation,
    } =
      buildSubmission(values);

    try {
      const createdFarm = (await createFarm(
        farmerId,
        createPayload
      )) as Partial<{
        id: string;
        name?: string;
        location?: string;
      }> | void;

      const createdFarmRecord = asRecord(createdFarm);
      const createdName = optionalString(createdFarmRecord?.["name"]);
      const createdLocation = optionalString(
        createdFarmRecord?.["location"]
      );

      reset(normalizedValues);
      setSuccessData({
        name: createdName ?? trimmedName,
        location: createdLocation ?? trimmedLocation,
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

    const {
      updatePayload,
      normalizedValues,
      trimmedName,
      trimmedLocation,
    } =
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
      setSuccessData({
        name: trimmedName,
        location: trimmedLocation,
      });
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
