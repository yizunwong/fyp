import { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Controller, type UseFormReturn, useWatch } from "react-hook-form";
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
import { CreateUserDtoRole } from "@/api";
import type {
  CreateUserFormValues,
  EditUserFormValues,
} from "@/validation/user";

interface UserFormProps {
  form: UseFormReturn<CreateUserFormValues | EditUserFormValues>;
  onSubmit: (values: CreateUserFormValues | EditUserFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isEditMode: boolean;
  selectedRole: string;
  onRoleChange: (role: string) => void;
}

const roleOptions: {
  value: CreateUserDtoRole;
  label: string;
  colors: readonly [string, string];
}[] = [
  {
    value: CreateUserDtoRole.FARMER,
    label: "Farmer",
    colors: ["#22c55e", "#059669"] as const,
  },
  {
    value: CreateUserDtoRole.RETAILER,
    label: "Retailer",
    colors: ["#3b82f6", "#06b6d4"] as const,
  },
  {
    value: CreateUserDtoRole.GOVERNMENT_AGENCY,
    label: "Government Agency",
    colors: ["#8b5cf6", "#7c3aed"] as const,
  },
  {
    value: CreateUserDtoRole.ADMIN,
    label: "Admin",
    colors: ["#dc2626", "#b91c1c"] as const,
  },
];

const inactiveRoleColors = ["#e5e7eb", "#d1d5db"] as const;
const farmerSubmitColors = ["#22c55e", "#059669"] as const;
const retailerSubmitColors = ["#3b82f6", "#06b6d4"] as const;
const agencySubmitColors = ["#8b5cf6", "#7c3aed"] as const;
const adminSubmitColors = ["#dc2626", "#b91c1c"] as const;

export default function UserForm({
  form,
  onSubmit,
  onCancel,
  isSubmitting,
  isEditMode,
  selectedRole,
  onRoleChange,
}: UserFormProps) {
  const { control, handleSubmit, formState, setValue, clearErrors } = form;

  const watchedRole = useWatch({
    control,
    name: "role" as keyof (CreateUserFormValues | EditUserFormValues),
    defaultValue: selectedRole as CreateUserDtoRole,
  });
  const currentRole = (watchedRole ||
    selectedRole ||
    CreateUserDtoRole.FARMER) as CreateUserDtoRole;

  useEffect(() => {
    setValue(
      "role" as keyof (CreateUserFormValues | EditUserFormValues),
      currentRole as any,
      { shouldDirty: false }
    );
    if (
      currentRole === CreateUserDtoRole.FARMER ||
      currentRole === CreateUserDtoRole.ADMIN
    ) {
      setValue(
        "companyName" as keyof (CreateUserFormValues | EditUserFormValues),
        "" as any,
        { shouldDirty: false }
      );
      setValue(
        "businessAddress" as keyof (CreateUserFormValues | EditUserFormValues),
        "" as any,
        { shouldDirty: false }
      );
      setValue(
        "agencyName" as keyof (CreateUserFormValues | EditUserFormValues),
        "" as any,
        { shouldDirty: false }
      );
      setValue(
        "department" as keyof (CreateUserFormValues | EditUserFormValues),
        "" as any,
        { shouldDirty: false }
      );
      clearErrors([
        "companyName",
        "businessAddress",
        "agencyName",
        "department",
      ] as any);
    } else if (currentRole === CreateUserDtoRole.RETAILER) {
      setValue(
        "agencyName" as keyof (CreateUserFormValues | EditUserFormValues),
        "" as any,
        { shouldDirty: false }
      );
      setValue(
        "department" as keyof (CreateUserFormValues | EditUserFormValues),
        "" as any,
        { shouldDirty: false }
      );
      clearErrors(["agencyName", "department"] as any);
    } else if (currentRole === CreateUserDtoRole.GOVERNMENT_AGENCY) {
      setValue(
        "companyName" as keyof (CreateUserFormValues | EditUserFormValues),
        "" as any,
        { shouldDirty: false }
      );
      setValue(
        "businessAddress" as keyof (CreateUserFormValues | EditUserFormValues),
        "" as any,
        { shouldDirty: false }
      );
      clearErrors(["companyName", "businessAddress"] as any);
    }
  }, [currentRole, setValue, clearErrors]);

  const handleRoleSelect = (value: CreateUserDtoRole) => {
    if (value === currentRole) return;

    setValue(
      "role" as keyof (CreateUserFormValues | EditUserFormValues),
      value as any,
      { shouldDirty: true, shouldValidate: true }
    );
    clearErrors("role" as any);
    onRoleChange(value);

    if (
      value === CreateUserDtoRole.FARMER ||
      value === CreateUserDtoRole.ADMIN
    ) {
      setValue(
        "companyName" as keyof (CreateUserFormValues | EditUserFormValues),
        "" as any,
        { shouldDirty: true, shouldValidate: false }
      );
      setValue(
        "businessAddress" as keyof (CreateUserFormValues | EditUserFormValues),
        "" as any,
        { shouldDirty: true, shouldValidate: false }
      );
      setValue(
        "agencyName" as keyof (CreateUserFormValues | EditUserFormValues),
        "" as any,
        { shouldDirty: true, shouldValidate: false }
      );
      setValue(
        "department" as keyof (CreateUserFormValues | EditUserFormValues),
        "" as any,
        { shouldDirty: true, shouldValidate: false }
      );
      clearErrors([
        "companyName",
        "businessAddress",
        "agencyName",
        "department",
      ] as any);
    } else if (value === CreateUserDtoRole.RETAILER) {
      setValue(
        "agencyName" as keyof (CreateUserFormValues | EditUserFormValues),
        "" as any,
        { shouldDirty: true, shouldValidate: false }
      );
      setValue(
        "department" as keyof (CreateUserFormValues | EditUserFormValues),
        "" as any,
        { shouldDirty: true, shouldValidate: false }
      );
      clearErrors(["agencyName", "department"] as any);
    } else if (value === CreateUserDtoRole.GOVERNMENT_AGENCY) {
      setValue(
        "companyName" as keyof (CreateUserFormValues | EditUserFormValues),
        "" as any,
        { shouldDirty: true, shouldValidate: false }
      );
      setValue(
        "businessAddress" as keyof (CreateUserFormValues | EditUserFormValues),
        "" as any,
        { shouldDirty: true, shouldValidate: false }
      );
      clearErrors(["companyName", "businessAddress"] as any);
    }
  };

  const submitUser = async (
    values: CreateUserFormValues | EditUserFormValues
  ) => {
    await onSubmit(values);
  };

  const renderError = (message?: string) =>
    message ? <Text className="text-red-500 dark:text-red-400 text-xs">{message}</Text> : null;

  const getSubmitColors = () => {
    if (currentRole === CreateUserDtoRole.RETAILER) return retailerSubmitColors;
    if (currentRole === CreateUserDtoRole.GOVERNMENT_AGENCY)
      return agencySubmitColors;
    if (currentRole === CreateUserDtoRole.ADMIN) return adminSubmitColors;
    return farmerSubmitColors;
  };

  return (
    <View className="gap-6">
      <View className="gap-3">
        <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold">Select role</Text>
        <View className="flex-row gap-3">
          {roleOptions.map((option) => {
            const isSelected = option.value === currentRole;
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
                      isSelected ? "text-white" : "text-black dark:text-black"
                    }`}
                  >
                    {option.label}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>
        {renderError(formState.errors.role?.message as string)}
      </View>

      <Controller
        control={control}
        name={"username" as any}
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
        name={"email" as any}
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

      {!isEditMode && (
        <>
          <Controller
            control={control}
            name={"password" as any}
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
            name={"confirmPassword" as any}
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
        </>
      )}

      <Controller
        control={control}
        name={"nric" as any}
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
        name={"phone" as any}
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

      {currentRole === CreateUserDtoRole.RETAILER && (
        <>
          <Controller
            control={control}
            name={"companyName" as any}
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
            name={"businessAddress" as any}
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

      {currentRole === CreateUserDtoRole.GOVERNMENT_AGENCY && (
        <>
          <Controller
            control={control}
            name={"agencyName" as any}
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
            name={"department" as any}
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
        onPress={handleSubmit(submitUser)}
        loading={isSubmitting}
        title={isEditMode ? "Update User" : "Create User"}
        loadingTitle={isEditMode ? "Updating..." : "Creating..."}
        gradientColors={getSubmitColors()}
        className="rounded-lg overflow-hidden mt-4"
      />
    </View>
  );
}
