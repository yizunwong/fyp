import { useEffect, useState } from "react";
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
import AuthSection from "@/components/auth/AuthSection";

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
  }
];

export default function RoleSelectScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const [hydrated, setHydrated] = useState(false);

  // ✅ Only render after layout is known
  useEffect(() => {
    if (width > 0) setHydrated(true);
  }, [width]);

  if (!hydrated && isWeb) {
    // prevent mobile flash
    return <View style={{ flex: 1, backgroundColor: "#f9fafb" }} />;
  }

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
    <AuthSection
      isDesktop={isDesktop}
      title="Select Your Role"
      subtitle="Choose the option that best describes you"
    >
      <>
        <View className="gap-4">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <TouchableOpacity
                key={role.id}
                onPress={() => handleRoleSelect(role.id)}
                className="flex-row items-center p-4 rounded-xl border-2 border-gray-200 bg-white gap-4 active:border-emerald-600"
              >
                <View
                  className="w-12 h-12 rounded-lg items-center justify-center"
                  style={{ backgroundColor: role.gradientColors[0] }}
                >
                  <Icon color="#fff" size={24} />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 text-base font-semibold mb-0.5">
                    {role.label}
                  </Text>
                  <Text className="text-gray-600 text-sm">{role.description}</Text>
                </View>
                <ChevronRight color="#9ca3af" size={20} />
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
      </>
    </AuthSection>
  );

  // ✅ Render correct layout after hydration
  return (
    <View className="flex-1 flex-row bg-gray-50">
      {isDesktop && (
        <View className="w-1/2">
          <BrandingSection />
        </View>
      )}
      <ScrollView className="flex-1 bg-gray-50">
        <RoleCards />
      </ScrollView>
    </View>
  );
}
