import { LinearGradient } from "expo-linear-gradient";
import { Text, TouchableOpacity, View } from "react-native";

export type ViewMode = "farm" | "all";

type ProduceViewToggleProps = {
  activeView: ViewMode;
  onChange: (view: ViewMode) => void;
};

export default function ProduceViewToggle({
  activeView,
  onChange,
}: ProduceViewToggleProps) {
  return (
    <View className="bg-white border border-emerald-100 rounded-full p-1 flex-row gap-2 shadow-sm">
      <TouchableOpacity
        onPress={() => onChange("farm")}
        className="flex-1 rounded-full"
        activeOpacity={0.9}
      >
        {activeView === "farm" ? (
          <LinearGradient
            colors={["#22c55e", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-row items-center justify-center gap-2 rounded-full px-4 py-2 shadow"
          >
            <Text className="text-white text-base">{"\uD83C\uDF3E"}</Text>
            <Text className="text-white text-sm font-semibold">By Farm</Text>
          </LinearGradient>
        ) : (
          <View className="flex-row items-center justify-center gap-2 rounded-full px-4 py-2 bg-white border border-emerald-100 shadow-sm">
            <Text className="text-base">{"\uD83C\uDF3E"}</Text>
            <Text className="text-gray-600 text-sm font-semibold">
              By Farm
            </Text>
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onChange("all")}
        className="flex-1 rounded-full"
        activeOpacity={0.9}
      >
        {activeView === "all" ? (
          <LinearGradient
            colors={["#22c55e", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-row items-center justify-center gap-2 rounded-full px-4 py-2 shadow"
          >
            <Text className="text-white text-base">{"\uD83C\uDF45"}</Text>
            <Text className="text-white text-sm font-semibold">
              All Produce
            </Text>
          </LinearGradient>
        ) : (
          <View className="flex-row items-center justify-center gap-2 rounded-full px-4 py-2 bg-white border border-emerald-100 shadow-sm">
            <Text className="text-base">{"\uD83C\uDF45"}</Text>
            <Text className="text-gray-600 text-sm font-semibold">
              All Produce
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
