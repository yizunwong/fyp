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

const phoneRegex = /^(?:\+?60|0)1[0-9]{8,9}$/;

export const registrationSchema = z
  .object({
    role: z.enum(["farmer", "retailer", "agency"], {
      required_error: "Role is required",
    }),
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
    // password: z
    //   .string({ required_error: "Password is required" })
    //   .min(8, "Password must be at least 8 characters long")
    //   .max(64, "Password cannot exceed 64 characters")
    //   .regex(/[A-Z]/, "Password must include at least one uppercase letter")
    //   .regex(/[a-z]/, "Password must include at least one lowercase letter")
    //   .regex(/[0-9]/, "Password must include at least one number")
    //   .regex(
    //     /[^A-Za-z0-9]/,
    //     "Password must include at least one special character"
    //   )
    //   .refine((val) => !/\s/.test(val), {
    //     message: "Password must not contain spaces",
    //   }),
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    phone: optionalFromString(
      z.string().trim().regex(phoneRegex, "Enter a valid phone number")
    ),
    nric: z
      .string({ required_error: "NRIC is required" })
      .trim()
      .min(3, "NRIC is required"),
    company: optionalFromString(
      z.string().trim().min(2, "Company name is required")
    ),
    address: optionalFromString(
      z.string().trim().min(5, "Business address is required")
    ),
    agencyName: optionalFromString(
      z.string().trim().min(2, "Agency name is required")
    ),
    department: optionalFromString(
      z.string().trim().min(2, "Department is required")
    ),
  })
  .refine((data) => data.confirmPassword === data.password, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .superRefine((data, ctx) => {
    if (data.role === "retailer") {
      if (!data.company) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["company"],
          message: "Company name is required for retailer registration",
        });
      }
      if (!data.address) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["address"],
          message: "Business address is required for retailer registration",
        });
      }
    }

    if (data.role === "agency") {
      if (!data.agencyName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["agencyName"],
          message: "Agency name is required for agency registration",
        });
      }
      if (!data.department) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["department"],
          message: "Department is required for agency registration",
        });
      }
    }
  });

export type RegistrationFormValues = z.infer<typeof registrationSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string({ required_error: "Token is required" }).min(1, "Token is required"),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters long"),
    confirmPassword: z
      .string({ required_error: "Confirm password is required" })
      .min(8, "Confirm password must be at least 8 characters long"),
  })
  .refine((data) => data.confirmPassword === data.password, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;