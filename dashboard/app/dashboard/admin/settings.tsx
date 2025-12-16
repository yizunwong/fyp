import React from "react";
import { View, Text, ScrollView } from "react-native";

export default function AdminSettingsScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-6 py-6">
        <Text className="text-gray-900 text-2xl font-bold mb-2">Admin Settings</Text>
        <Text className="text-gray-600 text-base mb-6">
          Configure system settings and preferences
        </Text>

        <View className="bg-white rounded-xl p-4 border border-gray-200">
          <Text className="text-gray-900 text-lg font-semibold mb-2">
            Settings Coming Soon
          </Text>
          <Text className="text-gray-600 text-sm">
            System configuration options will be available here.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

