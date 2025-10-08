import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Sprout, Store, Building2, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const roles = [
  {
    id: "farmer",
    label: "Farmer",
    icon: Sprout,
    description: "Manage crops and supply chain",
    gradientColors: ["#22c55e", "#059669"] as const,
  },
  {
    id: "retailer",
    label: "Retailer",
    icon: Store,
    description: "Track product distribution",
    gradientColors: ["#3b82f6", "#06b6d4"] as const,
  },
  {
    id: "agency",
    label: "Government Agency",
    icon: Building2,
    description: "Monitor and regulate",
    gradientColors: ["#8b5cf6", "#7c3aed"] as const,
  },
];

export default function RoleSelectScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 768;

  const handleRoleSelect = (roleId: string) => {
    router.push({ pathname: "/register/[role]", params: { role: roleId } });
  };

  const BrandingSection = () => (
    <LinearGradient
      colors={["#059669", "#10b981", "#14b8a6"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className={`p-8 justify-center ${isDesktop ? "min-h-screen" : "py-16"}`}
    >
      <View className="items-center">
        <View className="w-20 h-20 bg-white/20 rounded-2xl items-center justify-center mb-6">
          <Sprout color="#fff" size={48} />
        </View>
        <Text className="text-white text-4xl font-bold mb-3 text-center">
          AgriChain
        </Text>
        <Text className="text-emerald-100 text-base text-center">
          Blockchain Agriculture Platform
        </Text>
        <View className="mt-8 bg-white/10 px-6 py-3 rounded-lg">
          <Text className="text-white text-sm text-center">
            Choose your role to get started
          </Text>
        </View>
      </View>
    </LinearGradient>
  );

  const RoleCards = () => (
    <View
      className={`p-8 ${isDesktop ? "justify-center min-h-screen" : "py-12"}`}
    >
      <View className="mb-8">
        <Text className="text-gray-900 text-3xl font-bold mb-2">
          Select Your Role
        </Text>
        <Text className="text-gray-600 text-base">
          Choose the option that best describes you
        </Text>
      </View>

      <View className={isDesktop ? "flex-row gap-4" : "gap-4"}>
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <TouchableOpacity
              key={role.id}
              onPress={() => handleRoleSelect(role.id)}
              className={`overflow-hidden rounded-2xl ${
                isDesktop ? "flex-1" : ""
              }`}
            >
              <LinearGradient
                colors={role.gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="p-6 min-h-[160px] justify-between"
              >
                <View className="items-center">
                  <View className="w-16 h-16 bg-white/20 rounded-xl items-center justify-center mb-4">
                    <Icon color="#fff" size={32} />
                  </View>
                  <Text className="text-white text-xl font-bold mb-2 text-center">
                    {role.label}
                  </Text>
                  <Text className="text-white/90 text-sm text-center mb-4">
                    {role.description}
                  </Text>
                </View>
                <View className="flex-row items-center justify-center gap-2">
                  <Text className="text-white text-sm font-medium">
                    Continue
                  </Text>
                  <ChevronRight color="#fff" size={20} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="mt-8 flex-row justify-center items-center">
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
        <View className="flex-1 bg-gray-50">
          <RoleCards />
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <RoleCards />
    </ScrollView>
  );
}
