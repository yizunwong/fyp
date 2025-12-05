import { LinearGradient } from "expo-linear-gradient";
import { CalendarDays, Package, ShieldCheck, FileText } from "lucide-react-native";
import { DimensionValue, Text, TouchableOpacity, View, type ViewStyle } from "react-native";
import ImagePlaceholder from "./ImagePlaceholder";
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '../farm-produce/utils';

export type FarmSummary = {
  id: string;
  name: string;
  location?: string;
  documentTypes: string[];
  documentCount: number;
  produceCount: number;
  verifiedCount: number;
  lastHarvestDate: string | null;
  imageUrl?: string | null;
};

type FarmOverviewSectionProps = {
  farmSummaries: FarmSummary[];
  isDesktop: boolean;
  onAddFarm: () => void;
  onViewFarmProduce: (farmId: string) => void;
};

const getDocumentStyles = (label: string) => {
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

const clampRatio = (value: number) => Math.min(1, Math.max(0, value));


export default function FarmOverviewSection({
  farmSummaries,
  isDesktop,
  onAddFarm,
  onViewFarmProduce,
}: FarmOverviewSectionProps) {
  if (farmSummaries.length === 0) {
    return (
      <View className="mt-6">
        <EmptyState
          title="No Farms Found"
          subtitle="Try adjusting your search or filter criteria"
          onActionPress={onAddFarm}
        />
      </View>
    );
  }

  return (
    <View
      className={`mt-6 ${
        isDesktop ? "flex-row flex-wrap " : "flex flex-col gap-4"
      }`}
    >
      {farmSummaries.map((farm) => {
        const wrapperStyle: ViewStyle = isDesktop
          ? { width: "50%", paddingHorizontal: 12, marginBottom: 24 }
          : { width: "100%", marginBottom: 16 };

        const verifiedRatio =
          farm.produceCount > 0
            ? clampRatio(farm.verifiedCount / farm.produceCount)
            : 0;

        const progressWidth = `${Math.round(
          verifiedRatio * 100
        )}%` as DimensionValue;
        const formattedHarvestDate = formatDate(farm.lastHarvestDate);

        return (
          <View key={farm.id} style={wrapperStyle}>
            <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md hover:border-emerald-200">
              <View className="flex-row items-start justify-between gap-4">
                <View className="flex-row items-start gap-4 flex-1">
                  <ImagePlaceholder
                    size={isDesktop ? 116 : 96}
                    rounded="xl"
                    border
                    icon="🌾"
                    imageUrl={farm.imageUrl}
                    accessibilityLabel="Farm image placeholder"
                    alt={`Photo of ${farm.name}`}
                  />
                  <View className="flex-1">
                    <Text className="text-gray-900 text-xl font-semibold">
                      {farm.name}
                    </Text>
                    <Text className="text-gray-500 text-xs mt-1">
                      ID: {farm.id}
                    </Text>
                    {farm.location ? (
                      <Text className="text-gray-500 text-xs mt-1">
                        {farm.location}
                      </Text>
                    ) : null}
                  </View>
                </View>
                <View className="flex-row flex-wrap justify-end gap-2 max-w-[220px]">
                  {farm.documentTypes.length > 0 ? (
                    farm.documentTypes.map((docType) => {
                      const styles = getDocumentStyles(docType);
                      return (
                        <View
                          key={docType}
                          className={`px-3 py-1 rounded-full ${styles.container}`}
                        >
                          <Text
                            className={`text-xs font-semibold ${styles.text}`}
                          >
                            {docType}
                          </Text>
                        </View>
                      );
                    })
                  ) : (
                    <View className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200">
                      <Text className="text-xs font-semibold text-gray-500">
                        No Documents
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View className="mt-5 flex-row flex-wrap gap-4">
                <View className="flex-row items-center gap-3 flex-1 min-w-[140px]">
                  <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center">
                    <Package color="#047857" size={18} />
                  </View>
                  <View>
                    <Text className="text-xs font-semibold uppercase text-gray-500">
                      Total Produce
                    </Text>
                    <Text className="text-gray-900 text-lg font-bold mt-1">
                      {farm.produceCount}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-3 flex-1 min-w-[140px]">
                  <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center">
                    <ShieldCheck color="#047857" size={18} />
                  </View>
                  <View>
                    <Text className="text-xs font-semibold uppercase text-gray-500">
                      Verified
                    </Text>
                    <Text className="text-gray-900 text-lg font-bold mt-1">
                      {farm.verifiedCount}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-3 flex-1 min-w-[140px]">
                  <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center">
                    <FileText color="#047857" size={18} />
                  </View>
                  <View>
                    <Text className="text-xs font-semibold uppercase text-gray-500">
                      Documents
                    </Text>
                    <Text className="text-gray-900 text-lg font-bold mt-1">
                      {farm.documentCount}
                    </Text>
                  </View>
                </View>
                {formattedHarvestDate ? (
                  <View className="flex-row items-center gap-3 flex-shrink-0">
                    <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center">
                      <CalendarDays color="#047857" size={18} />
                    </View>
                    <View>
                      <Text className="text-xs font-semibold uppercase text-gray-500">
                        Last Harvest
                      </Text>
                      <Text className="text-gray-900 text-sm font-medium mt-1">
                        {formattedHarvestDate}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </View>

              <View className="mt-4">
                <View className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                  <View
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: progressWidth }}
                  />
                </View>
                <Text className="text-[11px] text-gray-500 mt-2">
                  {farm.verifiedCount} of {farm.produceCount} batches verified
                </Text>
              </View>

              <View className="mt-5 flex-row justify-end">
                <TouchableOpacity
                  onPress={() => onViewFarmProduce(farm.id)}
                  className="rounded-full overflow-hidden"
                >
                  <LinearGradient
                    colors={["#22c55e", "#059669"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="flex-row items-center gap-2 px-4 py-2"
                  >
                    <Text className="text-white text-base">
                      {"\uD83C\uDF3E"}
                    </Text>
                    <Text className="text-white text-sm font-semibold">
                      View Produce
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}
