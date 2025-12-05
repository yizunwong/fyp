import { FieldErrors } from "react-hook-form";
import { z } from "zod";
import { uploadedDocumentSchema, type UploadedDocument } from "./upload";

export const FARM_SIZE_UNITS = ["HECTARE", "ACRE", "SQUARE_METER"] as const;

export const FARM_SIZE_UNIT_LABELS: Record<
  (typeof FARM_SIZE_UNITS)[number],
  string
> = {
  HECTARE: "Hectares",
  ACRE: "Acres",
  SQUARE_METER: "Square meters",
};

export const registerFarmSchema = z.object({
  name: z
    .string({ required_error: "Farm name is required" })
    .trim()
    .min(1, "Farm name is required"),
  address: z
    .string({ required_error: "Address is required" })
    .trim()
    .min(1, "Address is required"),
  district: z
    .string({ required_error: "District is required" })
    .trim()
    .min(1, "District is required"),
  state: z
    .string({ required_error: "State is required" })
    .trim()
    .min(1, "State is required"),
  size: z
    .coerce.number({
      required_error: "Farm size is required",
      invalid_type_error: "Enter a valid farm size",
    })
    .gt(0, "Farm size is required"),
  sizeUnit: z.enum(FARM_SIZE_UNITS, {
    required_error: "Select a farm size unit",
    invalid_type_error: "Select a farm size unit",
  }),
  produceCategories: z
    .array(
      z
        .string({ required_error: "List at least one primary crop" })
        .trim()
        .min(1, "List at least one primary crop")
    )
    .min(1, "List at least one primary crop"),
  farmDocuments: z
    .array(uploadedDocumentSchema)
    .min(1, "Upload at least one land document"),
});

export type RegisterFarmSchema = typeof registerFarmSchema;

export type RegisterFarmFormData = z.infer<typeof registerFarmSchema> & {};

export type RegisterFarmFormField = keyof RegisterFarmFormData;

export type RegisterFarmFormErrors = FieldErrors<RegisterFarmFormData>;

export type FarmUploadedDocument = UploadedDocument;

export interface RegisterFarmSuccessData {
  name: string;
  address: string;
  district: string;
  state: string;
  locationLabel: string;
}
