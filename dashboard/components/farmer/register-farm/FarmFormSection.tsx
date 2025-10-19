import { View, Text } from "react-native";
import { Warehouse } from "lucide-react-native";
import FarmForm, { type FarmFormProps } from "./FarmForm";

export default function FarmFormSection(props: FarmFormProps) {
  return (
    <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
      <View className="flex-row items-center gap-3 mb-6">
        <View className="w-12 h-12 bg-emerald-50 rounded-xl items-center justify-center">
          <Warehouse color="#059669" size={24} />
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 text-xl font-semibold">Farm Details</Text>
          <Text className="text-gray-500 text-sm">
            Provide the details for this farm registration
          </Text>
        </View>
      </View>

      <FarmForm {...props} />
    </View>
  );
}
