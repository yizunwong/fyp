import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ArrowLeft,
  Layers,
  MapPin,
  Pencil,
  Plus,
  Ruler,
  Sprout,
  Trash2,
} from "lucide-react-native";
import FarmerLayout from "@/components/ui/FarmerLayout";
import {
  FarmerControllerFindFarms200AllOf,
  FarmListRespondDto,
  useAuthControllerProfile,
} from "@/api";
import useFarm, { useFarmsQuery } from "@/hooks/useFarm";

const formatSize = (value: number | null) => {
  if (value === null || Number.isNaN(value)) return "—";
  return `${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

export default function FarmManagementScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && (width === 0 ? true : width >= 768);

  const { data: profileData } = useAuthControllerProfile();
  const farmerId = profileData?.data?.id;

  const farmsQuery = useFarmsQuery(farmerId ?? "");
  const { deleteFarm } = useFarm();

  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const isMutating = farmsQuery.isRefetching || farmsQuery.isFetching;

  const errorMessage = farmsQuery.error;

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

  const Actions = ({ farm }: { farm: FarmListRespondDto }) => {
    const deleting = pendingDelete === farm.id;
    return (
      <View className="flex-row flex-wrap gap-2">
        <TouchableOpacity
          onPress={() => handleManageProduce(farm.id)}
          className="rounded-lg overflow-hidden"
        >
          <LinearGradient
            colors={["#22c55e", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-row items-center justify-center gap-2 px-4 py-2"
          >
            <Layers color="#fff" size={18} />
            <Text className="text-white text-sm font-semibold">
              Manage Produce
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleEditFarm(farm.id)}
          className="flex-row items-center justify-center gap-2 px-4 py-2 rounded-lg border border-emerald-200 bg-emerald-50/60"
        >
          <Pencil color="#047857" size={18} />
          <Text className="text-emerald-700 text-sm font-semibold">Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleDeleteFarm(farm.id, farm.name)}
          disabled={deleting}
          className={`flex-row items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-200 ${
            deleting ? "bg-red-50/60 opacity-70" : "bg-white"
          }`}
        >
          {deleting ? (
            <ActivityIndicator size="small" color="#b91c1c" />
          ) : (
            <Trash2 color="#b91c1c" size={18} />
          )}
          <Text className="text-red-600 text-sm font-semibold">Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const CategoryBadges = ({ categories }: { categories: string[] }) => {
    if (!categories.length) {
      return (
        <View className="px-2 py-1 rounded-full bg-gray-100">
          <Text className="text-gray-500 text-xs font-medium">
            No categories yet
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-row flex-wrap gap-2">
        {categories.map((category) => (
          <View
            key={category}
            className="px-2 py-1 rounded-full bg-emerald-50 border border-emerald-100"
          >
            <Text className="text-emerald-700 text-xs font-medium">
              {category}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const FarmTable = ({
    farms,
  }: {
    farms: FarmerControllerFindFarms200AllOf;
  }) => (
    <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <View className="flex-row bg-gray-50 px-6 py-4">
        <Text className="flex-[2] text-gray-500 text-xs font-semibold uppercase tracking-wide">
          Farm Name
        </Text>
        <Text className="flex-[2] text-gray-500 text-xs font-semibold uppercase tracking-wide">
          Location
        </Text>
        <Text className="flex-1 text-gray-500 text-xs font-semibold uppercase tracking-wide">
          Size (ha)
        </Text>
        <Text className="flex-[2] text-gray-500 text-xs font-semibold uppercase tracking-wide">
          Produce Categories
        </Text>
        <Text className="flex-[2] text-gray-500 text-xs font-semibold uppercase tracking-wide text-right">
          Actions
        </Text>
      </View>

      {farms.data?.map((farm, index) => (
        <View
          key={farm.id}
          className={`flex-row items-center px-6 py-5 ${
            index !== 0 ? "border-t border-gray-100" : ""
          }`}
        >
          <View className="flex-[2]">
            <Text className="text-gray-900 text-base font-semibold">
              {farm.name}
            </Text>
            <Text className="text-gray-500 text-xs mt-1">
              {farm.produces.length} produce records
            </Text>
          </View>
          <View className="flex-[2]">
            <View className="flex-row items-center gap-2">
              <MapPin color="#6b7280" size={16} />
              <Text className="text-gray-700 text-sm">{farm.location}</Text>
            </View>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Ruler color="#6b7280" size={16} />
              <Text className="text-gray-900 text-sm font-medium">
                {formatSize(farm.size)}
              </Text>
            </View>
          </View>
          <View className="flex-[2]">
            <CategoryBadges categories={farm.produceCategories} />
          </View>
          <View className="flex-[2] items-end">
            <Actions farm={farm} />
          </View>
        </View>
      ))}
    </View>
  );

  const FarmCards = ({
    farms,
  }: {
    farms: FarmerControllerFindFarms200AllOf;
  }) => (
    <View className="gap-4">
      {farms.data?.map((farm) => (
        <View
          key={farm.id}
          className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
        >
          <View className="flex-row items-start gap-4">
            <View className="w-12 h-12 rounded-xl bg-emerald-50 items-center justify-center">
              <Sprout color="#047857" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-lg font-semibold">
                {farm.name}
              </Text>
              <View className="flex-row items-center gap-2 mt-2">
                <MapPin color="#6b7280" size={16} />
                <Text className="text-gray-600 text-sm">{farm.location}</Text>
              </View>
              <View className="flex-row items-center gap-2 mt-2">
                <Ruler color="#6b7280" size={16} />
                <Text className="text-gray-700 text-sm font-medium">
                  {formatSize(farm.size)} ha
                </Text>
              </View>
              <View className="mt-3">
                <Text className="text-gray-500 text-xs uppercase font-semibold mb-2">
                  Produce Categories
                </Text>
                <CategoryBadges categories={farm.produceCategories} />
              </View>
              <Text className="text-gray-500 text-xs mt-3">
                {farm.produces.length} produce records
              </Text>
              <View className="mt-4">
                <Actions farm={farm} />
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const EmptyState = () => (
    <View className="bg-white rounded-xl border border-dashed border-gray-300 p-10 items-center">
      <View className="w-16 h-16 rounded-full bg-emerald-50 items-center justify-center mb-4">
        <Sprout color="#047857" size={30} />
      </View>
      <Text className="text-gray-900 text-xl font-semibold mb-2">
        No farms registered yet
      </Text>
      <Text className="text-gray-600 text-center text-sm mb-6">
        Add your first farm to start managing produce batches and subsidy
        requests from one place.
      </Text>
      <TouchableOpacity
        onPress={handleAddFarm}
        className="rounded-lg overflow-hidden"
      >
        <LinearGradient
          colors={["#22c55e", "#059669"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex-row items-center gap-2 px-6 py-3"
        >
          <Plus color="#fff" size={18} />
          <Text className="text-white text-sm font-semibold">Add New Farm</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const pageBody = (
    <View className="px-6 py-6">
      {errorMessage && (
        <View className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          <Text className="text-red-600 text-sm font-medium">
            {errorMessage}
          </Text>
        </View>
      )}

      {farmsQuery.isLoading || isMutating ? (
        <View className="items-center justify-center py-20">
          <ActivityIndicator size="large" color="#059669" />
          <Text className="text-gray-500 text-sm mt-3">
            Loading your farms…
          </Text>
        </View>
      ) : farmsQuery.data?.data?.length ? (
        isDesktop ? (
          <FarmTable farms={farmsQuery.data} />
        ) : (
          <FarmCards farms={farmsQuery.data} />
        )
      ) : (
        <EmptyState />
      )}
    </View>
  );

  const MobileHeader = () => (
    <View className="overflow-hidden">
      <LinearGradient
        colors={["#22c55e", "#059669"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pt-12 pb-10"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center mb-6"
        >
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
            <Sprout color="#fff" size={28} />
          </View>
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold">
              Farm Management
            </Text>
            <Text className="text-white/90 text-sm mt-1">
              Keep your farms organised and up to date
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleAddFarm}
          className="mt-6 rounded-lg overflow-hidden self-start"
        >
          <LinearGradient
            colors={["#fbbf24", "#f59e0b"]}
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
      </LinearGradient>
    </View>
  );

  const MobileLayout = () => (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <MobileHeader />
        {pageBody}
      </ScrollView>
      <TouchableOpacity
        onPress={handleAddFarm}
        className="absolute bottom-6 right-6 rounded-full overflow-hidden shadow-lg"
        style={{ elevation: 6 }}
      >
        <LinearGradient
          colors={["#22c55e", "#059669"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="w-14 h-14 items-center justify-center"
        >
          <Plus color="#fff" size={26} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
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
        {pageBody}
      </FarmerLayout>
    );
  }

  return <MobileLayout />;
}
