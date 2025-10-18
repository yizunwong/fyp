import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Sprout, Store, Building2, ArrowLeft, Lock } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AgencyForm from '@/components/form/AgencyForm';
import FarmerForm from '@/components/form/FarmerForm';
import RetailerForm from '@/components/form/RetailerForm';


const roleConfig = {
  farmer: {
    label: "Farmer",
    icon: Sprout,
    gradientColors: ["#22c55e", "#059669"] as const,
    description: "Join as a farmer to manage your crops and supply chain",
  },
  retailer: {
    label: "Retailer",
    icon: Store,
    gradientColors: ["#3b82f6", "#06b6d4"] as const,
    description: "Join as a retailer to track product distribution",
  },
  agency: {
    label: "Government Agency",
    icon: Building2,
    gradientColors: ["#8b5cf6", "#7c3aed"] as const,
    description: "Join as an agency to monitor and regulate",
  },
};

export default function RegisterRoleScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role: string }>();
  const { width } = useWindowDimensions();

  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 768;

  const config = roleConfig[role as keyof typeof roleConfig];

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

  const Icon = config.icon;

  const handleFormSubmit = (data: any) => {
    router.push("/home");
  };

  const BrandingSection = () => (
    <LinearGradient
      colors={config.gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className={`p-8 justify-center ${isDesktop ? "min-h-screen" : "py-16"}`}
    >
      <View>
        <View className="items-center mb-12">
          <View className="w-20 h-20 bg-white/20 rounded-2xl items-center justify-center mb-6">
            <Icon color="#fff" size={48} />
          </View>
          <Text className="text-white text-3xl font-bold mb-3 text-center">
            {config.label}
          </Text>
          <Text className="text-white/90 text-base text-center px-4">
            {config.description}
          </Text>
        </View>

        <View className="gap-6">
          <View className="flex-row gap-3">
            <View className="w-8 h-8 bg-white/20 rounded-lg items-center justify-center mt-1">
              <Lock color="#fff" size={16} />
            </View>
            <View className="flex-1">
              <Text className="text-white text-base font-semibold mb-1">
                Secure Registration
              </Text>
              <Text className="text-white/90 text-sm leading-[18px]">
                Your data is protected with blockchain technology
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="w-8 h-8 bg-white/20 rounded-lg items-center justify-center mt-1">
              <Icon color="#fff" size={16} />
            </View>
            <View className="flex-1">
              <Text className="text-white text-base font-semibold mb-1">
                Role-Based Access
              </Text>
              <Text className="text-white/90 text-sm leading-[18px]">
                Get features tailored to your specific needs
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="mt-12 pt-6 border-t border-white/20">
        <Text className="text-white/90 text-sm">
          Join thousands of {config.label.toLowerCase()}s using AgriChain
        </Text>
      </View>
    </LinearGradient>
  );

  const FormSection = () => (
    <View className={`p-8 ${isDesktop ? "justify-center min-h-screen" : ""}`}>
      <TouchableOpacity
        onPress={() => router.back()}
        className="flex-row items-center gap-2 mb-8"
      >
        <ArrowLeft color="#6b7280" size={20} />
        <Text className="text-gray-600 text-sm font-medium">Back</Text>
      </TouchableOpacity>

      <View className="mb-8">
        <Text className="text-gray-900 text-3xl font-bold mb-2">
          Create Account
        </Text>
        <Text className="text-gray-600 text-base">
          Register as a {config.label.toLowerCase()}
        </Text>
      </View>

      {role === "farmer" && <FarmerForm onSubmit={handleFormSubmit} />}
      {role === "retailer" && <RetailerForm onSubmit={handleFormSubmit} />}
      {role === "agency" && <AgencyForm onSubmit={handleFormSubmit} />}

      <View className="mt-6 flex-row justify-center items-center">
        <Text className="text-gray-600 text-sm">Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text className="text-emerald-600 text-sm font-semibold">
            Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isDesktop) {
    return (
      <View className="flex-1 flex-row">
        <View className="w-2/5">
          <BrandingSection />
        </View>
        <ScrollView className="flex-1 bg-gray-50">
          <FormSection />
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <BrandingSection />
      <View className="bg-gray-50">
        <FormSection />
      </View>
    </ScrollView>
  );
}
