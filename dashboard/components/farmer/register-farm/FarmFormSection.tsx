import { View, Text } from "react-native";
import { Warehouse } from "lucide-react-native";
import FarmForm, { type FarmFormProps } from "./FarmForm";
import { useColorScheme } from "@/hooks/useColorSheme";

export default function FarmFormSection(props: FarmFormProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#10b981" : "#059669";
  
  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 md:p-8">
      <View className="flex-row items-center gap-3 mb-6">
        <View className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl items-center justify-center border border-emerald-200 dark:border-emerald-700">
          <Warehouse color={iconColor} size={24} />
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 dark:text-gray-100 text-xl font-semibold">Farm Details</Text>
          <Text className="text-gray-500 dark:text-gray-300 text-sm">
            Provide the details for this farm registration
          </Text>
        </View>
      </View>

      <FarmForm {...props} />
    </View>
  );
}
