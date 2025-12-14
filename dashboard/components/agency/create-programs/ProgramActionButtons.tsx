import { TouchableOpacity, View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CheckCircle } from "lucide-react-native";

interface Props {
  onPublish: () => void;
  onSaveDraft: () => void;
  isSubmitting: boolean;
  isSavingDraft: boolean;
}

export function ProgramActionButtons({
  onPublish,
  onSaveDraft,
  isSubmitting,
  isSavingDraft,
}: Props) {
  return (
    <View className="gap-3">
      <TouchableOpacity
        className="rounded-lg border border-orange-200 bg-orange-50"
        onPress={onSaveDraft}
        disabled={isSavingDraft || isSubmitting}
        style={{ opacity: isSavingDraft || isSubmitting ? 0.7 : 1 }}
      >
        <View className="flex-row items-center justify-center gap-2 py-3">
          <Text className="text-orange-700 text-[15px] font-bold">
            Save as Draft
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        className="rounded-lg overflow-hidden"
        onPress={onPublish}
        disabled={isSubmitting}
        style={{ opacity: isSubmitting ? 0.7 : 1 }}
      >
        <LinearGradient
          colors={["#22c55e", "#15803d"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex-row items-center justify-center gap-2 py-3"
        >
          <CheckCircle color="#fff" size={20} />
          <Text className="text-white text-[15px] font-bold">
            Publish Program
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

export default ProgramActionButtons;
