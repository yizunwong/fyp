import { z } from "zod";
import { CreateUserDtoRole } from "@/api";

const phoneRegex = /^(?:\+?60|0)1[0-9]{8,9}$/;

export const createUserSchema = z
  .object({
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    username: z
      .string({ required_error: "Username is required" })
      .trim()
      .min(3, "Username must be at least 3 characters"),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string({ required_error: "Confirm password is required" })
      .min(6, "Confirm password must be at least 6 characters"),
    nric: z
      .string({ required_error: "NRIC is required" })
      .trim()
      .min(3, "NRIC is required"),
    phone: z
      .string()
      .trim()
      .regex(phoneRegex, "Enter a valid phone number")
      .optional()
      .or(z.literal("")),
    role: z.nativeEnum(CreateUserDtoRole, {
      required_error: "Role is required",
    }),
    companyName: z.string().trim().min(2, "Company name is required").optional().or(z.literal("")),
    businessAddress: z
      .string()
      .trim()
      .min(5, "Business address is required")
      .optional()
      .or(z.literal("")),
    agencyName: z
      .string()
      .trim()
      .min(2, "Agency name is required")
      .optional()
      .or(z.literal("")),
    department: z
      .string()
      .trim()
      .min(2, "Department is required")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => data.confirmPassword === data.password, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .superRefine((data, ctx) => {
    if (data.role === CreateUserDtoRole.RETAILER) {
      if (!data.companyName || data.companyName.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["companyName"],
          message: "Company name is required for retailer",
        });
      }
      if (!data.businessAddress || data.businessAddress.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["businessAddress"],
          message: "Business address is required for retailer",
        });
      }
    }

    if (data.role === CreateUserDtoRole.GOVERNMENT_AGENCY) {
      if (!data.agencyName || data.agencyName.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["agencyName"],
          message: "Agency name is required for government agency",
        });
      }
      if (!data.department || data.department.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["department"],
          message: "Department is required for government agency",
        });
      }
    }
  });

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const editUserSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  username: z
    .string({ required_error: "Username is required" })
    .trim()
    .min(3, "Username must be at least 3 characters"),
  nric: z
    .string({ required_error: "NRIC is required" })
    .trim()
    .min(3, "NRIC is required"),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  role: z.nativeEnum(CreateUserDtoRole, {
    required_error: "Role is required",
  }),
  companyName: z.string().trim().min(2, "Company name is required").optional().or(z.literal("")),
  businessAddress: z
    .string()
    .trim()
    .min(5, "Business address is required")
    .optional()
    .or(z.literal("")),
  agencyName: z
    .string()
    .trim()
    .min(2, "Agency name is required")
    .optional()
    .or(z.literal("")),
  department: z
    .string()
    .trim()
    .min(2, "Department is required")
    .optional()
    .or(z.literal("")),
});

export type EditUserFormValues = z.infer<typeof editUserSchema>;

