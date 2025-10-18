import { View, Text } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Lock,
  Mail,
  Phone,
  Building,
  MapPin,
  Hash,
} from "lucide-react-native";
import SubmitButton from "@/components/ui/SubmitButton";
import InputField from "@/components/ui/InputField";
import {
  retailerRegistrationSchema,
  type RetailerRegistrationFormValues,
} from "@/lib/validation/auth";

interface RetailerFormProps {
  onSubmit: (data: any) => Promise<void> | void;
}

export default function RetailerForm({ onSubmit }: RetailerFormProps) {
  const { control, handleSubmit, formState, reset } =
    useForm<RetailerRegistrationFormValues>({
      resolver: zodResolver(retailerRegistrationSchema),
      defaultValues: {
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

  const handleValidSubmit = async (
    values: RetailerRegistrationFormValues
  ) => {
    await onSubmit({
      role: "retailer",
      ...values,
    });
    reset();
  };

  return (
    <View className="gap-6">
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
            {fieldState.error ? (
              <Text className="text-red-500 text-xs">
                {fieldState.error.message}
              </Text>
            ) : null}
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
            {fieldState.error ? (
              <Text className="text-red-500 text-xs">
                {fieldState.error.message}
              </Text>
            ) : null}
          </View>
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <View className="gap-1">
            <InputField
              label={
                <Text className="text-gray-700 text-sm font-semibold">
                  Email{" "}
                  <Text className="text-gray-400 text-xs">(Optional)</Text>
                </Text>
              }
              icon={<Mail color="#9ca3af" size={20} />}
              placeholder="Enter your email"
              value={field.value ?? ""}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            {fieldState.error ? (
              <Text className="text-red-500 text-xs">
                {fieldState.error.message}
              </Text>
            ) : null}
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
            {fieldState.error ? (
              <Text className="text-red-500 text-xs">
                {fieldState.error.message}
              </Text>
            ) : null}
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
            {fieldState.error ? (
              <Text className="text-red-500 text-xs">
                {fieldState.error.message}
              </Text>
            ) : null}
          </View>
        )}
      />

      <View className="border-t border-gray-200 mt-6 pt-4">
        <Text className="text-gray-900 text-base font-semibold mb-4">
          Retailer Information
        </Text>

        <View className="gap-4">
          <Controller
            control={control}
            name="company"
            render={({ field, fieldState }) => (
              <View className="gap-1">
                <InputField
                  label="Company Name"
                  icon={<Building color="#9ca3af" size={20} />}
                  placeholder="Enter your company name"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                />
                {fieldState.error ? (
                  <Text className="text-red-500 text-xs">
                    {fieldState.error.message}
                  </Text>
                ) : null}
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
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                />
                {fieldState.error ? (
                  <Text className="text-red-500 text-xs">
                    {fieldState.error.message}
                  </Text>
                ) : null}
              </View>
            )}
          />
        </View>
      </View>

      <SubmitButton
        onPress={handleSubmit(handleValidSubmit)}
        loading={formState.isSubmitting}
        title="Register as Retailer"
        loadingTitle="Registering..."
        gradientColors={["#3b82f6", "#06b6d4"]}
        className="rounded-lg overflow-hidden mt-4"
      />
    </View>
  );
}
