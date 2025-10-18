import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  useWindowDimensions,
} from "react-native";
import {
  Sprout,
  Store,
  Building2,
  Lock,
  Mail,
  ChevronRight,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import useAuth from "@/hooks/useAuth";

type UserRole = "farmer" | "retailer" | "government" | null;

const roles = [
  {
    id: "farmer" as const,
    label: "Farmer",
    icon: Sprout,
    description: "Manage crops and supply chain",
    bgColor: "#22c55e",
  },
  {
    id: "retailer" as const,
    label: "Retailer",
    icon: Store,
    description: "Track product distribution",
    bgColor: "#3b82f6",
  },
  {
    id: "government" as const,
    label: "Government Agency",
    icon: Building2,
    description: "Monitor and regulate",
    bgColor: "#a855f7",
  },
];

// ✅ Branding section (no isDesktop prop anymore)
function BrandingSection() {
  return (
    <LinearGradient
      colors={["#059669", "#10b981", "#14b8a6"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="p-8 justify-between min-h-screen"
    >
      <View>
        <View className="flex-row items-center gap-3 mb-12">
          <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
            <Sprout color="#fff" size={28} />
          </View>
          <View>
            <Text className="text-white text-2xl font-bold">AgriChain</Text>
            <Text className="text-emerald-100 text-xs">
              Blockchain Agriculture Platform
            </Text>
          </View>
        </View>

        <View className="gap-6">
          <Feature
            icon={<Lock color="#fff" size={16} />}
            title="Secure & Transparent"
            description="Blockchain-powered traceability for the entire agricultural supply chain"
          />
          <Feature
            icon={<ChevronRight color="#fff" size={16} />}
            title="Real-time Tracking"
            description="Monitor your products from farm to table with complete transparency"
          />
        </View>
      </View>

      <View className="mt-12 pt-6 border-t border-white/20">
        <Text className="text-emerald-100 text-sm">
          Empowering sustainable agriculture through blockchain technology
        </Text>
      </View>
    </LinearGradient>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <View className="flex-row gap-3">
      <View className="w-8 h-8 bg-white/20 rounded-lg items-center justify-center mt-1">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-white text-base font-semibold mb-1">{title}</Text>
        <Text className="text-emerald-100 text-sm leading-[18px]">
          {description}
        </Text>
      </View>
    </View>
  );
}

// ✅ Form section
function FormSection({
  isDesktop,
  selectedRole,
  setSelectedRole,
  email,
  setEmail,
  password,
  setPassword,
  isLoggingIn,
  handleLogin,
  handleGoogleLogin,
  handleBackToRoles,
  router,
}: any) {
  return (
    <View className={`p-8 ${isDesktop ? "justify-center min-h-screen" : ""}`}>
      {/* Role Header */}
      {selectedRole && (
        <TouchableOpacity onPress={handleBackToRoles} className="mb-6">
          <LinearGradient
            colors={["#f3f4f6", "#e5e7eb"]}
            className="flex-row items-center p-3 rounded-lg gap-3 border border-gray-200"
          >
            <View
              className="w-8 h-8 rounded-md items-center justify-center"
              style={{
                backgroundColor:
                  roles.find((r) => r.id === selectedRole)?.bgColor ||
                  "#22c55e",
              }}
            >
              {(() => {
                const Icon = roles.find((r) => r.id === selectedRole)?.icon;
                return Icon ? <Icon color="#fff" size={16} /> : null;
              })()}
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-[11px]">Signing in as</Text>
              <Text className="text-gray-900 text-sm font-semibold">
                {roles.find((r) => r.id === selectedRole)?.label}
              </Text>
            </View>
            <ChevronRight
              color="#9ca3af"
              size={16}
              style={{ transform: [{ rotate: "90deg" }] }}
            />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Title */}
      <View className="mb-8">
        <Text className="text-gray-900 text-3xl font-bold mb-2">
          Welcome Back
        </Text>
        <Text className="text-gray-600 text-sm">
          {selectedRole
            ? "Enter your credentials to access your account"
            : "Select your role to continue"}
        </Text>
      </View>

      {/* Role Select or Inputs */}
      {!selectedRole && isDesktop ? (
        <View className="gap-4">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <TouchableOpacity
                key={role.id}
                onPress={() => setSelectedRole(role.id)}
                className="flex-row items-center p-4 rounded-xl border-2 border-gray-200 bg-white gap-4 active:border-emerald-600"
              >
                <View
                  className="w-12 h-12 rounded-lg items-center justify-center"
                  style={{ backgroundColor: role.bgColor }}
                >
                  <Icon color="#fff" size={24} />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 text-base font-semibold mb-0.5">
                    {role.label}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    {role.description}
                  </Text>
                </View>
                <ChevronRight color="#9ca3af" size={20} />
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <AuthForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          isLoggingIn={isLoggingIn}
          handleLogin={handleLogin}
          handleGoogleLogin={handleGoogleLogin}
          router={router}
        />
      )}
    </View>
  );
}

function AuthForm({
  email,
  setEmail,
  password,
  setPassword,
  isLoggingIn,
  handleLogin,
  handleGoogleLogin,
  router,
}: any) {
  return (
    <View className="gap-6">
      {/* Email */}
      <InputField
        label="Email Address"
        placeholder="Enter your email"
        icon={<Mail color="#9ca3af" size={20} />}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      {/* Password */}
      <InputField
        label="Password"
        placeholder="Enter your password"
        icon={<Lock color="#9ca3af" size={20} />}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity className="self-end -mt-4">
        <Text className="text-emerald-600 text-sm font-medium">
          Forgot password?
        </Text>
      </TouchableOpacity>

      <SubmitButton onPress={handleLogin} loading={isLoggingIn} />

      <Divider label="Or continue with" />

      <GoogleButton onPress={handleGoogleLogin} />

      <View className="flex-row justify-center items-center">
        <Text className="text-gray-600 text-sm">
          Don&apos;t have an account?{" "}
        </Text>
        <TouchableOpacity onPress={() => router.push("/role-select")}>
          <Text className="text-emerald-600 text-sm font-semibold">
            Register here
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Small UI helpers
function InputField({ label, icon, ...props }: any) {
  return (
    <View className="gap-2">
      <Text className="text-gray-700 text-sm font-semibold">{label}</Text>
      <View className="flex-row items-center border border-gray-300 rounded-lg bg-white">
        <View className="ml-3">{icon}</View>
        <TextInput
          className="flex-1 h-12 px-3 text-gray-900 text-[15px]"
          placeholderTextColor="#9ca3af"
          {...props}
        />
      </View>
    </View>
  );
}

function SubmitButton({ onPress, loading }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      className="rounded-lg overflow-hidden"
    >
      <LinearGradient
        colors={["#059669", "#10b981"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="h-12 items-center justify-center"
      >
        <Text className="text-white text-[15px] font-semibold">
          {loading ? "Signing In..." : "Sign In"}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="flex-1 h-[1px] bg-gray-200" />
      <Text className="text-gray-500 text-[11px] uppercase">{label}</Text>
      <View className="flex-1 h-[1px] bg-gray-200" />
    </View>
  );
}

function GoogleButton({ onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-center h-12 rounded-lg border border-gray-300 bg-white gap-2"
    >
      <View className="w-5 h-5 items-center justify-center">
        <Text className="text-[#4285F4] text-base font-bold">G</Text>
      </View>
      <Text className="text-gray-900 text-[15px] font-medium">
        Sign in with Google
      </Text>
    </TouchableOpacity>
  );
}

// ✅ Main Login Screen
export default function LoginScreen() {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { login, isLoggingIn } = useAuth();

  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && (width === 0 ? true : width >= 768);

  const handleLogin = async () => {
    try {
      await login({ email, password });
      router.push(isWeb ? "/home" : "/dashboard/farmer");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleGoogleLogin = async () => {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    const redirect = AuthSession.makeRedirectUri({ scheme: "dashboard" });
    const state = JSON.stringify({
      redirect,
      platform: isWeb ? "web" : "expo",
    });
    const url = `${apiUrl}/auth/google?state=${encodeURIComponent(state)}`;

    if (isWeb) {
      window.location.href = url;
    } else {
      const result = await WebBrowser.openAuthSessionAsync(url, redirect);
      if (result.type === "success" && result.url) {
        const token = new URL(result.url).searchParams.get("token");
        console.log("Google login success, token:", token);
      }
    }
  };

  const formProps = {
    isDesktop,
    selectedRole,
    setSelectedRole,
    email,
    setEmail,
    password,
    setPassword,
    isLoggingIn,
    handleLogin,
    handleGoogleLogin,
    handleBackToRoles: () => {
      setSelectedRole(null);
      setEmail("");
      setPassword("");
    },
    router,
  };

  return (
    <View className="flex-1 flex-row bg-gray-50">
      {isDesktop && (
        <View className="w-2/5">
          <BrandingSection />
        </View>
      )}
      <ScrollView className="flex-1 bg-gray-50">
        <FormSection {...formProps} />
      </ScrollView>
    </View>
  );
}
