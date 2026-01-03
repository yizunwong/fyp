import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Sprout,
  Store,
  Building2,
  Shield,
  DollarSign,
  QrCode,
  CheckCircle,
  TrendingUp,
} from "lucide-react-native";

export default function HomePage() {
  const router = useRouter();

  const scrollToAbout = () => {
    if (Platform.OS === "web") {
      const element = document.getElementById("about");
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const Navbar = () => (
    <View className="bg-white border-b border-gray-200 w-full">
      <View className="flex-row items-center justify-between px-8 py-4 w-full">
        {/* Logo left */}
        <View className="flex-row items-center gap-2">
          <View className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl items-center justify-center">
            <Sprout color="#fff" size={22} />
          </View>
          <Text className="text-gray-900 text-xl font-bold">HarvestChain</Text>
        </View>

        {/* Nav Links center */}
        <View className="flex-row items-center gap-10">
          <TouchableOpacity onPress={() => router.push("/home")}>
            <Text className="text-emerald-600 text-[16px] font-semibold">
              Home
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={scrollToAbout}>
            <Text className="text-gray-700 text-[16px] font-medium hover:text-emerald-600">
              About
            </Text>
          </TouchableOpacity>
        </View>

        {/* Buttons right */}
        <View className="flex-row items-center gap-4">
          {/* Login button (outlined) */}
          <TouchableOpacity
            onPress={() => router.push("/login")}
            className="rounded-full border-2 border-emerald-600 px-6 py-2.5"
          >
            <Text className="text-emerald-600 text-[16px] font-semibold">
              Login
            </Text>
          </TouchableOpacity>

          {/* Get Started button (filled gradient) */}
          <TouchableOpacity
            onPress={() => router.push("/register")}
            className="rounded-full overflow-hidden"
          >
            <LinearGradient
              colors={["#22c55e", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="px-6 py-2.5"
            >
              <Text className="text-white text-[16px] font-semibold">
                Get Started
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const HeroBanner = () => (
    <LinearGradient
      colors={["#22c55e", "#059669"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="py-24"
    >
      <View className="max-w-6xl mx-auto px-6">
        <View className="items-center text-center">
          <View className="flex-row items-center gap-2 mb-4">
            <Shield color="#fff" size={24} />
            <Text className="text-white/90 text-sm font-semibold tracking-wide uppercase">
              Blockchain Powered
            </Text>
          </View>
          <Text className="text-white text-5xl font-bold mb-6 leading-tight">
            Transparent Agricultural{"\n"}Supply Chain
          </Text>
          <Text className="text-white/90 text-xl mb-10 max-w-3xl leading-relaxed">
            Track every step from farm to table with blockchain technology.
            Ensure quality, authenticity, and fair pricing for all stakeholders.
          </Text>
          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={() => router.push("/register")}
              className="bg-white rounded-full px-8 py-3 shadow-lg"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
              }}
            >
              <Text className="text-green-600 text-base font-semibold">
                Get Started
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={scrollToAbout}
              className="border-2 border-white rounded-full px-8 py-3"
            >
              <Text className="text-white text-base font-semibold">
                Learn More
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const Overview = () => (
    <View id="about" className="py-20 bg-gray-50">
      <View className="max-w-6xl mx-auto px-6">
        <View className="items-center mb-12">
          <Text className="text-emerald-600 text-sm font-semibold tracking-wide uppercase mb-3">
            About the Platform
          </Text>
          <Text className="text-gray-900 text-4xl font-bold mb-4">
            Blockchain Traceability System
          </Text>
          <Text className="text-gray-600 text-lg text-center max-w-3xl leading-relaxed">
            Our platform leverages blockchain technology to create an immutable
            record of agricultural products from harvest to consumer. Every
            transaction, quality check, and movement is permanently recorded,
            ensuring transparency and trust across the entire supply chain.
          </Text>
        </View>
        <View className="flex-row justify-center gap-12 mt-8">
          <View className="items-center">
            <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-3">
              <CheckCircle color="#059669" size={32} />
            </View>
            <Text className="text-gray-900 text-2xl font-bold">100%</Text>
            <Text className="text-gray-600 text-sm">Traceable</Text>
          </View>
          <View className="items-center">
            <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-3">
              <Shield color="#059669" size={32} />
            </View>
            <Text className="text-gray-900 text-2xl font-bold">Secure</Text>
            <Text className="text-gray-600 text-sm">Blockchain</Text>
          </View>
          <View className="items-center">
            <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-3">
              <TrendingUp color="#059669" size={32} />
            </View>
            <Text className="text-gray-900 text-2xl font-bold">Fair</Text>
            <Text className="text-gray-600 text-sm">Pricing</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const RoleHighlights = () => {
    const roles = [
      {
        icon: Sprout,
        title: "Farmers",
        description:
          "Register produce, track batches, and access government subsidies with verified blockchain records.",
        color: "#22c55e",
        bgColor: "#f0fdf4",
      },
      {
        icon: Store,
        title: "Retailers",
        description:
          "Source authentic products, verify quality certificates, and build customer trust with transparent supply chains.",
        color: "#3b82f6",
        bgColor: "#eff6ff",
      },
      {
        icon: Building2,
        title: "Government Agencies",
        description:
          "Monitor food safety, distribute subsidies efficiently, and ensure compliance across the agricultural sector.",
        color: "#8b5cf6",
        bgColor: "#f5f3ff",
      },
    ];

    return (
      <View className="py-20 bg-white">
        <View className="max-w-6xl mx-auto px-6">
          <View className="items-center mb-12">
            <Text className="text-emerald-600 text-sm font-semibold tracking-wide uppercase mb-3">
              For Everyone
            </Text>
            <Text className="text-gray-900 text-4xl font-bold">
              Built for All Stakeholders
            </Text>
          </View>
          <View className="flex-row gap-6">
            {roles.map((role, index) => {
              const Icon = role.icon;
              return (
                <View
                  key={index}
                  className="flex-1 bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-emerald-500 hover:shadow-xl transition-all"
                  style={{ backgroundColor: role.bgColor }}
                >
                  <View
                    className="w-14 h-14 rounded-xl items-center justify-center mb-4"
                    style={{ backgroundColor: `${role.color}20` }}
                  >
                    <Icon color={role.color} size={28} />
                  </View>
                  <Text className="text-gray-900 text-2xl font-bold mb-3">
                    {role.title}
                  </Text>
                  <Text className="text-gray-600 text-[15px] leading-relaxed">
                    {role.description}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  const Workflow = () => (
    <View className="py-20 bg-gray-50">
      <View className="max-w-6xl mx-auto px-6">
        <View className="items-center mb-12">
          <Text className="text-emerald-600 text-sm font-semibold tracking-wide uppercase mb-3">
            How It Works
          </Text>
          <Text className="text-gray-900 text-4xl font-bold">
            Simple & Transparent Workflow
          </Text>
        </View>
        <View className="flex-row items-center justify-center gap-8">
          <View className="items-center">
            <View className="w-20 h-20 bg-emerald-500 rounded-full items-center justify-center mb-4 shadow-lg">
              <Text className="text-5xl">��</Text>
            </View>
            <Text className="text-gray-900 text-lg font-semibold">Harvest</Text>
            <Text className="text-gray-600 text-sm">Farm Production</Text>
          </View>

          <View className="h-0.5 w-16 bg-emerald-300" />

          <View className="items-center">
            <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-4 shadow-lg">
              <Text className="text-5xl">⛓</Text>
            </View>
            <Text className="text-gray-900 text-lg font-semibold">Verify</Text>
            <Text className="text-gray-600 text-sm">Blockchain Record</Text>
          </View>

          <View className="h-0.5 w-16 bg-emerald-300" />

          <View className="items-center">
            <View className="w-20 h-20 bg-purple-500 rounded-full items-center justify-center mb-4 shadow-lg">
              <Text className="text-5xl">🏪</Text>
            </View>
            <Text className="text-gray-900 text-lg font-semibold">
              Distribute
            </Text>
            <Text className="text-gray-600 text-sm">Retail Channel</Text>
          </View>

          <View className="h-0.5 w-16 bg-emerald-300" />

          <View className="items-center">
            <View className="w-20 h-20 bg-orange-500 rounded-full items-center justify-center mb-4 shadow-lg">
              <Text className="text-5xl">👩‍🌾</Text>
            </View>
            <Text className="text-gray-900 text-lg font-semibold">Consume</Text>
            <Text className="text-gray-600 text-sm">End Customer</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const Features = () => {
    const features = [
      {
        icon: Shield,
        title: "Blockchain Security",
        description:
          "Immutable records ensure data integrity and prevent tampering. Every transaction is cryptographically secured.",
      },
      {
        icon: DollarSign,
        title: "Subsidy Management",
        description:
          "Streamlined government subsidy distribution with automated verification and instant approvals.",
      },
      {
        icon: QrCode,
        title: "QR Code Tracking",
        description:
          "Scan any product to view its complete journey from farm to store with real-time updates.",
      },
    ];

    return (
      <View className="py-20 bg-white">
        <View className="max-w-6xl mx-auto px-6">
          <View className="items-center mb-12">
            <Text className="text-emerald-600 text-sm font-semibold tracking-wide uppercase mb-3">
              Platform Features
            </Text>
            <Text className="text-gray-900 text-4xl font-bold">
              Powerful Tools for Modern Agriculture
            </Text>
          </View>
          <View className="flex-row gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <View key={index} className="flex-1">
                  <View className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-200 hover:border-emerald-500 hover:shadow-xl transition-all h-full">
                    <View className="w-16 h-16 bg-emerald-100 rounded-xl items-center justify-center mb-6">
                      <Icon color="#059669" size={32} />
                    </View>
                    <Text className="text-gray-900 text-2xl font-bold mb-4">
                      {feature.title}
                    </Text>
                    <Text className="text-gray-600 text-[15px] leading-relaxed">
                      {feature.description}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  const Footer = () => (
    <View className="bg-gray-900 py-12">
      <View className="max-w-6xl mx-auto px-6">
        <View className="flex-row justify-between items-center border-b border-gray-800 pb-8 mb-8">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl items-center justify-center">
              <Sprout color="#fff" size={24} />
            </View>
            <Text className="text-white text-xl font-bold">HarvestChain</Text>
          </View>
          <View className="flex-row gap-8">
            <TouchableOpacity onPress={() => router.push("/home")}>
              <Text className="text-gray-400 text-sm hover:text-white">
                Home
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={scrollToAbout}>
              <Text className="text-gray-400 text-sm hover:text-white">
                About
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text className="text-gray-400 text-sm hover:text-white">
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text className="text-gray-400 text-sm hover:text-white">
                Get Started
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-500 text-sm">
            © 2025 HarvestChain. All rights reserved.
          </Text>
          <View className="flex-row gap-6">
            <TouchableOpacity>
              <Text className="text-gray-500 text-sm hover:text-gray-300">
                Privacy Program
              </Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text className="text-gray-500 text-sm hover:text-gray-300">
                Terms of Service
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-white">
      <Navbar />
      <HeroBanner />
      <Overview />
      <RoleHighlights />
      <Workflow />
      <Features />
      <Footer />
    </ScrollView>
  );
}
