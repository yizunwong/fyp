import React, { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export type ViewMode = "farm" | "all";

type ProduceViewToggleProps = {
  activeView: ViewMode;
  onChange: (view: ViewMode) => void;
};

export default function ProduceViewToggle({
  activeView,
  onChange,
}: ProduceViewToggleProps) {
  const slideAnim = useRef(
    new Animated.Value(activeView === "farm" ? 0 : 1)
  ).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeView === "farm" ? 0 : 1,
      useNativeDriver: false,
      speed: 20,
      bounciness: 6,
    }).start();
  }, [activeView]);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View className="bg-white border border-emerald-100 rounded-full p-1 flex-row relative shadow-sm overflow-hidden">
      {/* Sliding Highlight */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: "50%",
          borderRadius: 999,
          transform: [{ translateX }],
        }}
      >
        <LinearGradient
          colors={["#22c55e", "#059669"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1, borderRadius: 999 }}
        />
      </Animated.View>

      {/* Tab Buttons */}
      <TouchableOpacity
        onPress={() => onChange("farm")}
        className="flex-1 rounded-full py-2 items-center justify-center"
        activeOpacity={0.8}
      >
        <Text
          className={`text-sm font-semibold ${
            activeView === "farm" ? "text-white" : "text-gray-600"
          }`}
        >
          🌾 By Farm
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onChange("all")}
        className="flex-1 rounded-full py-2 items-center justify-center"
        activeOpacity={0.8}
      >
        <Text
          className={`text-sm font-semibold ${
            activeView === "all" ? "text-white" : "text-gray-600"
          }`}
        >
          🍅 All Produce
        </Text>
      </TouchableOpacity>
    </View>
  );
}
