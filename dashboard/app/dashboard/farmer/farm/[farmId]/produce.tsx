import { JSX, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  Clock,
  MapPin,
  Package,
  QrCode,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react-native";
import { Dropdown } from "react-native-paper-dropdown";
import FarmerLayout from "@/components/ui/FarmerLayout";
import QRModal from "@/components/ui/QRModel";
import ImagePlaceholder from "@/components/farmer/produce/ImagePlaceholder";
import ProduceEmptyState from "@/components/farmer/produce/ProduceEmptyState";
import {
  DropDownInput,
  DropdownItem,
  dropdownMenuContentStyle,
} from "@/components/ui/DropDownInput";
import {
  useAuthControllerProfile,
  type ProduceListResponseDto,
  type FarmDetailResponseDto,
} from "@/api";
import { useFarmQuery } from "@/hooks/useFarm";
import { extractCertifications } from "@/utils/farm";
import { parseError } from "@/utils/format-error";

type VerificationStatus = "verified" | "pending" | "failed";
type StatusFilter = VerificationStatus | "all";
type SortOption =
  | "harvest_desc"
  | "harvest_asc"
  | "quantity_desc"
  | "quantity_asc";

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: "All Statuses", value: "all" },
  { label: "Verified", value: "verified" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Harvest Date · Newest", value: "harvest_desc" },
  { label: "Harvest Date · Oldest", value: "harvest_asc" },
  { label: "Quantity · High to Low", value: "quantity_desc" },
  { label: "Quantity · Low to High", value: "quantity_asc" },
];

const getCertificationStyles = (label: string) => {
  const normalized = label.toLowerCase();

  if (normalized.includes("organic")) {
    return {
      container: "bg-amber-100 border border-amber-200",
      text: "text-amber-700",
    };
  }

  if (normalized.includes("halal")) {
    return {
      container: "bg-blue-100 border border-blue-200",
      text: "text-blue-700",
    };
  }

  if (normalized.includes("gap")) {
    return {
      container: "bg-emerald-100 border border-emerald-200",
      text: "text-emerald-700",
    };
  }

  return {
    container: "bg-lime-100 border border-lime-200",
    text: "text-lime-700",
  };
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatQuantity = (quantity?: number, unit?: string | null) => {
  if (typeof quantity !== "number" || Number.isNaN(quantity)) {
    return "--";
  }

  const normalizedUnit = unit ?? "";
  return `${quantity.toLocaleString()} ${normalizedUnit}`.trim();
};


const getQrCodeUrl = (batch: ProduceListResponseDto) => {
  const fromCamel = (batch as { qrCode?: string | null }).qrCode;
  if (typeof fromCamel === "string" && fromCamel.trim().length) {
    return fromCamel;
  }

  const fromSnake = (batch as { qr_code?: string | null }).qr_code;
  if (typeof fromSnake === "string" && fromSnake.trim().length) {
    return fromSnake;
  }

  return "";
};


type BatchFiltersProps = {
  isDesktop: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  sortOption: SortOption;
  onSortChange: (value: SortOption) => void;
};

function BatchFilters({
  isDesktop,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortOption,
  onSortChange,
}: BatchFiltersProps) {
  return (
    <View className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
      <View
        className={`gap-3 ${
          isDesktop ? "flex-row items-center" : "flex-col"
        }`}
      >
        <View className="flex-row items-center bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 flex-1">
          <Search color="#9ca3af" size={20} />
          <TextInput
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Search by produce name or batch ID"
            className="flex-1 ml-3 text-gray-900 text-[15px]"
            placeholderTextColor="#9ca3af"
          />
        </View>
        <View
          className={`flex-row ${
            isDesktop ? "gap-3 flex-none" : "gap-3 flex-wrap"
          }`}
        >
          <View className="relative min-w-[170px] flex-1">
            <Dropdown
              mode="outlined"
              placeholder="Blockchain status"
              value={statusFilter === "all" ? "" : statusFilter}
              options={STATUS_OPTIONS.map((option) => ({
                label: option.label,
                value: option.value,
              }))}
              onSelect={(value) =>
                onStatusChange(
                  (value as StatusFilter | null) ?? "all"
                )
              }
              CustomDropdownInput={DropDownInput}
              CustomDropdownItem={DropdownItem}
              menuContentStyle={dropdownMenuContentStyle}
              hideMenuHeader
            />
          </View>
          <View className="relative min-w-[190px] flex-1">
            <Dropdown
              mode="outlined"
              placeholder="Sort batches"
              value={sortOption}
              options={SORT_OPTIONS}
              onSelect={(value) =>
                onSortChange(
                  (value as SortOption | null) ?? "harvest_desc"
                )
              }
              CustomDropdownInput={DropDownInput}
              CustomDropdownItem={DropdownItem}
              menuContentStyle={dropdownMenuContentStyle}
              hideMenuHeader
            />
          </View>
        </View>
      </View>
    </View>
  );
}

type ProduceDetailModalProps = {
  batch: ProduceListResponseDto | null;
  onClose: () => void;
};

function ProduceDetailModal({ batch, onClose }: ProduceDetailModalProps) {
  const visible = Boolean(batch);
  if (!batch) return null;

  const harvestDate = formatDate(batch.harvestDate);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="bg-white rounded-2xl w-full max-w-lg overflow-hidden border border-gray-200">
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
            <Text className="text-gray-900 text-lg font-bold">
              Produce Details
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
            >
              <X color="#6b7280" size={20} />
            </TouchableOpacity>
          </View>

          <View className="p-6 gap-4">
            <View className="gap-1">
              <Text className="text-sm text-gray-500 uppercase font-semibold">
                Produce Name
              </Text>
              <Text className="text-gray-900 text-lg font-semibold">
                {batch.name}
              </Text>
            </View>

            <View className="gap-1">
              <Text className="text-sm text-gray-500 uppercase font-semibold">
                Batch ID
              </Text>
              <Text className="text-gray-900 text-base font-medium">
                {batch.batchId}
              </Text>
            </View>

            <View className="gap-1">
              <Text className="text-sm text-gray-500 uppercase font-semibold">
                Harvest Date
              </Text>
              <Text className="text-gray-900 text-base font-medium">
                {harvestDate ?? "--"}
              </Text>
            </View>

            <View className="gap-1">
              <Text className="text-sm text-gray-500 uppercase font-semibold">
                Quantity
              </Text>
              <Text className="text-gray-900 text-base font-medium">
                {formatQuantity(batch.quantity, batch.unit)}
              </Text>
            </View>

            {/* <View className="gap-2">
              <Text className="text-sm text-gray-500 uppercase font-semibold">
                Blockchain Status
              </Text>
              <View
                className={`self-start flex-row items-center gap-2 px-3 py-1.5 rounded-full ${statusAppearance.container}`}
              >
                {statusAppearance.icon}
                <Text
                  className={`text-xs font-semibold ${statusAppearance.text}`}
                >
                  {statusAppearance.label}
                </Text>
              </View>
            </View> */}

            <View className="gap-1">
              <Text className="text-sm text-gray-500 uppercase font-semibold">
                Blockchain Tx Hash
              </Text>
              <Text
                className="text-gray-900 text-sm font-mono"
                numberOfLines={1}
              >
                {batch.blockchainTx ?? "Not yet recorded"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function FarmProducePage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;
  const params = useLocalSearchParams<{ farmId?: string }>();
  const rawFarmId = Array.isArray(params.farmId)
    ? params.farmId[0]
    : params.farmId;
  const farmId = rawFarmId ?? "";

  const {
    data: profileData,
    isLoading: isProfileLoading,
  } = useAuthControllerProfile();
  const farmerId = profileData?.data?.id ?? "";

  const {
    data: farmResponse,
    isLoading: isFarmLoading,
    error: farmError,
    refetch: refetchFarm,
  } = useFarmQuery(farmerId, farmId);

  const farm = farmResponse?.data as FarmDetailResponseDto | undefined;
  const farmProduces = farm?.produces ?? [];

  const isFarmerReady = Boolean(farmerId);
  const shouldFetchFarm = Boolean(farmId && isFarmerReady);
  const isLoading =
    isProfileLoading || (shouldFetchFarm && isFarmLoading && !farm);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("harvest_desc");
  const [qrBatch, setQrBatch] = useState<ProduceListResponseDto | null>(null);
  const [detailBatch, setDetailBatch] =
    useState<ProduceListResponseDto | null>(null);

  const certifications = useMemo(
    () => (farm ? extractCertifications(farm.documents) : []),
    [farm]
  );

  const derivedStats = useMemo(() => {
    if (!farmProduces.length) {
      return {
        total: 0,
        verified: 0,
        verifiedPercentage: 0,
        lastHarvestDate: null as string | null,
      };
    }

    let verified = 0;
    let latest: Date | null = null;

    for (const batch of farmProduces) {
      if (batch.harvestDate) {
        const current = new Date(batch.harvestDate);
        if (!Number.isNaN(current.getTime())) {
          if (!latest || current > latest) {
            latest = current;
          }
        }
      }
    }

    const total = farmProduces.length;
    const verifiedPercentage =
      total > 0 ? Math.round((verified / total) * 100) : 0;

    return {
      total,
      verified,
      verifiedPercentage,
      lastHarvestDate: latest ? latest.toISOString() : null,
    };
  }, [farmProduces]);

  const filteredBatches = useMemo(() => {
    const searchValue = searchQuery.trim().toLowerCase();

    let batches = farmProduces.filter((batch) => {
      if (!searchValue) return true;
      const nameMatch = batch.name?.toLowerCase().includes(searchValue);
      const batchIdMatch = batch.batchId
        ?.toLowerCase()
        .includes(searchValue);
      return nameMatch || batchIdMatch;
    });

    const sortable = [...batches];

    sortable.sort((a, b) => {
      switch (sortOption) {
        case "harvest_asc": {
          const aTime = new Date(a.harvestDate).getTime();
          const bTime = new Date(b.harvestDate).getTime();
          return aTime - bTime;
        }
        case "harvest_desc": {
          const aTime = new Date(a.harvestDate).getTime();
          const bTime = new Date(b.harvestDate).getTime();
          return bTime - aTime;
        }
        case "quantity_desc": {
          const aQuantity = a.quantity ?? 0;
          const bQuantity = b.quantity ?? 0;
          return bQuantity - aQuantity;
        }
        case "quantity_asc":
        default: {
          const aQuantity = a.quantity ?? 0;
          const bQuantity = b.quantity ?? 0;
          return aQuantity - bQuantity;
        }
      }
    });

    return sortable;
  }, [farmProduces, searchQuery, statusFilter, sortOption]);

  const latestHarvestDate = formatDate(derivedStats.lastHarvestDate);

  const handleViewQR = (batch: ProduceListResponseDto) => {
    setQrBatch(batch);
  };

  const handleViewDetails = (batch: ProduceListResponseDto) => {
    setDetailBatch(batch);
  };

  const handleCloseQR = () => setQrBatch(null);
  const handleCloseDetails = () => setDetailBatch(null);

  const handleBack = () => {
    router.push("/dashboard/farmer/produce");
  };

  const handleAddProduce = () => {
    router.push({
      pathname: "/dashboard/farmer/add-produce",
      params: { farmId },
    });
  };


  const renderDesktopList = () => (
    <View className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <View className="flex-row items-center bg-gray-50 border-b border-gray-200 px-6 py-3">
        <Text className="flex-[2] text-[11px] font-semibold uppercase text-gray-500">
          Produce Batch
        </Text>
        <Text className="flex-[1.5] text-[11px] font-semibold uppercase text-gray-500">
          Harvest Date
        </Text>
        <Text className="flex-[1] text-[11px] font-semibold uppercase text-gray-500">
          Quantity
        </Text>
        <Text className="flex-[1.2] text-[11px] font-semibold uppercase text-gray-500">
          Blockchain
        </Text>
        <Text className="flex-[1.4] text-[11px] font-semibold uppercase text-gray-500">
          Actions
        </Text>
      </View>

      {filteredBatches.map((batch) => {
        const harvestDate = formatDate(batch.harvestDate);
        return (
          <View
            key={batch.id}
            className="flex-row items-center px-6 py-4 border-b border-gray-100"
          >
            <View className="flex-[2] gap-1">
              <Text className="text-gray-900 text-sm font-semibold">
                {batch.name}
              </Text>
              <Text className="text-gray-500 text-xs font-medium">
                Batch ID: {batch.batchId}
              </Text>
            </View>
            <Text className="flex-[1.5] text-gray-800 text-sm">
              {harvestDate ?? "--"}
            </Text>
            <Text className="flex-[1] text-gray-800 text-sm">
              {formatQuantity(batch.quantity, batch.unit)}
            </Text>
            <View className="flex-[1.2]">
              {batch.blockchainTx ? (
                <Text
                  className="text-gray-500 text-[11px] font-mono mt-1"
                  numberOfLines={1}
                >
                  {batch.blockchainTx.slice(0, 8)}...
                  {batch.blockchainTx.slice(-6)}
                </Text>
              ) : null}
            </View>
            <View className="flex-[1.4] flex-row gap-2">
              <TouchableOpacity
                onPress={() => handleViewDetails(batch)}
                className="flex-1 items-center justify-center border border-emerald-300 bg-emerald-50 rounded-lg py-2"
              >
                <Text className="text-emerald-700 text-xs font-semibold">
                  Details
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleViewQR(batch)}
                className="flex-1 items-center justify-center border border-blue-300 bg-blue-50 rounded-lg py-2"
              >
                <Text className="text-blue-700 text-xs font-semibold">
                  QR Code
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {filteredBatches.length === 0 ? (
        <View className="px-6 py-10">
          <ProduceEmptyState onAddProduce={handleAddProduce} />
        </View>
      ) : null}
    </View>
  );

  const renderMobileList = () => (
    <View className="gap-4">
      {filteredBatches.map((batch) => {
        const harvestDate = formatDate(batch.harvestDate);

        return (
          <View
            key={batch.id}
            className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-3">
                <Text className="text-gray-900 text-base font-semibold">
                  {batch.name}
                </Text>
                <Text className="text-gray-500 text-xs mt-1">
                  Batch ID: {batch.batchId}
                </Text>
              </View>
            </View>

            <View className="mt-4 gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-500 text-xs uppercase font-semibold">
                  Harvest Date
                </Text>
                <Text className="text-gray-900 text-sm font-medium">
                  {harvestDate ?? "--"}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-500 text-xs uppercase font-semibold">
                  Quantity
                </Text>
                <Text className="text-gray-900 text-sm font-medium">
                  {formatQuantity(batch.quantity, batch.unit)}
                </Text>
              </View>
              {batch.blockchainTx ? (
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-500 text-xs uppercase font-semibold">
                    Blockchain Tx
                  </Text>
                  <Text
                    className="text-gray-900 text-xs font-mono"
                    numberOfLines={1}
                  >
                    {batch.blockchainTx.slice(0, 10)}...
                    {batch.blockchainTx.slice(-6)}
                  </Text>
                </View>
              ) : null}
            </View>

            <View className="mt-4 flex-row gap-3">
              <TouchableOpacity
                onPress={() => handleViewDetails(batch)}
                className="flex-1 flex-row items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg py-2.5"
              >
                <CheckCircle color="#047857" size={16} />
                <Text className="text-emerald-700 text-sm font-semibold">
                  View Details
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleViewQR(batch)}
                className="flex-1 flex-row items-center justify-center gap-2 bg-blue-50 border border-blue-200 rounded-lg py-2.5"
              >
                <QrCode color="#2563eb" size={16} />
                <Text className="text-blue-700 text-sm font-semibold">
                  View QR
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {filteredBatches.length === 0 ? (
        <ProduceEmptyState onAddProduce={handleAddProduce} />
      ) : null}
    </View>
  );

  const summaryCard = (
    <View className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
      <View className="h-1 bg-emerald-500" />
      <View className="p-6 gap-6">
        <View
          className={`flex-row ${
            isDesktop ? "items-start" : "items-center"
          } gap-6`}
        >
          <ImagePlaceholder
            size={isDesktop ? 120 : 88}
            rounded="xl"
            border
            imageUrl={
              (farm as { imageUrl?: string | null })?.imageUrl ??
              (farm as { image_url?: string | null })?.image_url ??
              null
            }
            icon="\uD83C\uDF3E"
            accessibilityLabel="Farm image"
            alt={`Photo of ${farm?.name ?? "farm"}`}
          />
          <View className="flex-1 gap-2">
            <Text className="text-gray-900 text-2xl font-bold">
              {farm?.name ?? "Farm"}
            </Text>
            <Text className="text-gray-500 text-sm">
              ID: {farm?.id ?? farmId}
            </Text>
            {farm?.location ? (
              <View className="flex-row items-center gap-2 mt-1">
                <MapPin color="#6b7280" size={16} />
                <Text className="text-gray-600 text-sm">
                  {farm.location}
                </Text>
              </View>
            ) : null}
            <View className="flex-row flex-wrap gap-2 mt-3">
              {certifications.length > 0 ? (
                certifications.map((certification) => {
                  const styles = getCertificationStyles(certification);
                  return (
                    <View
                      key={certification}
                      className={`px-3 py-1 rounded-full ${styles.container}`}
                    >
                      <Text
                        className={`text-xs font-semibold ${styles.text}`}
                      >
                        {certification}
                      </Text>
                    </View>
                  );
                })
              ) : (
                <View className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200">
                  <Text className="text-xs font-semibold text-gray-500">
                    No Certifications
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View
          className={`bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 ${
            isDesktop ? "flex-row items-center gap-6" : "gap-4"
          }`}
        >
          <View className="flex-row items-center gap-3 flex-1">
            <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center">
              <Package color="#047857" size={18} />
            </View>
            <View>
              <Text className="text-xs font-semibold uppercase text-gray-500">
                Total Produce
              </Text>
              <Text className="text-gray-900 text-lg font-bold mt-1">
                {derivedStats.total}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-3 flex-1">
            <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center">
              <ShieldCheck color="#047857" size={18} />
            </View>
            <View>
              <Text className="text-xs font-semibold uppercase text-gray-500">
                Verified Batches
              </Text>
              <Text className="text-gray-900 text-lg font-bold mt-1">
                {derivedStats.verified}{" "}
                <Text className="text-sm text-gray-500 font-medium">
                  ({derivedStats.verifiedPercentage}%)
                </Text>
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-3 flex-1">
            <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center">
              <CalendarDays color="#047857" size={18} />
            </View>
            <View>
              <Text className="text-xs font-semibold uppercase text-gray-500">
                Last Harvest
              </Text>
              <Text className="text-gray-900 text-sm font-medium mt-1">
                {latestHarvestDate ?? "--"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    const layoutChildren = (
      <View className="gap-6">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={handleBack}
            className="flex-row items-center gap-2"
          >
            <ArrowLeft color="#059669" size={18} />
            <Text className="text-emerald-700 text-sm font-semibold">
              Back to Produce Overview
            </Text>
          </TouchableOpacity>
        </View>

        {summaryCard}

        <BatchFilters
          isDesktop={isDesktop}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sortOption={sortOption}
          onSortChange={setSortOption}
        />

        {isDesktop ? renderDesktopList() : renderMobileList()}
      </View>
    );

    if (isDesktop) {
      return (
        <View className="flex-1 bg-gray-50">
          <View className="w-full px-6 lg:px-8 py-6">{layoutChildren}</View>
        </View>
      );
    }

    return (
      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 24,
        }}
      >
        {layoutChildren}
      </ScrollView>
    );
  };

  const renderLoadingState = () => (
    <View className="flex-1 items-center justify-center bg-gray-50">
      <ActivityIndicator size="large" color="#059669" />
      <Text className="mt-3 text-gray-600">
        Preparing farm produce data...
      </Text>
    </View>
  );

  const renderMissingFarmState = () => (
    <View className="flex-1 items-center justify-center bg-gray-50 px-8">
      <Text className="text-gray-900 font-semibold mb-2">
        Farm not selected
      </Text>
      <Text className="text-gray-600 text-center mb-4">
        Please choose a farm from the produce overview to see batch details.
      </Text>
      <TouchableOpacity
        onPress={handleBack}
        className="bg-emerald-600 px-5 py-3 rounded-lg"
      >
        <Text className="text-white font-semibold">
          Back to Produce Overview
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = (message: string, canRetry = true) => (
    <View className="flex-1 items-center justify-center bg-gray-50 px-8">
      <Text className="text-red-600 font-semibold mb-2">
        Unable to load farm produce
      </Text>
      <Text className="text-gray-600 text-center mb-4">{message}</Text>
      <View className="flex-row gap-3">
        {canRetry ? (
          <TouchableOpacity
            onPress={() => refetchFarm()}
            className="bg-emerald-600 px-5 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          onPress={handleBack}
          className="bg-gray-200 px-5 py-3 rounded-lg"
        >
          <Text className="text-gray-800 font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  let content: JSX.Element;

  if (!farmId) {
    content = renderMissingFarmState();
  } else if (isLoading) {
    content = renderLoadingState();
  } else if (farmError) {
    content = renderErrorState(
      parseError(farmError) ??
        "An unexpected error occurred while loading farm data."
    );
  } else if (!farm) {
    content = renderErrorState(
      "No farm details were returned. The farm may have been removed.",
      false
    );
  } else {
    content = renderContent();
  }

  return (
    <FarmerLayout
      headerTitle="Farm Produce Batches"
      headerSubtitle="Monitor harvest records and blockchain verification for this farm"
    >
      {content}

      <QRModal
        visible={Boolean(qrBatch)}
        onClose={handleCloseQR}
        batchId={qrBatch?.batchId ?? ""}
        qrCodeUrl={qrBatch ? getQrCodeUrl(qrBatch) : ""}
        blockchainTxHash={qrBatch?.blockchainTx}
      />

      <ProduceDetailModal batch={detailBatch} onClose={handleCloseDetails} />
    </FarmerLayout>
  );
}
