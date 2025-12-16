import React, { useEffect } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { Controller, type UseFormReturn } from "react-hook-form";
import { CreateUserDtoRole } from "@/api";
import type { EditUserFormValues } from "@/validation/user";
import SubmitButton from "@/components/ui/SubmitButton";

interface EditUserFormProps {
  form: UseFormReturn<EditUserFormValues>;
  onSubmit: (values: EditUserFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ROLE_OPTIONS = [
  { value: CreateUserDtoRole.FARMER, label: "Farmer" },
  { value: CreateUserDtoRole.RETAILER, label: "Retailer" },
  { value: CreateUserDtoRole.GOVERNMENT_AGENCY, label: "Government Agency" },
  { value: CreateUserDtoRole.ADMIN, label: "Admin" },
];

export default function EditUserForm({
  form,
  onSubmit,
  onCancel,
  isSubmitting,
}: EditUserFormProps) {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = form;

  const selectedRole = watch("role");

  useEffect(() => {
    // Clear role-specific fields when role changes
    if (selectedRole !== CreateUserDtoRole.RETAILER) {
      setValue("companyName", "");
      setValue("businessAddress", "");
      clearErrors(["companyName", "businessAddress"]);
    }
    if (selectedRole !== CreateUserDtoRole.GOVERNMENT_AGENCY) {
      setValue("agencyName", "");
      setValue("department", "");
      clearErrors(["agencyName", "department"]);
    }
  }, [selectedRole, setValue, clearErrors]);

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="gap-4 pb-4">
        <View>
          <Text className="text-gray-700 text-sm font-semibold mb-2">
            Role <Text className="text-red-500">*</Text>
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {ROLE_OPTIONS.map((option) => (
              <Controller
                key={option.value}
                control={control}
                name="role"
                render={({ field }) => (
                  <TouchableOpacity
                    onPress={() => {
                      field.onChange(option.value);
                      clearErrors("role");
                    }}
                    className={`px-4 py-2 rounded-lg border ${
                      field.value === option.value
                        ? "bg-purple-50 border-purple-500"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        field.value === option.value
                          ? "text-purple-700"
                          : "text-gray-700"
                      }`}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            ))}
          </View>
          {errors.role && (
            <Text className="text-red-500 text-xs mt-1">{errors.role.message}</Text>
          )}
        </View>

        <View>
          <Text className="text-gray-700 text-sm font-semibold mb-2">
            Email <Text className="text-red-500">*</Text>
          </Text>
          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <>
                <TextInput
                  value={field.value}
                  onChangeText={(value) => {
                    field.onChange(value);
                    if (fieldState.error) clearErrors("email");
                  }}
                  onBlur={field.onBlur}
                  placeholder="user@example.com"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className={`px-4 py-3 rounded-xl border ${
                    fieldState.error ? "border-red-400" : "border-gray-200"
                  } bg-white text-gray-900 text-base`}
                />
                {fieldState.error && (
                  <Text className="text-red-500 text-xs mt-1">
                    {fieldState.error.message}
                  </Text>
                )}
              </>
            )}
          />
        </View>

        <View>
          <Text className="text-gray-700 text-sm font-semibold mb-2">
            Username <Text className="text-red-500">*</Text>
          </Text>
          <Controller
            control={control}
            name="username"
            render={({ field, fieldState }) => (
              <>
                <TextInput
                  value={field.value}
                  onChangeText={(value) => {
                    field.onChange(value);
                    if (fieldState.error) clearErrors("username");
                  }}
                  onBlur={field.onBlur}
                  placeholder="username"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  className={`px-4 py-3 rounded-xl border ${
                    fieldState.error ? "border-red-400" : "border-gray-200"
                  } bg-white text-gray-900 text-base`}
                />
                {fieldState.error && (
                  <Text className="text-red-500 text-xs mt-1">
                    {fieldState.error.message}
                  </Text>
                )}
              </>
            )}
          />
        </View>

        <View>
          <Text className="text-gray-700 text-sm font-semibold mb-2">
            NRIC <Text className="text-red-500">*</Text>
          </Text>
          <Controller
            control={control}
            name="nric"
            render={({ field, fieldState }) => (
              <>
                <TextInput
                  value={field.value}
                  onChangeText={(value) => {
                    field.onChange(value);
                    if (fieldState.error) clearErrors("nric");
                  }}
                  onBlur={field.onBlur}
                  placeholder="NRIC number"
                  placeholderTextColor="#9ca3af"
                  className={`px-4 py-3 rounded-xl border ${
                    fieldState.error ? "border-red-400" : "border-gray-200"
                  } bg-white text-gray-900 text-base`}
                />
                {fieldState.error && (
                  <Text className="text-red-500 text-xs mt-1">
                    {fieldState.error.message}
                  </Text>
                )}
              </>
            )}
          />
        </View>

        <View>
          <Text className="text-gray-700 text-sm font-semibold mb-2">Phone</Text>
          <Controller
            control={control}
            name="phone"
            render={({ field, fieldState }) => (
              <>
                <TextInput
                  value={field.value || ""}
                  onChangeText={(value) => {
                    field.onChange(value);
                    if (fieldState.error) clearErrors("phone");
                  }}
                  onBlur={field.onBlur}
                  placeholder="+60XXXXXXXXX"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                  className={`px-4 py-3 rounded-xl border ${
                    fieldState.error ? "border-red-400" : "border-gray-200"
                  } bg-white text-gray-900 text-base`}
                />
                {fieldState.error && (
                  <Text className="text-red-500 text-xs mt-1">
                    {fieldState.error.message}
                  </Text>
                )}
              </>
            )}
          />
        </View>

        {selectedRole === CreateUserDtoRole.RETAILER && (
          <>
            <View>
              <Text className="text-gray-700 text-sm font-semibold mb-2">
                Company Name <Text className="text-red-500">*</Text>
              </Text>
              <Controller
                control={control}
                name="companyName"
                render={({ field, fieldState }) => (
                  <>
                    <TextInput
                      value={field.value || ""}
                      onChangeText={(value) => {
                        field.onChange(value);
                        if (fieldState.error) clearErrors("companyName");
                      }}
                      onBlur={field.onBlur}
                      placeholder="Company name"
                      placeholderTextColor="#9ca3af"
                      className={`px-4 py-3 rounded-xl border ${
                        fieldState.error ? "border-red-400" : "border-gray-200"
                      } bg-white text-gray-900 text-base`}
                    />
                    {fieldState.error && (
                      <Text className="text-red-500 text-xs mt-1">
                        {fieldState.error.message}
                      </Text>
                    )}
                  </>
                )}
              />
            </View>

            <View>
              <Text className="text-gray-700 text-sm font-semibold mb-2">
                Business Address <Text className="text-red-500">*</Text>
              </Text>
              <Controller
                control={control}
                name="businessAddress"
                render={({ field, fieldState }) => (
                  <>
                    <TextInput
                      value={field.value || ""}
                      onChangeText={(value) => {
                        field.onChange(value);
                        if (fieldState.error) clearErrors("businessAddress");
                      }}
                      onBlur={field.onBlur}
                      placeholder="Business address"
                      placeholderTextColor="#9ca3af"
                      multiline
                      numberOfLines={3}
                      className={`px-4 py-3 rounded-xl border ${
                        fieldState.error ? "border-red-400" : "border-gray-200"
                      } bg-white text-gray-900 text-base min-h-[80px]`}
                      style={{ textAlignVertical: "top" }}
                    />
                    {fieldState.error && (
                      <Text className="text-red-500 text-xs mt-1">
                        {fieldState.error.message}
                      </Text>
                    )}
                  </>
                )}
              />
            </View>
          </>
        )}

        {selectedRole === CreateUserDtoRole.GOVERNMENT_AGENCY && (
          <>
            <View>
              <Text className="text-gray-700 text-sm font-semibold mb-2">
                Agency Name <Text className="text-red-500">*</Text>
              </Text>
              <Controller
                control={control}
                name="agencyName"
                render={({ field, fieldState }) => (
                  <>
                    <TextInput
                      value={field.value || ""}
                      onChangeText={(value) => {
                        field.onChange(value);
                        if (fieldState.error) clearErrors("agencyName");
                      }}
                      onBlur={field.onBlur}
                      placeholder="Agency name"
                      placeholderTextColor="#9ca3af"
                      className={`px-4 py-3 rounded-xl border ${
                        fieldState.error ? "border-red-400" : "border-gray-200"
                      } bg-white text-gray-900 text-base`}
                    />
                    {fieldState.error && (
                      <Text className="text-red-500 text-xs mt-1">
                        {fieldState.error.message}
                      </Text>
                    )}
                  </>
                )}
              />
            </View>

            <View>
              <Text className="text-gray-700 text-sm font-semibold mb-2">
                Department <Text className="text-red-500">*</Text>
              </Text>
              <Controller
                control={control}
                name="department"
                render={({ field, fieldState }) => (
                  <>
                    <TextInput
                      value={field.value || ""}
                      onChangeText={(value) => {
                        field.onChange(value);
                        if (fieldState.error) clearErrors("department");
                      }}
                      onBlur={field.onBlur}
                      placeholder="Department"
                      placeholderTextColor="#9ca3af"
                      className={`px-4 py-3 rounded-xl border ${
                        fieldState.error ? "border-red-400" : "border-gray-200"
                      } bg-white text-gray-900 text-base`}
                    />
                    {fieldState.error && (
                      <Text className="text-red-500 text-xs mt-1">
                        {fieldState.error.message}
                      </Text>
                    )}
                  </>
                )}
              />
            </View>
          </>
        )}

        <View className="flex-row gap-3 pt-2">
          <TouchableOpacity
            onPress={onCancel}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 bg-white"
          >
            <Text className="text-gray-700 text-center text-base font-semibold">
              Cancel
            </Text>
          </TouchableOpacity>
          <View className="flex-1">
            <SubmitButton
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              title="Update User"
              loadingTitle="Updating..."
              gradientColors={["#7c3aed", "#6d28d9"]}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

