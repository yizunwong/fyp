import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import Toast from "react-native-toast-message";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import useFarm, { useFarmsQuery } from "@/hooks/useFarm";
import { FarmManagementContent } from "@/components/farmer/farm-management";
import { parseError } from "@/utils/format-error";
import { formatFarmSize } from "@/utils/farm";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useFarmerLayout } from "@/components/farmer/layout/FarmerLayoutContext";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { RightHeaderButton } from "@/components/ui/RightHeaderButton";

export default function FarmManagementScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsiveLayout();
  const farmsQuery = useFarmsQuery();
  const { deleteFarm } = useFarm();

  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [farmPendingConfirmation, setFarmPendingConfirmation] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const isMutating = farmsQuery.isRefetching || farmsQuery.isFetching;

  const farmsErrorMessage = farmsQuery.error
    ? parseError(farmsQuery.error) || "Failed to load farms."
    : null;

  useEffect(() => {
    if (farmsErrorMessage) {
      Toast.show({
        type: "error",
        text1: "Failed to load farms",
        text2: farmsErrorMessage,
      });
    }
  }, [farmsErrorMessage]);

  const handleAddFarm = useCallback(() => {
    router.push("/dashboard/farmer/register-farm");
  }, [router]);

  const handleEditFarm = (farmId: string) => {
    router.push({
      pathname: "/dashboard/farmer/register-farm",
      params: { farmId },
    });
  };

  const performDelete = async (farmId: string) => {
    try {
      setPendingDelete(farmId);
      await deleteFarm(farmId);
      await farmsQuery.refetch();
    } catch (err) {
      const message = parseError(err) || "Failed to delete farm.";
      Toast.show({
        type: "error",
        text1: "Delete failed",
        text2: message,
      });
    } finally {
      setPendingDelete(null);
    }
  };

  const handleDeleteFarm = (farmId: string, farmName: string) => {
    setFarmPendingConfirmation({ id: farmId, name: farmName });
  };

  const handleCancelDelete = () => {
    setFarmPendingConfirmation(null);
  };

  const handleConfirmDelete = async () => {
    if (!farmPendingConfirmation) return;

    const farmId = farmPendingConfirmation.id;

    try {
      await performDelete(farmId);
    } finally {
      setFarmPendingConfirmation(null);
    }
  };

  const isLoading = farmsQuery.isLoading || isMutating;
  const isConfirmingDelete =
    farmPendingConfirmation != null &&
    pendingDelete === farmPendingConfirmation.id;

  const layoutMeta = useMemo(
    () => ({
      title: "Farm Management",
      subtitle: "Review and maintain your registered farms in one place",
      rightHeaderButton: isDesktop ? (
        <RightHeaderButton
          onPress={handleAddFarm}
          label="Add Farm"
          icon={<Plus />}
        />
      ) : undefined,
      mobile: {
        floatingAction: (
          <FloatingActionButton
            onPress={handleAddFarm}
            icon={<Plus color="#fff" size={18} />}
          />
        ),
      },
    }),
    [handleAddFarm, isDesktop]
  );

  const refetchFarms = useCallback(() => {
    farmsQuery.refetch();
  }, [farmsQuery]);

  useFarmerLayout(layoutMeta);

  return (
    <>
      <FarmManagementContent
        isDesktop={isDesktop}
        farms={farmsQuery.data}
        isLoading={isLoading}
        errorMessage={farmsErrorMessage}
        pendingDeleteId={pendingDelete}
        onEdit={handleEditFarm}
        onDelete={handleDeleteFarm}
        onAddFarm={handleAddFarm}
        onRetry={refetchFarms}
        formatSize={formatFarmSize}
      />
      <ConfirmDialog
        visible={farmPendingConfirmation != null}
        title="Delete Farm"
        message={
          farmPendingConfirmation
            ? `Are you sure you want to delete "${farmPendingConfirmation.name}"? This action cannot be undone.`
            : undefined
        }
        confirmText="Delete"
        cancelText="Cancel"
        destructive
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isProcessing={isConfirmingDelete}
      />
    </>
  );
}
