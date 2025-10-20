import type { ReactNode } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Plus } from "lucide-react-native";
import MobileHeader from "./MobileHeader";

export interface MobileLayoutProps {
  children: ReactNode;
  onBack: () => void;
  onAddFarm: () => void;
}

export default function MobileLayout({
  children,
  onBack,
  onAddFarm,
}: MobileLayoutProps) {
  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <MobileHeader onBack={onBack} onAddFarm={onAddFarm} />
        {children}
      </ScrollView>
      <TouchableOpacity
        onPress={onAddFarm}
        className="absolute bottom-6 right-6 rounded-full overflow-hidden shadow-lg"
        style={{ elevation: 6 }}
      >
        <LinearGradient
          colors={["#22c55e", "#059669"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="w-14 h-14 items-center justify-center"
        >
          <Plus color="#fff" size={26} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}
