import { z } from "zod";
import {
  UploadProduceCertificatesDtoTypesItem,
  UploadFarmDocumentsDtoTypesItem,
} from "@/api";

const CERTIFICATION_TYPES = Object.values(
  UploadProduceCertificatesDtoTypesItem
) as [UploadProduceCertificatesDtoTypesItem, ...UploadProduceCertificatesDtoTypesItem[]];

const LAND_DOCUMENT_TYPES = Object.values(
  UploadFarmDocumentsDtoTypesItem
) as [UploadFarmDocumentsDtoTypesItem, ...UploadFarmDocumentsDtoTypesItem[]];

export const uploadedDocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  uri: z.string().optional(),
  mimeType: z.string().optional(),
  size: z.number().optional(),
  kind: z.enum(["image", "pdf", "other"]),
  file: z.any().optional(),
  certificateType: z.enum(CERTIFICATION_TYPES).optional(),
  landDocumentType: z.enum(LAND_DOCUMENT_TYPES).optional(),
});

export type UploadedDocument = z.infer<typeof uploadedDocumentSchema>;
