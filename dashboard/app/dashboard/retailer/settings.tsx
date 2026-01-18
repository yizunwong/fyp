import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Store, Save, LogOut } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { useAppLayout } from "@/components/layout/AppLayoutContext";
import useAuth from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserManagement";
import { useSession } from "@/contexts/SessionContext";
import { useRouter } from "expo-router";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

export default function RetailerSettingsScreen() {
  const { updateProfile, isUpdatingProfile } = useAuth();
  const { profile, isLoading: isProfileLoading } = useUserProfile();
  const { signOut } = useSession();
  const router = useRouter();
  const { isMobile } = useResponsiveLayout();
  const [companyName, setCompanyName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useAppLayout({
    title: "Settings",
    subtitle: "Update your retailer profile",
  });

  useEffect(() => {
    if (profile?.retailer) {
      setCompanyName(profile.retailer.companyName);
      setBusinessAddress(profile.retailer.businessAddress);
    }
  }, [profile?.retailer]);

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
      await updateProfile({
        companyName: companyName.trim(),
        businessAddress: businessAddress.trim(),
      });
      Toast.show({
        type: "success",
        text1: "Profile saved",
        text2: "Retailer profile has been updated",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Failed to save",
        text2: error?.message || "Could not save profile",
      });
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      router.replace("/home");
      Toast.show({
        type: "success",
        text1: "Logged out",
        text2: "See you soon!",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Logout failed",
        text2: "Please try again.",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      contentContainerStyle={{ padding: 16 }}
    >
      <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <View className="flex-row items-center gap-3 mb-4">
          <View className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/30 items-center justify-center">
            <Store color="#ea580c" size={20} />
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 dark:text-gray-100 text-lg font-bold">
              Retailer Profile
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              Provide your business details to access retailer features
            </Text>
          </View>
        </View>

        <View className="gap-3">
          <View>
            <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
              Company Name
            </Text>
            <TextInput
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="Enter your company name"
              className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100 text-base"
              placeholderTextColor="#9ca3af"
              autoCapitalize="words"
            />
          </View>

          <View>
            <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
              Business Address
            </Text>
            <TextInput
              value={businessAddress}
              onChangeText={setBusinessAddress}
              placeholder="Enter your business address"
              className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100 text-base"
              placeholderTextColor="#9ca3af"
              autoCapitalize="sentences"
              multiline
            />
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={isUpdatingProfile || isProfileLoading}
            className={`rounded-lg overflow-hidden ${
              isUpdatingProfile || isProfileLoading ? "opacity-50" : ""
            }`}
          >
            <View className="flex-row items-center justify-center gap-2 bg-orange-600 py-3 rounded-lg">
              <Save color="#fff" size={18} />
              <Text className="text-white text-sm font-semibold">
                {isProfileLoading
                  ? "Loading..."
                  : isUpdatingProfile
                  ? "Saving..."
                  : "Save Profile"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout Button - Mobile Only */}
        {isMobile && (
          <View className="bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-900/30 p-5 shadow-sm mt-4">
            <TouchableOpacity
              className="flex-row items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3"
              onPress={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <LogOut color="#fff" size={18} />
                  <Text className="text-white font-semibold text-base">
                    Logout
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
