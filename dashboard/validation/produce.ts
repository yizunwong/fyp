import { z } from "zod";
import {
  uploadedDocumentSchema,
  type UploadedDocument,
} from "./upload";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const PRODUCE_UNITS = [
  "KG",
  "G",
  "TONNE",
  "PCS",
  "BUNCH",
  "TRAY",
  "L",
  "ML",
] as const;

export const PRODUCE_UNIT_LABELS: Record<
  (typeof PRODUCE_UNITS)[number],
  string
> = {
  KG: "Kilogram (kg)",
  G: "Gram (g)",
  TONNE: "Tonne (t)",
  PCS: "Pieces (pcs)",
  BUNCH: "Bunch",
  TRAY: "Tray",
  L: "Litre (L)",
  ML: "Millilitre (mL)",
};

export const addProduceSchema = z.object({
  name: z
    .string({ required_error: "Produce name is required" })
    .trim()
    .min(1, "Produce name is required"),
  harvestDate: z
    .string({ required_error: "Harvest date is required" })
    .trim()
    .regex(ISO_DATE_PATTERN, "Use YYYY-MM-DD format"),
  farmId: z
    .string({ required_error: "Select a farm" })
    .trim()
    .min(1, "Select a farm"),
  quantity: z
    .string({ required_error: "Quantity is required" })
    .trim()
    .refine((value) => {
      const numericQuantity = Number(value);
      return !Number.isNaN(numericQuantity) && numericQuantity > 0;
    }, "Enter a valid quantity"),
  unit: z.enum(PRODUCE_UNITS, {
    required_error: "Select a unit",
    invalid_type_error: "Select a unit",
  }),
  certifications: z.array(uploadedDocumentSchema).default([]),
});

export type AddProduceFormData = z.infer<typeof addProduceSchema>;
export type ProduceUnit = (typeof PRODUCE_UNITS)[number];
export type ProduceUploadedDocument = UploadedDocument;
