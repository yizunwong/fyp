import { TouchableOpacity, View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Warehouse } from "lucide-react-native";

interface RegisterFarmHeaderProps {
  onBack: () => void;
  title?: string;
  subtitle?: string;
}

export default function RegisterFarmHeader({
  onBack,
  title = "Register New Farm",
  subtitle = "Add your farm details to start tracking produce batches",
}: RegisterFarmHeaderProps) {
  return (
    <LinearGradient
      colors={["#22c55e", "#059669"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="px-6 py-8 pb-14"
    >
      <TouchableOpacity
        onPress={onBack}
        className="flex-row items-center mb-6"
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <ArrowLeft color="#fff" size={24} />
      </TouchableOpacity>
      <View className="flex-row items-center gap-3">
        <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
          <Warehouse color="#fff" size={24} />
        </View>
        <View className="flex-1">
          <Text className="text-white text-2xl font-bold">{title}</Text>
          <Text className="text-white/90 text-sm mt-1">{subtitle}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}
