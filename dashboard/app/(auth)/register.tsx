import { useState } from "react";
import {
  View,
  ScrollView,
  Platform,
  useWindowDimensions,
  type ViewStyle,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import BrandingSection from "@/components/auth/register/BrandingSection";
import {
  roleConfig,
  type RegisterRole,
  type SelectableRegisterRole,
} from "@/components/auth/register/constants";
import RegisterFormSection from "@/components/auth/register/RegisterFormSection";
import Toast from "react-native-toast-message";
import { parseError } from "@/utils/format-error";
import useAuth from "@/hooks/useAuth";
import { AuthControllerRegisterMutationBody, CreateUserDtoRole } from "@/api";

const isSelectableRole = (
  value: RegisterRole | undefined
): value is SelectableRegisterRole =>
  value === "farmer" || value === "retailer";

const roleMap: Record<string, CreateUserDtoRole> = {
  farmer: CreateUserDtoRole.FARMER,
  retailer: CreateUserDtoRole.RETAILER,
  government_agency: CreateUserDtoRole.GOVERNMENT_AGENCY,
  admin: CreateUserDtoRole.ADMIN,
};

export default function RegisterRoleScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role?: RegisterRole }>();
  const { width } = useWindowDimensions();
  const { register: registerUser } = useAuth();

  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && (width === 0 ? true : width >= 768);

  const initialRole: SelectableRegisterRole = isSelectableRole(role)
    ? role
    : "farmer";
  const [selectedRole, setSelectedRole] =
    useState<SelectableRegisterRole>(initialRole);
  const config = roleConfig[selectedRole];

  const handleRegister = async (data: AuthControllerRegisterMutationBody) => {
    try {
      data.role = roleMap[selectedRole?.toLowerCase() ?? "farmer"];
      await registerUser(data);
      router.push("/login");
      Toast.show({
        type: "success",
        text1: "Account created",
        text2: "Welcome to AgriChain!",
      });
    } catch (err) {
      const message = parseError(err);
      Toast.show({
        type: "error",
        text1: "Registration failed",
        text2: message,
      });
    }
  };

  const formProps = config
    ? {
        role: selectedRole,
        config,
        isDesktop,
        router,
        onSubmit: handleRegister,
        onRoleChange: (nextRole: SelectableRegisterRole) =>
          setSelectedRole(nextRole),
      }
    : undefined;

  const scrollContentStyle = { flexGrow: 1 };
  const scrollStyle: ViewStyle | undefined = isDesktop
    ? {
        paddingRight: 12,
        // Keep space reserved for the scrollbar so the layout does not shift.
        ...(Platform.OS === "web"
          ? ({ scrollbarGutter: "stable both-edges" } as any)
          : {}),
      }
    : undefined;

  return (
    <View className="flex-1 flex-row bg-gray-50">
      {isDesktop && (
        <View className="w-1/2">
          {config && <BrandingSection config={config} isDesktop={isDesktop} />}
        </View>
      )}
      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerStyle={scrollContentStyle}
        style={scrollStyle}
        showsVerticalScrollIndicator={isDesktop}
      >
        {formProps && <RegisterFormSection {...formProps} />}
      </ScrollView>
    </View>
  );
}
