import { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { X, Search, Package } from "lucide-react-native";
import Toast from "react-native-toast-message";
import type { ProduceListResponseDto, UserResponseDto } from "@/api";
import { useAssignRetailerMutation } from "@/hooks/useProduce";
import { useUserControllerFindAll } from "@/api";

interface AssignRetailerModalProps {
  visible: boolean;
  onClose: () => void;
  batch: ProduceListResponseDto | null;
  onSuccess?: () => void;
}

export default function AssignRetailerModal({
  visible,
  onClose,
  batch,
  onSuccess,
}: AssignRetailerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRetailerId, setSelectedRetailerId] = useState<string | null>(
    null
  );

  const { data: usersResponse, isLoading: isLoadingRetailers } =
    useUserControllerFindAll();

  const retailers = useMemo(() => {
    if (!usersResponse?.data) return [];
    return usersResponse.data.filter((user) => user.role === "RETAILER");
  }, [usersResponse]);

  const filteredRetailers = useMemo(() => {
    if (!searchQuery.trim()) return retailers;
    const query = searchQuery.toLowerCase();
    return retailers.filter(
      (retailer) =>
        retailer.username?.toLowerCase().includes(query) ||
        retailer.email?.toLowerCase().includes(query)
    );
  }, [retailers, searchQuery]);

  const assignMutation = useAssignRetailerMutation();

  const handleAssign = async () => {
    if (!batch || !selectedRetailerId) return;

    try {
      await assignMutation.assignRetailer(batch.id, {
        retailerId: selectedRetailerId,
      });

      Toast.show({
        type: "success",
        text1: "Batch Assigned",
        text2: "The batch has been successfully assigned to the retailer",
      });

      setSelectedRetailerId(null);
      setSearchQuery("");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Assignment Failed",
        text2:
          assignMutation.error ||
          error?.message ||
          "Failed to assign batch to retailer",
      });
    }
  };

  const selectedRetailer = useMemo(() => {
    if (!selectedRetailerId) return null;
    return retailers.find((r) => r.id === selectedRetailerId);
  }, [selectedRetailerId, retailers]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
            <Text className="text-gray-900 text-lg font-bold">
              Assign Batch to Retailer
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
            >
              <X color="#6b7280" size={20} />
            </TouchableOpacity>
          </View>

          <View className="p-6">
            {batch && (
              <View className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Text className="text-gray-600 text-xs mb-1">Batch</Text>
                <Text className="text-gray-900 text-sm font-semibold">
                  {batch.name} ({batch.batchId})
                </Text>
              </View>
            )}

            <View className="mb-4">
              <Text className="text-gray-700 text-sm font-semibold mb-2">
                Search Retailers
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-300 rounded-lg px-4 py-3">
                <Search color="#6b7280" size={18} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search by name or email..."
                  placeholderTextColor="#9ca3af"
                  className="flex-1 ml-3 text-gray-900 text-sm"
                />
              </View>
            </View>

            {isLoadingRetailers ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="large" color="#047857" />
                <Text className="text-gray-500 text-sm mt-2">
                  Loading retailers...
                </Text>
              </View>
            ) : filteredRetailers.length === 0 ? (
              <View className="py-8 items-center">
                <Package color="#9ca3af" size={32} />
                <Text className="text-gray-500 text-sm mt-2">
                  {searchQuery
                    ? "No retailers found matching your search"
                    : "No retailers available"}
                </Text>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 300 }} className="mb-4">
                {filteredRetailers.map((retailer) => {
                  const isSelected = selectedRetailerId === retailer.id;
                  return (
                    <TouchableOpacity
                      key={retailer.id}
                      onPress={() => setSelectedRetailerId(retailer.id)}
                      className={`p-4 mb-2 rounded-lg border ${
                        isSelected
                          ? "bg-emerald-50 border-emerald-500"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <View className="flex-row items-center gap-3">
                        <View
                          className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-500"
                              : "border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <View className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </View>
                        <View className="flex-1">
                          <Text
                            className={`text-sm font-semibold ${
                              isSelected ? "text-emerald-900" : "text-gray-900"
                            }`}
                          >
                            {retailer.username || "Unknown"}
                          </Text>
                          <Text
                            className={`text-xs mt-0.5 ${
                              isSelected ? "text-emerald-700" : "text-gray-500"
                            }`}
                          >
                            {retailer.email}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {selectedRetailer && (
              <View className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <Text className="text-emerald-800 text-xs font-semibold mb-1">
                  Selected Retailer
                </Text>
                <Text className="text-emerald-900 text-sm font-medium">
                  {selectedRetailer.username}
                </Text>
                <Text className="text-emerald-700 text-xs">
                  {selectedRetailer.email}
                </Text>
              </View>
            )}

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 items-center justify-center bg-gray-100 border border-gray-300 rounded-lg py-3"
              >
                <Text className="text-gray-700 text-sm font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAssign}
                disabled={!selectedRetailerId || assignMutation.isPending}
                className={`flex-1 items-center justify-center bg-emerald-600 rounded-lg py-3 ${
                  !selectedRetailerId || assignMutation.isPending
                    ? "opacity-50"
                    : ""
                }`}
              >
                {assignMutation.isPending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white text-sm font-semibold">
                    Assign Batch
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
