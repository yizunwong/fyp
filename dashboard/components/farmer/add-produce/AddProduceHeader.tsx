import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

interface AddProduceHeaderProps {
  onBack: () => void;
}

const AddProduceHeader = ({ onBack }: AddProduceHeaderProps) => (
  <LinearGradient
    colors={["#22c55e", "#059669"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    className="px-6 py-6"
  >
    <View className="flex-row items-center gap-4 mb-4">
      <TouchableOpacity
        onPress={onBack}
        className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
      >
        <ArrowLeft color="#fff" size={20} />
      </TouchableOpacity>
      <View className="flex-1">
        <Text className="text-white text-2xl font-bold">
          Add New Produce Batch
        </Text>
        <Text className="text-white/90 text-sm mt-1">
          Register your produce to generate a traceable blockchain record.
        </Text>
      </View>
    </View>
  </LinearGradient>
);

export default AddProduceHeader;
