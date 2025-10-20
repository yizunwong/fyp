import { Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Plus, Sprout } from "lucide-react-native";

export interface MobileHeaderProps {
  onBack: () => void;
  onAddFarm: () => void;
}

export default function MobileHeader({ onBack, onAddFarm }: MobileHeaderProps) {
  return (
    <View className="overflow-hidden">
      <LinearGradient
        colors={["#22c55e", "#059669"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pt-12 pb-10"
      >
        <TouchableOpacity onPress={onBack} className="flex-row items-center mb-6">
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
            <Sprout color="#fff" size={28} />
          </View>
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold">Farm Management</Text>
            <Text className="text-white/90 text-sm mt-1">
              Keep your farms organised and up to date
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={onAddFarm} className="mt-6 rounded-lg overflow-hidden self-start">
          <LinearGradient
            colors={["#fbbf24", "#f59e0b"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-row items-center gap-2 px-5 py-3"
          >
            <Plus color="#fff" size={18} />
            <Text className="text-white text-sm font-semibold">Add New Farm</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}
