import { useState } from "react";
import {
  Alert,
  Platform,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import FarmerLayout from "@/components/ui/FarmerLayout";
import { useAuthControllerProfile } from "@/api";
import useFarm, { useFarmsQuery } from "@/hooks/useFarm";
import {
  FarmManagementContent,
  MobileLayout,
  formatFarmSize,
} from "@/components/farmer/farm-management";

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
  const isMutating = farmsQuery.isRefetching || farmsQuery.isFetching;

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
      Alert.alert(
        "Connect to backend",
        "Deleting farms requires an authenticated farmer profile."
      );
      return;
    }

    try {
      setPendingDelete(farmId);
      await deleteFarm(farmerId, farmId);
      await farmsQuery.refetch();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete farm.";
      Alert.alert("Delete failed", message);
    } finally {
      setPendingDelete(null);
    }
  };

  const handleDeleteFarm = (farmId: string, farmName: string) => {
    Alert.alert(
      "Delete Farm",
      `Are you sure you want to delete ${farmName}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => performDelete(farmId),
        },
      ]
    );
  };

  const isLoading = farmsQuery.isLoading || isMutating;

  const content = (
    <FarmManagementContent
      isDesktop={isDesktop}
      farms={farmsQuery.data}
      isLoading={isLoading}
      errorMessage={farmsQuery.error}
      pendingDeleteId={pendingDelete}
      onManageProduce={handleManageProduce}
      onEdit={handleEditFarm}
      onDelete={handleDeleteFarm}
      onAddFarm={handleAddFarm}
      formatSize={formatFarmSize}
    />
  );

  if (isDesktop) {
    return (
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
    );
  }

  return (
    <MobileLayout onBack={() => router.back()} onAddFarm={handleAddFarm}>
      {content}
    </MobileLayout>
  );
}
