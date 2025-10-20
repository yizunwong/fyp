import type { FieldErrors } from "react-hook-form";
import { z } from "zod";
import {
  registerFarmSchema,
  type CertificationUpload,
  type UploadedDocument,
} from "@/validation/farm";

export type RegisterFarmFormData = z.infer<typeof registerFarmSchema>;

export type RegisterFarmFormField = keyof RegisterFarmFormData;

export type RegisterFarmFormErrors = FieldErrors<RegisterFarmFormData>;

export type FarmUploadedDocument = UploadedDocument;
export type FarmCertificationUpload = CertificationUpload;

export interface RegisterFarmSuccessData {
  name: string;
  location: string;
}
