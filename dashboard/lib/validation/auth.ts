import { z } from "zod";

const optionalFromString = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (value) => {
      if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed === "" ? undefined : trimmed;
      }
      return value;
    },
    schema.optional()
  );

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters long"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const farmerRegistrationSchema = z.object({
  username: z
    .string({ required_error: "Username is required" })
    .trim()
    .min(3, "Username must be at least 3 characters"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
  email: optionalFromString(
    z
      .string()
      .trim()
      .email("Enter a valid email address")
  ),
  phone: optionalFromString(
    z
      .string()
      .trim()
      .regex(/^[0-9+\-\s()]{7,20}$/, "Enter a valid phone number")
  ),
  nric: z
    .string({ required_error: "NRIC is required" })
    .trim()
    .min(3, "NRIC is required"),
});

export type FarmerRegistrationFormValues = z.infer<
  typeof farmerRegistrationSchema
>;

export const retailerRegistrationSchema = farmerRegistrationSchema.extend({
  company: z
    .string({ required_error: "Company name is required" })
    .trim()
    .min(2, "Company name is required"),
  address: z
    .string({ required_error: "Business address is required" })
    .trim()
    .min(5, "Business address is required"),
});

export type RetailerRegistrationFormValues = z.infer<
  typeof retailerRegistrationSchema
>;
