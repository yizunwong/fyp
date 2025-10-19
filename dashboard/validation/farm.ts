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
  farmingPractice: z
    .string({ required_error: "Specify the farming practice" })
    .trim()
    .min(1, "Specify the farming practice"),
  registrationNumber: z
    .string()
    .trim()
    .max(100, "Registration number is too long")
    .optional()
    .default(""),
  description: z
    .string()
    .trim()
    .max(500, "Description is too long")
    .optional()
    .default(""),
});

export type RegisterFarmSchema = typeof registerFarmSchema;
