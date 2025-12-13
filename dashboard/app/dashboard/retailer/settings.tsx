import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Store, MapPin, Save } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { useAppLayout } from "@/components/layout/AppLayoutContext";
import useAuth from "@/hooks/useAuth";

export default function RetailerSettingsScreen() {
  const { setupProfile, isSettingUpProfile } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");

  useAppLayout({
    title: "Settings",
    subtitle: "Set up your retailer profile",
  });

  const handleSave = async () => {
    if (!companyName.trim() || !businessAddress.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing information",
        text2: "Company name and business address are required",
      });
      return;
    }

    try {
      await setupProfile({
        companyName: companyName.trim(),
        businessAddress: businessAddress.trim(),
      });
      Toast.show({
        type: "success",
        text1: "Profile saved",
        text2: "Retailer profile has been set up",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Failed to save",
        text2: error?.message || "Could not save profile",
      });
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
      <View className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <View className="flex-row items-center gap-3 mb-4">
          <View className="w-10 h-10 rounded-full bg-orange-50 items-center justify-center">
            <Store color="#ea580c" size={20} />
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 text-lg font-bold">Retailer Profile</Text>
            <Text className="text-gray-600 text-sm">
              Provide your business details to access retailer features
            </Text>
          </View>
        </View>

        <View className="gap-3">
          <View>
            <Text className="text-gray-700 text-sm font-semibold mb-2">
              Company Name
            </Text>
            <TextInput
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="Enter your company name"
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-base"
              placeholderTextColor="#9ca3af"
              autoCapitalize="words"
            />
          </View>

          <View>
            <Text className="text-gray-700 text-sm font-semibold mb-2">
              Business Address
            </Text>
            <TextInput
              value={businessAddress}
              onChangeText={setBusinessAddress}
              placeholder="Enter your business address"
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-base"
              placeholderTextColor="#9ca3af"
              autoCapitalize="sentences"
              multiline
            />
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={isSettingUpProfile}
            className={`rounded-lg overflow-hidden ${
              isSettingUpProfile ? "opacity-50" : ""
            }`}
          >
            <View className="flex-row items-center justify-center gap-2 bg-orange-600 py-3 rounded-lg">
              <Save color="#fff" size={18} />
              <Text className="text-white text-sm font-semibold">
                {isSettingUpProfile ? "Saving..." : "Save Profile"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
