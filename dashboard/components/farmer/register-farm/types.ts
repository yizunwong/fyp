import type { FieldErrors } from "react-hook-form";
import { z } from "zod";
import { registerFarmSchema } from "@/validation/farm";

export type RegisterFarmFormData = z.infer<typeof registerFarmSchema>;

export type RegisterFarmFormField = keyof RegisterFarmFormData;

export type RegisterFarmFormErrors = FieldErrors<RegisterFarmFormData>;

export interface RegisterFarmSuccessData {
  farmId: string;
  name: string;
  location: string;
}
