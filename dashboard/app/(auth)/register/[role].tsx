import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import BrandingSection from "@/components/auth/register/BrandingSection";
import {
  roleConfig,
  type RegisterRole,
} from "@/components/auth/register/constants";
import RegisterFormSection from "@/components/auth/register/RegisterFormSection";
import Toast from "react-native-toast-message";
import { parseError } from '@/utils/format-error';

export default function RegisterRoleScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role: RegisterRole }>();
  const { width } = useWindowDimensions();

  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && (width === 0 ? true : width >= 768);

  const config = role ? roleConfig[role] : undefined;

  if (!config) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-900 text-lg font-semibold">
          Invalid role
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-emerald-600 text-sm font-semibold">
            Go back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleRegister = async (data: any) => {
    try {
      router.push("/dashboard" as any);
      Toast.show({
        type: "success",
        text1: "Account created",
        text2: "Welcome to AgriChain!",
      });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Registration failed",
        text2: parseError(err),
      });
    }
  };

  const formProps = config
    ? {
        role: role as RegisterRole,
        config,
        isDesktop,
        router,
        onSubmit: handleRegister,
      }
    : undefined;

  return (
    <View className="flex-1 flex-row bg-gray-50">
      {isDesktop && (
        <View className="w-1/2">
          {config && <BrandingSection config={config} isDesktop={isDesktop} />}
        </View>
      )}
      <ScrollView className="flex-1 bg-gray-50">
        {formProps && <RegisterFormSection {...formProps} />}
      </ScrollView>
    </View>
  );
}
