import { FieldErrors } from "react-hook-form";
import { z } from "zod";

export const FARM_SIZE_UNITS = ["HECTARE", "ACRE", "SQUARE_METER"] as const;

export const FARM_SIZE_UNIT_LABELS: Record<
  (typeof FARM_SIZE_UNITS)[number],
  string
> = {
  HECTARE: "Hectares",
  ACRE: "Acres",
  SQUARE_METER: "Square meters",
};

export const CERTIFICATION_TYPES = [
  "HALAL",
  "MYGAP",
  "ORGANIC",
  "OTHER",
] as const;

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const optionalDateString = z
  .string()
  .trim()
  .optional()
  .refine(
    (value) => !value || ISO_DATE_PATTERN.test(value),
    "Use YYYY-MM-DD format"
  );

const uploadedDocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  uri: z.string().optional(),
  mimeType: z.string().optional(),
  size: z.number().optional(),
  kind: z.enum(["image", "pdf", "other"]),
  file: z.any().optional(),
});

const certificationUploadSchema = z
  .object({
    type: z.enum(CERTIFICATION_TYPES, {
      required_error: "Select a certification type",
      invalid_type_error: "Select a certification type",
    }),
    otherType: z
      .string()
      .trim()
      .max(120, "Certification type is too long")
      .optional()
      .default(""),
    issueDate: optionalDateString,
    expiryDate: optionalDateString,
    documents: z
      .array(uploadedDocumentSchema)
      .min(1, "Upload at least one certification document"),
  })
  .superRefine((value, ctx) => {
    if (value.type === "OTHER" && !value.otherType?.length) {
      ctx.addIssue({
        path: ["otherType"],
        code: z.ZodIssueCode.custom,
        message: "Provide the certification name when selecting Other",
      });
    }

    if (value.issueDate && value.expiryDate) {
      const issue = new Date(value.issueDate).getTime();
      const expiry = new Date(value.expiryDate).getTime();
      if (!Number.isNaN(issue) && !Number.isNaN(expiry) && expiry < issue) {
        ctx.addIssue({
          path: ["expiryDate"],
          code: z.ZodIssueCode.custom,
          message: "Expiry date cannot be earlier than issue date",
        });
      }
    }
  });

export const registerFarmSchema = z.object({
  name: z
    .string({ required_error: "Farm name is required" })
    .trim()
    .min(1, "Farm name is required"),
  location: z
    .string({ required_error: "Location is required" })
    .trim()
    .min(1, "Location is required"),
  size: z
    .string({ required_error: "Farm size is required" })
    .trim()
    .min(1, "Farm size is required")
    .refine((value) => {
      const numericSize = Number(value);
      return !Number.isNaN(numericSize) && numericSize > 0;
    }, "Enter a valid numeric size"),
  sizeUnit: z.enum(FARM_SIZE_UNITS, {
    required_error: "Select a farm size unit",
    invalid_type_error: "Select a farm size unit",
  }),
  primaryCrops: z
    .string({ required_error: "List at least one primary crop" })
    .trim()
    .min(1, "List at least one primary crop"),
  landDocuments: z
    .array(uploadedDocumentSchema)
    .min(1, "Upload at least one land document"),
  certifications: z.array(certificationUploadSchema).default([]),
});

export type RegisterFarmSchema = typeof registerFarmSchema;

export type UploadedDocument = z.infer<typeof uploadedDocumentSchema>;

export type CertificationUpload = z.infer<typeof certificationUploadSchema>;

export type RegisterFarmFormData = z.infer<typeof registerFarmSchema>;

export type RegisterFarmFormField = keyof RegisterFarmFormData;

export type RegisterFarmFormErrors = FieldErrors<RegisterFarmFormData>;

export type FarmUploadedDocument = UploadedDocument;
export type FarmCertificationUpload = CertificationUpload;

export interface RegisterFarmSuccessData {
  name: string;
  location: string;
}
