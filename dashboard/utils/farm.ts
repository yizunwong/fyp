import { FARM_SIZE_UNITS, FarmUploadedDocument, RegisterFarmFormData } from "@/validation/farm";
import {
  CreateFarmDto,
  FarmListRespondDto,
  ProduceListResponseDto,
  UploadFarmDocumentsDtoTypesItem,
  type FarmDetailResponseDto,
  type UpdateFarmDto,
} from "@/api";

type RawDocument = Partial<{
  id: string;
  key: string;
  name: string;
  fileName: string;
  uri: string;
  url: string;
  ipfsUrl: string;
  mimeType: string;
  size: number | string;
  fileSize: number | string;
  kind: FarmUploadedDocument["kind"];
  landDocumentType: string;
  type: string;
  metadata: Record<string, unknown> | null;
}>;

type RawDocuments = Partial<{
  landDocuments: RawDocument[];
}>;

type FarmDetailWithDocuments = FarmDetailResponseDto & {
  farmDocuments?: unknown;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const optionalString = (value: unknown) =>
  isNonEmptyString(value) ? value : undefined;

const optionalNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;
const optionalNumberLike = (value: unknown): number | undefined => {
  if (typeof value === "number") return optionalNumber(value);
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;

const ensureArray = <T>(value: unknown): T[] =>
  Array.isArray(value) ? (value as T[]) : [];

const LAND_DOCUMENT_TYPE_VALUES = new Set(
  Object.values(UploadFarmDocumentsDtoTypesItem)
);

const normalizeLandDocumentType = (
  value: unknown
): UploadFarmDocumentsDtoTypesItem | undefined => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toUpperCase();
  return LAND_DOCUMENT_TYPE_VALUES.has(
    normalized as UploadFarmDocumentsDtoTypesItem
  )
    ? (normalized as UploadFarmDocumentsDtoTypesItem)
    : undefined;
};

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

const normalizeFarmDocument = (
  doc: unknown,
  fallbackIdPrefix: string
): FarmUploadedDocument | null => {
  const record = asRecord(doc);
  if (!record) return null;

  const typedRecord = record as RawDocument;
  const name =
    optionalString(typedRecord.name) ??
    optionalString(typedRecord.fileName) ??
    "Document";
  const mimeType = optionalString(typedRecord.mimeType);
  const ipfsUrl =
    optionalString(typedRecord.ipfsUrl) ??
    optionalString((typedRecord as { ipfsUrl?: unknown }).ipfsUrl);
  const uri =
    optionalString(typedRecord.uri) ??
    optionalString(typedRecord.url) ??
    ipfsUrl;
  const size =
    optionalNumberLike(typedRecord.size) ??
    optionalNumberLike((typedRecord as { fileSize?: unknown }).fileSize);
  const explicitKind = typedRecord.kind;
  const landDocumentType = normalizeLandDocumentType(
    (typedRecord as { landDocumentType?: unknown }).landDocumentType ??
      (typedRecord as { type?: unknown }).type
  );
  const metadata = asRecord(typedRecord.metadata);
  const ipfsHash = optionalString(metadata?.ipfsHash);
  const kind =
    explicitKind && ["image", "pdf", "other"].includes(explicitKind)
      ? explicitKind
      : deriveDocumentKind(mimeType, name);

  const id =
    optionalString(typedRecord.id) ??
    optionalString(typedRecord.key) ??
    ipfsHash ??
    `${fallbackIdPrefix}-${name}-${size ?? "unknown"}`;

  return {
    id,
    name,
    uri,
    mimeType,
    size,
    kind,
    landDocumentType,
  };
};

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
});

const splitProduceCategories = (value: string) =>
  value
    .split(",")
  .map((crop) => crop.trim())
  .filter(Boolean);

export const formatFarmLocation = (farm: {
  address?: string;
  district?: string;
  state?: string;
  location?: string;
}) => {
  const address = farm.address
  const district = farm.district
  const state = farm.state
  const parts = [address, district, state].filter(Boolean) as string[];
  if (parts.length) {
    return parts.join(", ");
  }

  return farm.location ?? "";
};

export const createInitialForm = (): RegisterFarmFormData => ({
  name: "",
  address: "",
  district: "",
  state: "",
  size: "",
  sizeUnit: FARM_SIZE_UNITS[0],
  primaryCrops: "",
  landDocuments: [],
});

const extractLandDocuments = (
  farm: FarmDetailWithDocuments
): FarmUploadedDocument[] => {
  const farmRecord = asRecord(farm);

  const farmDocuments = ensureArray<RawDocument>(
    farmRecord?.["farmDocuments"]
  )
    .map((doc, index) => normalizeFarmDocument(doc, `farm-${index}`))
    .filter((doc): doc is FarmUploadedDocument => doc !== null);

  const documentRecord = (asRecord(farm.documents) ?? {}) as RawDocuments;
  const legacyDocuments = ensureArray<RawDocument>(
    documentRecord.landDocuments
  )
    .map((doc, index) => normalizeFarmDocument(doc, `land-${index}`))
    .filter((doc): doc is FarmUploadedDocument => doc !== null);

  if (farmDocuments.length) {
    const seen = new Set(farmDocuments.map((doc) => doc.id));
    legacyDocuments.forEach((doc) => {
      if (!seen.has(doc.id)) {
        farmDocuments.push(doc);
      }
    });
    return farmDocuments;
  }

  return legacyDocuments;
};

export const toRegisterFarmFormData = (
  farm: FarmDetailWithDocuments
): RegisterFarmFormData => {
  const numericSize = optionalNumberLike(farm.size);

  const landDocuments = extractLandDocuments(farm);

  return {
    name: farm.name ?? "",
    address: farm.address ?? "",
    district: farm.district ?? "",
    state: farm.state ?? "",
    size: numericSize !== undefined ? String(numericSize) : "",
    sizeUnit:
      (farm.sizeUnit as RegisterFarmFormData["sizeUnit"]) ?? FARM_SIZE_UNITS[0],
    primaryCrops: Array.isArray(farm.produceCategories)
      ? farm.produceCategories.join(", ")
      : "",
    landDocuments,
  };
};

export const buildSubmission = (values: RegisterFarmFormData) => {
  const trimmedName = values.name.trim();
  const trimmedAddress = values.address.trim();
  const trimmedDistrict = values.district.trim();
  const trimmedState = values.state.trim();
  const produceCategories = splitProduceCategories(values.primaryCrops);
  const documents = buildDocumentsPayload(values);

  const createPayload: CreateFarmDto = {
    name: trimmedName,
    address: trimmedAddress,
    district: trimmedDistrict,
    state: trimmedState,
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
    address: trimmedAddress,
    district: trimmedDistrict,
    state: trimmedState,
    size: String(createPayload.size),
    sizeUnit: createPayload.sizeUnit,
    primaryCrops: produceCategories.join(", "),
    landDocuments: values.landDocuments ?? [],
  };

  return {
    createPayload,
    updatePayload,
    normalizedValues,
    trimmedName,
    trimmedAddress,
    trimmedDistrict,
    trimmedState,
    locationLabel: formatFarmLocation({
      address: trimmedAddress,
      district: trimmedDistrict,
      state: trimmedState,
      location: values.address,
    }),
  };
};

export const extractFarmSummary = (
  farm: unknown,
  fallbackName: string,
  fallbackAddress: string,
  fallbackDistrict: string,
  fallbackState: string
) => {
  const farmRecord = asRecord(farm);
  const name = optionalString(farmRecord?.["name"]) ?? fallbackName;
  const address = optionalString(farmRecord?.["address"]) ?? fallbackAddress;
  const district = optionalString(farmRecord?.["district"]) ?? fallbackDistrict;
  const state = optionalString(farmRecord?.["state"]) ?? fallbackState;
  const locationLabel = formatFarmLocation({ address, district, state });

  return { name, address, district, state, locationLabel };
};

export const formatFarmSize = (value: number | null) => {
  if (value === null || Number.isNaN(value)) return "--";
  return `${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

export const normalizeCertificationLabel = (label: string) =>
  label
    .split(/[_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

export const extractCertifications = (
  documents: FarmListRespondDto["documents"]
): string[] => {
  if (!documents || typeof documents !== "object") return [];

  const certificationPayload = (
    documents as {
      certifications?: unknown;
    }
  ).certifications;

  const certifications = Array.isArray(certificationPayload)
    ? certificationPayload
    : [];

  const labels = certifications
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as { type?: unknown; otherType?: unknown };
      const type =
        typeof record.type === "string" ? record.type.trim() : undefined;
      const otherType =
        typeof record.otherType === "string"
          ? record.otherType.trim()
          : undefined;

      if (type && type !== "OTHER") {
        return normalizeCertificationLabel(type);
      }

      if (otherType) {
        return normalizeCertificationLabel(otherType);
      }

      return type ? normalizeCertificationLabel(type) : null;
    })
    .filter(
      (value): value is string => typeof value === "string" && value.length > 0
    );

  return Array.from(new Set(labels));
};

export const isBatchVerified = (batch: ProduceListResponseDto) => {
  const status = typeof batch.name === "string" ? batch.name.toLowerCase() : "";
  return status === "verified";
};
