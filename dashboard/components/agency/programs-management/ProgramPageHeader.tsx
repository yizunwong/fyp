import { type FC } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Archive, Plus } from "lucide-react-native";

type ProgramPageHeaderProps = {
  onCreateProgram: () => void;
  onPressArchived?: () => void;
};

export const ProgramPageHeader: FC<ProgramPageHeaderProps> = ({
  onCreateProgram,
  onPressArchived,
}) => {
  return (
    <View className="flex-row items-center justify-between mb-6">
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={onCreateProgram}
          className="flex-row items-center gap-2 px-4 py-2 bg-blue-500 rounded-lg"
        >
          <Plus color="#fff" size={18} />
          <Text className="text-white text-sm font-semibold">
            Create Program
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onPressArchived}
          className="flex-row items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg"
        >
          <Archive color="#6b7280" size={18} />
          <Text className="text-gray-700 text-sm font-semibold">Archived</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
