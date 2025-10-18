import { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Sprout, TrendingUp, Shield } from "lucide-react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: 1,
    icon: Sprout,
    title: "Track Crops",
    description:
      "Monitor your agricultural products from seed to harvest with real-time updates",
    gradientColors: ["#22c55e", "#10b981"] as const,
  },
  {
    id: 2,
    icon: TrendingUp,
    title: "Manage Supply Chain",
    description:
      "Streamline distribution and logistics across your entire agricultural network",
    gradientColors: ["#3b82f6", "#06b6d4"] as const,
  },
  {
    id: 3,
    icon: Shield,
    title: "Build Trust with Blockchain",
    description:
      "Ensure transparency and security with immutable blockchain technology",
    gradientColors: ["#059669", "#14b8a6"] as const,
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slideIndex);
  };

  const goToNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: width * (currentSlide + 1),
        animated: true,
      });
    }
  };

  const handleGetStarted = () => {
    router.push("/register");
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {slides.map((slide, index) => {
          const Icon = slide.icon;
          return (
            <View
              key={slide.id}
              style={{ width }}
              className="flex-1 items-center justify-center p-8"
            >
              <View className="items-center mb-12">
                <LinearGradient
                  colors={slide.gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="w-32 h-32 rounded-full items-center justify-center mb-8"
                >
                  <Icon color="#fff" size={64} />
                </LinearGradient>

                <Text className="text-gray-900 text-3xl font-bold text-center mb-4">
                  {slide.title}
                </Text>
                <Text className="text-gray-600 text-base text-center leading-6 px-4">
                  {slide.description}
                </Text>
              </View>

              {index === slides.length - 1 && (
                <View className="w-full px-8">
                  <TouchableOpacity
                    onPress={handleGetStarted}
                    className="rounded-xl overflow-hidden"
                  >
                    <LinearGradient
                      colors={["#059669", "#10b981"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="h-14 items-center justify-center"
                    >
                      <Text className="text-white text-base font-semibold">
                        Get Started
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View className="absolute bottom-32 left-0 right-0 flex-row justify-center items-center gap-2">
        {slides.map((_, index) => (
          <View
            key={index}
            className={
              index === currentSlide
                ? "w-8 h-2 rounded-full bg-emerald-600"
                : "w-2 h-2 rounded-full bg-gray-300"
            }
          />
        ))}
      </View>

      {currentSlide < slides.length - 1 && (
        <View className="absolute bottom-8 right-8">
          <TouchableOpacity
            onPress={goToNextSlide}
            className="bg-emerald-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white text-sm font-semibold">Next</Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="absolute top-8 right-8">
        <TouchableOpacity onPress={handleGetStarted} className="px-4 py-2">
          <Text className="text-gray-600 text-sm font-medium">Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
