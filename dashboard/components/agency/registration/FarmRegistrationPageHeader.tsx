import { Text, TouchableOpacity, View } from "react-native";
import { Filter } from "lucide-react-native";

export function FarmRegistrationPageHeader({
  isFetching,
  onRefresh,
}: {
  isFetching?: boolean;
  onRefresh: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between mb-6">
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={onRefresh}
          className="flex-row items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg"
        >
          <Filter color="#6b7280" size={18} />
          <Text className="text-gray-700 text-sm font-semibold">
            {isFetching ? "Refreshing..." : "Refresh"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
