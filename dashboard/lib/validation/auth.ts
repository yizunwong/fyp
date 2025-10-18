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
    role: z.enum(["farmer", "retailer"], {
      required_error: "Role is required",
    }),
    username: z
      .string({ required_error: "Username is required" })
      .trim()
      .min(3, "Username must be at least 3 characters"),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
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
  });

export type RegistrationFormValues = z.infer<typeof registrationSchema>;
