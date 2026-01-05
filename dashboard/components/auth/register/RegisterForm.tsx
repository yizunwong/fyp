import { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Lock,
  Mail,
  Phone,
  Hash,
  Building2,
  MapPin,
  Shield,
} from "lucide-react-native";
import SubmitButton from "@/components/ui/SubmitButton";
import InputField from "@/components/ui/InputField";
import {
  registrationSchema,
  type RegistrationFormValues,
} from "@/validation/auth";
import type { SelectableRegisterRole } from "@/components/auth/register/constants";

const roleOptions: {
  value: SelectableRegisterRole;
  label: string;
  colors: readonly [string, string];
}[] = [
  {
    value: "farmer",
    label: "Farmer",
    colors: ["#22c55e", "#059669"] as const,
  },
  {
    value: "retailer",
    label: "Retailer",
    colors: ["#3b82f6", "#06b6d4"] as const,
  },
  {
    value: "agency",
    label: "Government Agency",
    colors: ["#8b5cf6", "#7c3aed"] as const,
  },
];

const inactiveRoleColors = ["#e5e7eb", "#d1d5db"] as const;
const farmerSubmitColors = ["#22c55e", "#059669"] as const;
const retailerSubmitColors = ["#3b82f6", "#06b6d4"] as const;
const agencySubmitColors = ["#8b5cf6", "#7c3aed"] as const;

interface RegistrationFormProps {
  role?: SelectableRegisterRole;
  onSubmit: (data: RegistrationFormValues) => Promise<void> | void;
  onRoleChange?: (role: SelectableRegisterRole) => void;
}

export default function RegistrationForm({
  role = "farmer",
  onSubmit,
  onRoleChange,
}: RegistrationFormProps) {
  const { control, handleSubmit, formState, setValue, clearErrors } =
    useForm<RegistrationFormValues>({
      resolver: zodResolver(registrationSchema),
      defaultValues: {
        role: role,
        username: "",
        password: "",
        confirmPassword: "",
        email: "",
        phone: "",
        nric: "",
        company: "",
        address: "",
        agencyName: "",
        department: "",
      },
      mode: "onSubmit",
    });

  const selectedRole =
    useWatch({
      control,
      name: "role",
      defaultValue: role,
    }) ?? role;

  useEffect(() => {
    setValue("role", role, { shouldDirty: false });
    if (role === "farmer") {
      setValue("company", "", { shouldDirty: false });
      setValue("address", "", { shouldDirty: false });
      setValue("agencyName", "", { shouldDirty: false });
      setValue("department", "", { shouldDirty: false });
      clearErrors(["company", "address", "agencyName", "department"]);
    } else if (role === "retailer") {
      setValue("agencyName", "", { shouldDirty: false });
      setValue("department", "", { shouldDirty: false });
      clearErrors(["agencyName", "department"]);
    } else if (role === "agency") {
      setValue("company", "", { shouldDirty: false });
      setValue("address", "", { shouldDirty: false });
      clearErrors(["company", "address"]);
    }
  }, [role, setValue, clearErrors]);

  const handleRoleSelect = (value: SelectableRegisterRole) => {
    if (value === selectedRole) return;

    setValue("role", value, { shouldDirty: true, shouldValidate: true });
    clearErrors("role");
    onRoleChange?.(value);

    if (value === "farmer") {
      setValue("company", "", { shouldDirty: true, shouldValidate: false });
      setValue("address", "", { shouldDirty: true, shouldValidate: false });
      setValue("agencyName", "", { shouldDirty: true, shouldValidate: false });
      setValue("department", "", { shouldDirty: true, shouldValidate: false });
      clearErrors(["company", "address", "agencyName", "department"]);
    } else if (value === "retailer") {
      setValue("agencyName", "", { shouldDirty: true, shouldValidate: false });
      setValue("department", "", { shouldDirty: true, shouldValidate: false });
      clearErrors(["agencyName", "department"]);
    } else if (value === "agency") {
      setValue("company", "", { shouldDirty: true, shouldValidate: false });
      setValue("address", "", { shouldDirty: true, shouldValidate: false });
      clearErrors(["company", "address"]);
    }
  };

  const submitRegistration = async (values: RegistrationFormValues) => {
    const { company, address, agencyName, department, role, ...rest } = values;
    let payload: RegistrationFormValues = { role, ...rest };

    if (role === "retailer") {
      payload = { ...payload, company, address };
    }

    if (role === "agency") {
      payload = { ...payload, agencyName, department };
    }

    await onSubmit(payload);
  };

  const renderError = (message?: string) =>
    message ? <Text className="text-red-500 dark:text-red-400 text-xs">{message}</Text> : null;

  return (
    <View className="gap-6">
      <View className="gap-3">
        <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold">
          Select your role
        </Text>
        <View className="flex-row gap-3">
          {roleOptions.map((option) => {
            const isSelected = option.value === selectedRole;
            const colors = isSelected ? option.colors : inactiveRoleColors;

            return (
              <TouchableOpacity
                key={option.value}
                className="flex-1 rounded-lg overflow-hidden"
                onPress={() => handleRoleSelect(option.value)}
              >
                <LinearGradient
                  colors={colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="h-12 items-center justify-center"
                >
                  <Text
                    className={`text-sm font-semibold ${
                      isSelected ? "text-white" : "text-black dark:text-gray-200"
                    }`}
                  >
                    {option.label}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>
        {renderError(formState.errors.role?.message)}
      </View>

      <Controller
        control={control}
        name="username"
        render={({ field, fieldState }) => (
          <View className="gap-1">
            <InputField
              label="Username"
              icon={<User color="#9ca3af" size={20} />}
              placeholder="Enter your username"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              autoCapitalize="none"
              autoComplete="username"
            />
            {renderError(fieldState.error?.message)}
          </View>
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <View className="gap-1">
            <InputField
              label="Email"
              icon={<Mail color="#9ca3af" size={20} />}
              placeholder="Enter your email"
              value={field.value ?? ""}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
            />
            {renderError(fieldState.error?.message)}
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <View className="gap-1">
            <InputField
              label="Password"
              icon={<Lock color="#9ca3af" size={20} />}
              placeholder="Create a password"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
            />
            {renderError(fieldState.error?.message)}
          </View>
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field, fieldState }) => (
          <View className="gap-1">
            <InputField
              label="Confirm Password"
              icon={<Lock color="#9ca3af" size={20} />}
              placeholder="Re-enter your password"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
            />
            {renderError(fieldState.error?.message)}
          </View>
        )}
      />

      <Controller
        control={control}
        name="nric"
        render={({ field, fieldState }) => (
          <View className="gap-1">
            <InputField
              label="NRIC"
              icon={<Hash color="#9ca3af" size={20} />}
              placeholder="Enter your NRIC number"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
            {renderError(fieldState.error?.message)}
          </View>
        )}
      />

      <Controller
        control={control}
        name="phone"
        render={({ field, fieldState }) => (
          <View className="gap-1">
            <InputField
              label={
                <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold">
                  Phone{" "}
                  <Text className="text-gray-400 dark:text-gray-500 text-xs">(Optional)</Text>
                </Text>
              }
              icon={<Phone color="#9ca3af" size={20} />}
              placeholder="Enter your phone number"
              value={field.value ?? ""}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
            {renderError(fieldState.error?.message)}
          </View>
        )}
      />

      {selectedRole === "retailer" && (
        <>
          <Controller
            control={control}
            name="company"
            render={({ field, fieldState }) => (
              <View className="gap-1">
                <InputField
                  label="Company Name"
                  icon={<Building2 color="#9ca3af" size={20} />}
                  placeholder="Enter your company name"
                  value={field.value ?? ""}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  autoCapitalize="words"
                />
                {renderError(fieldState.error?.message)}
              </View>
            )}
          />

          <Controller
            control={control}
            name="address"
            render={({ field, fieldState }) => (
              <View className="gap-1">
                <InputField
                  label="Business Address"
                  icon={<MapPin color="#9ca3af" size={20} />}
                  placeholder="Enter your business address"
                  value={field.value ?? ""}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  multiline
                  textAlignVertical="top"
                  style={{ minHeight: 64, paddingTop: 12, paddingBottom: 12 }}
                  autoCapitalize="sentences"
                />
                {renderError(fieldState.error?.message)}
              </View>
            )}
          />
        </>
      )}

      {selectedRole === "agency" && (
        <>
          <Controller
            control={control}
            name="agencyName"
            render={({ field, fieldState }) => (
              <View className="gap-1">
                <InputField
                  label="Agency Name"
                  icon={<Building2 color="#9ca3af" size={20} />}
                  placeholder="Enter your agency name"
                  value={field.value ?? ""}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  autoCapitalize="words"
                />
                {renderError(fieldState.error?.message)}
              </View>
            )}
          />

          <Controller
            control={control}
            name="department"
            render={({ field, fieldState }) => (
              <View className="gap-1">
                <InputField
                  label="Department"
                  icon={<Shield color="#9ca3af" size={20} />}
                  placeholder="Enter your department"
                  value={field.value ?? ""}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  autoCapitalize="words"
                />
                {renderError(fieldState.error?.message)}
              </View>
            )}
          />
        </>
      )}

      <SubmitButton
        onPress={handleSubmit(submitRegistration)}
        loading={formState.isSubmitting}
        title="Create Account"
        loadingTitle="Submitting..."
        gradientColors={
          selectedRole === "retailer"
            ? retailerSubmitColors
            : selectedRole === "agency"
            ? agencySubmitColors
            : farmerSubmitColors
        }
        className="rounded-lg overflow-hidden mt-4"
      />
    </View>
  );
}
