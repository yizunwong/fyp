import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Pencil, Trash2 } from "lucide-react-native";
import type { FarmListRespondDto } from "@/api";

export interface FarmActionsProps {
  farm: FarmListRespondDto;
  isDeleting: boolean;
  onEdit: (farmId: string) => void;
  onDelete: (farmId: string, farmName: string) => void;
}

export default function FarmActions({
  farm,
  isDeleting,
  onEdit,
  onDelete,
}: FarmActionsProps) {


  return (
    <View className="flex-col gap-2">
      {/* EDIT */}
      <TouchableOpacity
        onPress={() => onEdit(farm.id)}
        className={`flex-row items-center justify-center gap-2 px-3 py-2 rounded-lg border border-emerald-200 bg-emerald-50`}
        activeOpacity={0.85}
      >
        <Pencil color="#059669" size={16} />
        <Text className={`text-xs font-semibold text-emerald-700`}>Edit</Text>
      </TouchableOpacity>

      {/* DELETE */}
      <TouchableOpacity
        onPress={() => onDelete(farm.id, farm.name)}
        disabled={isDeleting}
        className={`flex-row items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-200 bg-red-50`}
        activeOpacity={0.85}
      >
        {isDeleting ? (
          <ActivityIndicator size="small" color="#b91c1c" />
        ) : (
          <Trash2 color="#b91c1c" size={16} />
        )}
        <Text className={`text-xs font-semibold text-red-600`}>
          Delete
        </Text>
      </TouchableOpacity>
    </View>
  );
}
