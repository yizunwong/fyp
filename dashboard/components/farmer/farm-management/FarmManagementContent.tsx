import { ActivityIndicator, Text, View } from "react-native";
import type { FarmerControllerFindFarms200AllOf } from "@/api";
import FarmCards from "./FarmCards";
import FarmEmptyState from "./FarmEmptyState";
import FarmTable from "./FarmTable";

export interface FarmManagementContentProps {
  isDesktop: boolean;
  farms?: FarmerControllerFindFarms200AllOf;
  isLoading: boolean;
  errorMessage?: string | null;
  pendingDeleteId: string | null;
  onManageProduce: (farmId: string) => void;
  onEdit: (farmId: string) => void;
  onDelete: (farmId: string, farmName: string) => void;
  onAddFarm: () => void;
  formatSize: (value: number | null) => string;
}

export default function FarmManagementContent({
  isDesktop,
  farms,
  isLoading,
  errorMessage,
  pendingDeleteId,
  onManageProduce,
  onEdit,
  onDelete,
  onAddFarm,
  formatSize,
}: FarmManagementContentProps) {
  const hasFarms = (farms?.data?.length ?? 0) > 0;

  return (
    <View className="px-6 py-6">
      {errorMessage ? (
        <View className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          <Text className="text-red-600 text-sm font-medium">{errorMessage}</Text>
        </View>
      ) : null}

      {isLoading ? (
        <View className="items-center justify-center py-20">
          <ActivityIndicator size="large" color="#059669" />
          <Text className="text-gray-500 text-sm mt-3">Loading your farms...</Text>
        </View>
      ) : hasFarms ? (
        isDesktop ? (
          <FarmTable
            farms={farms!}
            pendingDeleteId={pendingDeleteId}
            onManageProduce={onManageProduce}
            onEdit={onEdit}
            onDelete={onDelete}
            formatSize={formatSize}
          />
        ) : (
          <FarmCards
            farms={farms!}
            pendingDeleteId={pendingDeleteId}
            onManageProduce={onManageProduce}
            onEdit={onEdit}
            onDelete={onDelete}
            formatSize={formatSize}
          />
        )
      ) : (
        <FarmEmptyState onAddFarm={onAddFarm} />
      )}
    </View>
  );
}
