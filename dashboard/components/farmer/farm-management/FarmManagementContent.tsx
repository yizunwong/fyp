import { View } from "react-native";
import type { FarmerControllerFindFarms200AllOf } from "@/api";
import FarmCards from "./FarmCards";
import FarmTable from "./FarmTable";
import { Sprout } from 'lucide-react-native';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';

export interface FarmManagementContentProps {
  isDesktop: boolean;
  farms?: FarmerControllerFindFarms200AllOf;
  isLoading: boolean;
  errorMessage?: string | null;
  pendingDeleteId: string | null;
  onEdit: (farmId: string) => void;
  onDelete: (farmId: string, farmName: string) => void;
  onAddFarm: () => void;
  formatSize: (value: number | null) => string;
  onRetry: () => void;
}

export default function FarmManagementContent({
  isDesktop,
  farms,
  isLoading,
  errorMessage,
  pendingDeleteId,
  onEdit,
  onDelete,
  onAddFarm,
  formatSize,
  onRetry,
}: FarmManagementContentProps) {
  const hasFarms = (farms?.data?.length ?? 0) > 0;
  return (
    <View className="px-6 py-6">
      {errorMessage ? (
        <ErrorState
          message={
            errorMessage || "Failed to load farms. Please try again later."
          }
          onRetry={onRetry}
        />
      ) : null}

      {isLoading ? (
        <LoadingState message="Loading your farms..." />
      ) : hasFarms ? (
        isDesktop ? (
          <FarmTable
            farms={farms!}
            pendingDeleteId={pendingDeleteId}
            onEdit={onEdit}
            onDelete={onDelete}
            formatSize={formatSize}
          />
        ) : (
          <FarmCards
            farms={farms!}
            pendingDeleteId={pendingDeleteId}
            onEdit={onEdit}
            onDelete={onDelete}
            formatSize={formatSize}
          />
        )
      ) : (
        <EmptyState
          title="No Farms Found"
          subtitle="Add your first farm to start managing produce batches and subsidy requests from one place."
          icon={<Sprout color="#047857" size={28} />}
          actionLabel="Add Farn"
          onActionPress={onAddFarm}
        />
      )}
    </View>
  );
}
