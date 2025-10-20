import { useEffect, useState } from "react";
import {
  Platform,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import Toast from "react-native-toast-message";
import FarmerLayout from "@/components/ui/FarmerLayout";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useAuthControllerProfile } from "@/api";
import useFarm, { useFarmsQuery } from "@/hooks/useFarm";
import {
  FarmManagementContent,
  MobileLayout,
  formatFarmSize,
} from "@/components/farmer/farm-management";
import { parseError } from "@/utils/format-error";

export default function FarmManagementScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && (width === 0 ? true : width >= 1024);

  const { data: profileData } = useAuthControllerProfile();
  const farmerId = profileData?.data?.id;

  const farmsQuery = useFarmsQuery(farmerId ?? "");
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

  const handleAddFarm = () => {
    router.push("/dashboard/farmer/register-farm");
  };

  const handleEditFarm = (farmId: string) => {
    router.push({
      pathname: "/dashboard/farmer/register-farm",
      params: { farmId },
    });
  };

  const handleManageProduce = (farmId: string) => {
    router.push({
      pathname: "/dashboard/farmer/produce",
      params: { farmId },
    });
  };

  const performDelete = async (farmId: string) => {
    if (!farmerId) {
      Toast.show({
        type: "error",
        text1: "Connect to backend",
        text2: "Deleting farms requires an authenticated farmer profile.",
      });
      return;
    }

    try {
      setPendingDelete(farmId);
      await deleteFarm(farmerId, farmId);
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

  const confirmDialog = (
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
  );

  const content = (
    <FarmManagementContent
      isDesktop={isDesktop}
      farms={farmsQuery.data}
      isLoading={isLoading}
      errorMessage={farmsErrorMessage}
      pendingDeleteId={pendingDelete}
      onEdit={handleEditFarm}
      onDelete={handleDeleteFarm}
      onAddFarm={handleAddFarm}
      formatSize={formatFarmSize}
    />
  );

  if (isDesktop) {
    return (
      <>
        <FarmerLayout
          headerTitle="Farm Management"
          headerSubtitle="Review and maintain your registered farms in one place"
          rightHeaderButton={
            <TouchableOpacity
              onPress={handleAddFarm}
              className="rounded-lg overflow-hidden"
            >
              <LinearGradient
                colors={["#22c55e", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="flex-row items-center gap-2 px-5 py-3"
              >
                <Plus color="#fff" size={18} />
                <Text className="text-white text-sm font-semibold">
                  Add New Farm
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          }
        >
          {content}
        </FarmerLayout>
        {confirmDialog}
      </>
    );
  }

  return (
    <>
      <MobileLayout onBack={() => router.back()} onAddFarm={handleAddFarm}>
        {content}
      </MobileLayout>
      {confirmDialog}
    </>
  );
}
