import { Text, View } from "react-native";

export function FarmRegistrationTableHeader() {
  return (
    <View className="flex-row border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-t-xl">
      <Text className="flex-1 text-gray-600 dark:text-gray-400 text-xs font-semibold">Farm</Text>
      <Text className="flex-1 text-gray-600 dark:text-gray-400 text-xs font-semibold">Farmer</Text>
      <Text className="w-40 text-gray-600 dark:text-gray-400 text-xs font-semibold">Location</Text>
      <Text className="w-24 text-gray-600 dark:text-gray-400 text-xs font-semibold">Size</Text>
      <Text className="w-40 text-gray-600 dark:text-gray-400 text-xs font-semibold">Produce Categories</Text>
      <Text className="w-28 text-gray-600 dark:text-gray-400 text-xs font-semibold">Status</Text>
      <Text className="w-24 text-gray-600 dark:text-gray-400 text-xs font-semibold">Action</Text>
    </View>
  );
}
