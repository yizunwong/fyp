import { Text, View } from "react-native";

export interface FarmCategoryBadgesProps {
  categories: string[];
}

export default function FarmCategoryBadges({
  categories,
}: FarmCategoryBadgesProps) {
  if (!categories.length) {
    return (
      <View className="px-2 py-1 rounded-full bg-gray-100">
        <Text className="text-gray-500 text-xs font-medium">No categories yet</Text>
      </View>
    );
  }

  return (
    <View className="flex-row flex-wrap gap-2">
      {categories.map((category) => (
        <View
          key={category}
          className="px-2 py-1 rounded-full bg-emerald-50 border border-emerald-100"
        >
          <Text className="text-emerald-700 text-xs font-medium">{category}</Text>
        </View>
      ))}
    </View>
  );
}
