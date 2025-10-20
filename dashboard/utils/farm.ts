import {
  CERTIFICATION_TYPES,
  FARM_SIZE_UNITS,
  FarmUploadedDocument,
  RegisterFarmFormData,
} from "@/validation/farm";
import {
  CreateFarmDto,
  type FarmDetailResponseDto,
  type UpdateFarmDto,
} from "@/api";

type CertificationForm = RegisterFarmFormData["certifications"][number];

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

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const optionalString = (value: unknown) =>
  isNonEmptyString(value) ? value : undefined;

const optionalNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;

const ensureArray = <T>(value: unknown): T[] =>
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

const parseCertificationType = (value: unknown): CertificationForm["type"] => {
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

const splitProduceCategories = (value: string) =>
  value
    .split(",")
    .map((crop) => crop.trim())
    .filter(Boolean);

export const createInitialForm = (): RegisterFarmFormData => ({
  name: "",
  location: "",
  size: "",
  sizeUnit: FARM_SIZE_UNITS[0],
  primaryCrops: "",
  landDocuments: [],
  certifications: [],
});

export const toRegisterFarmFormData = (
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

      const normalizedDocs = ensureArray<RawDocument>(certification.documents)
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

export const buildSubmission = (values: RegisterFarmFormData) => {
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

export const extractFarmSummary = (
  farm: unknown,
  fallbackName: string,
  fallbackLocation: string
) => {
  const farmRecord = asRecord(farm);
  const name = optionalString(farmRecord?.["name"]) ?? fallbackName;
  const location = optionalString(farmRecord?.["location"]) ?? fallbackLocation;

  return { name, location };
};

export const formatFarmSize = (value: number | null) => {
  if (value === null || Number.isNaN(value)) return "--";
  return `${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};
