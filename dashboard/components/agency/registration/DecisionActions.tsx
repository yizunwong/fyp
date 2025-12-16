import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { CheckCircle, XCircle } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export function DecisionActions({
  onApprove,
  onReject,
  disabled,
  allDocumentsVerified,
}: {
  onApprove: () => void | Promise<void>;
  onReject: () => void | Promise<void>;
  disabled?: boolean;
  allDocumentsVerified?: boolean;
}) {
  const [notes, setNotes] = useState("");

  return (
    <View className="bg-white rounded-xl border border-gray-200 p-5">
      <Text className="text-gray-900 text-base font-bold mb-3">Officer Decision</Text>
      {allDocumentsVerified === false && (
        <View className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <Text className="text-yellow-800 text-xs font-semibold">
            ⚠️ All documents must be verified before approving the registration
          </Text>
        </View>
      )}
      <View className="flex-row gap-3">
        <TouchableOpacity
          disabled={disabled || allDocumentsVerified === false}
          onPress={onApprove}
          className={`flex-1 rounded-lg overflow-hidden ${
            disabled || allDocumentsVerified === false ? "opacity-60" : ""
          }`}
        >
          <LinearGradient
            colors={["#22c55e", "#15803d"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-row items-center justify-center gap-2 py-3"
          >
            <CheckCircle color="#fff" size={20} />
            <Text className="text-white text-[15px] font-bold">Approve Registration</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={disabled}
          onPress={onReject}
          className={`flex-1 flex-row items-center justify-center gap-2 bg-white border-2 border-red-500 rounded-lg py-3 ${
            disabled ? "opacity-60" : ""
          }`}
        >
          <XCircle color="#dc2626" size={20} />
          <Text className="text-red-600 text-[15px] font-bold">Reject Registration</Text>
        </TouchableOpacity>
      </View>

      <View className="mt-4">
        <Text className="text-gray-600 text-xs mb-1">Internal Notes</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Add internal notes about this registration..."
          multiline
          numberOfLines={3}
          className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
          placeholderTextColor="#9ca3af"
          style={{ textAlignVertical: "top" }}
        />
      </View>
    </View>
  );
}
