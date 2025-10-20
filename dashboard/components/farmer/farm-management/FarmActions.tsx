import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import {  Pencil, Trash2 } from "lucide-react-native";
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
    <View className="flex-row flex-wrap gap-2">
      <TouchableOpacity
        onPress={() => onEdit(farm.id)}
        className="flex-row items-center justify-center gap-2 px-4 py-2 rounded-lg border border-emerald-200 bg-emerald-50/60"
      >
        <Pencil color="#047857" size={18} />
        <Text className="text-emerald-700 text-sm font-semibold">Edit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onDelete(farm.id, farm.name)}
        disabled={isDeleting}
        className={`flex-row items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-200 ${
          isDeleting ? "bg-red-50/60 opacity-70" : "bg-white"
        }`}
      >
        {isDeleting ? (
          <ActivityIndicator size="small" color="#b91c1c" />
        ) : (
          <Trash2 color="#b91c1c" size={18} />
        )}
        <Text className="text-red-600 text-sm font-semibold">Delete</Text>
      </TouchableOpacity>
    </View>
  );
}
