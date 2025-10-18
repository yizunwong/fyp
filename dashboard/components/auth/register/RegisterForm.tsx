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
  Building,
  MapPin,
} from "lucide-react-native";
import SubmitButton from "@/components/ui/SubmitButton";
import InputField from "@/components/ui/InputField";
import {
  registrationSchema,
  type RegistrationFormValues,
} from "@/lib/validation/auth";
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
];

const inactiveRoleColors = ["#e5e7eb", "#d1d5db"] as const;
const farmerSubmitColors = ["#22c55e", "#059669"] as const;
const retailerSubmitColors = ["#3b82f6", "#06b6d4"] as const;

interface RegistrationFormProps {
  role?: SelectableRegisterRole;
  onSubmit: (data: any) => Promise<void> | void;
  onRoleChange?: (role: SelectableRegisterRole) => void;
}

export default function RegistrationForm({
  role = "farmer",
  onSubmit,
  onRoleChange,
}: RegistrationFormProps) {
  const {
    control,
    handleSubmit,
    formState,
    setValue,
    reset,
    clearErrors,
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      role: role,
      username: "",
      password: "",
      email: "",
      phone: "",
      nric: "",
      company: "",
      address: "",
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
      clearErrors(["company", "address"]);
    }
  };

  const submitRegistration = async (values: RegistrationFormValues) => {
    const { company, address, role, ...rest } = values;
    const payload =
      role === "retailer"
        ? { role, ...rest, company, address }
        : { role, ...rest };

    await onSubmit(payload);

    reset({
      role: values.role,
      username: "",
      password: "",
      email: "",
      phone: "",
      nric: "",
      company: "",
      address: "",
    });
  };

  const renderError = (message?: string) =>
    message ? <Text className="text-red-500 text-xs">{message}</Text> : null;

  return (
    <View className="gap-6">
      <View className="gap-3">
        <Text className="text-gray-700 text-sm font-semibold">
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
                      isSelected ? "text-white" : "text-gray-700"
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
                <Text className="text-gray-700 text-sm font-semibold">
                  Phone{" "}
                  <Text className="text-gray-400 text-xs">(Optional)</Text>
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
        <View className="border-t border-gray-200 mt-6 pt-4 gap-4">
          <Text className="text-gray-900 text-base font-semibold">
            Retailer Information
          </Text>

          <Controller
            control={control}
            name="company"
            render={({ field, fieldState }) => (
              <View className="gap-1">
                <InputField
                  label="Company Name"
                  icon={<Building color="#9ca3af" size={20} />}
                  placeholder="Enter your company name"
                  value={field.value ?? ""}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
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
                />
                {renderError(fieldState.error?.message)}
              </View>
            )}
          />
        </View>
      )}

      <SubmitButton
        onPress={handleSubmit(submitRegistration)}
        loading={formState.isSubmitting}
        title="Create Account"
        loadingTitle="Submitting..."
        gradientColors={
          selectedRole === "retailer"
            ? retailerSubmitColors
            : farmerSubmitColors
        }
        className="rounded-lg overflow-hidden mt-4"
      />
    </View>
  );
}
