import { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
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
import FarmFilters, {
  FarmStatusFilter,
  FarmSizeUnitFilter,
} from "@/components/farmer/farm-management/FarmFilters";
import Pagination from "@/components/common/Pagination";
import type { FarmerControllerFindFarmsParams } from "@/api";

export default function FarmManagementScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsiveLayout();
  const { deleteFarm } = useFarm();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FarmStatusFilter>("all");
  const [category, setCategory] = useState("");
  const [minSize, setMinSize] = useState("");
  const [maxSize, setMaxSize] = useState("");
  const [sizeUnit, setSizeUnit] = useState<FarmSizeUnitFilter>("ALL");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const farmQueryParams = useMemo<FarmerControllerFindFarmsParams>(() => {
    const params: FarmerControllerFindFarmsParams = {
      page,
      limit: pageSize,
    };
    const trimmedSearch = searchQuery.trim();
    if (trimmedSearch) {
      params.name = trimmedSearch;
      params.location = trimmedSearch;
    }

    if (statusFilter !== "all") {
      params.status = statusFilter;
    }

    const trimmedCategory = category.trim();
    if (trimmedCategory) {
      params.category = trimmedCategory;
    }

    const parsedMin = parseFloat(minSize);
    if (!Number.isNaN(parsedMin)) {
      params.minSize = parsedMin;
    }

    const parsedMax = parseFloat(maxSize);
    if (!Number.isNaN(parsedMax)) {
      params.maxSize = parsedMax;
    }

    if (sizeUnit !== "ALL") {
      params.sizeUnit = sizeUnit;
    }

    return params;
  }, [category, maxSize, minSize, page, pageSize, searchQuery, sizeUnit, statusFilter]);

  const farmsQuery = useFarmsQuery(farmQueryParams);

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
    router.push("/dashboard/farmer/farms/create");
  }, [router]);

  const handleEditFarm = (farmId: string) => {
    router.push({
      pathname: "/dashboard/farmer/farms/create",
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
  const hasActiveFilters =
    !!searchQuery.trim() ||
    statusFilter !== "all" ||
    !!category.trim() ||
    !!minSize.trim() ||
    !!maxSize.trim() ||
    sizeUnit !== "ALL";

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, category, minSize, maxSize, sizeUnit]);

  const layoutMeta = useMemo(
    () => ({
      title: "My Farms",
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

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCategory("");
    setMinSize("");
    setMaxSize("");
    setSizeUnit("ALL");
  };

  return (
    <>
      <View className="px-6 pt-4">
        <FarmFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((prev) => !prev)}
          category={category}
          onCategoryChange={setCategory}
          sizeUnit={sizeUnit}
          onSizeUnitChange={setSizeUnit}
          minSize={minSize}
          maxSize={maxSize}
          onMinSizeChange={setMinSize}
          onMaxSizeChange={setMaxSize}
          onClearStatusFilter={() => setStatusFilter("all")}
          onClearCategory={() => setCategory("")}
          onClearSizeRange={() => {
            setMinSize("");
            setMaxSize("");
          }}
          onClearSizeUnit={() => setSizeUnit("ALL")}
        />
      </View>
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
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
      />
      <View className="px-6 pb-6">
        <Pagination
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          isLoading={isLoading}
          hasNext={
            farmsQuery.data?.count !== undefined
              ? page * pageSize < (farmsQuery.data?.count ?? 0)
              : (farmsQuery.data?.data?.length ?? 0) === pageSize
          }
          total={farmsQuery.data?.count}
        />
      </View>
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
