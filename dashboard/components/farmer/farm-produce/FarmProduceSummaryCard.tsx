import type { FC } from "react";
import { View, Text } from "react-native";
import { CalendarDays, MapPin, Package, ShieldCheck } from "lucide-react-native";
import ImagePlaceholder from "@/components/farmer/produce/ImagePlaceholder";
import type { FarmDetailResponseDto } from "@/api";
import type { FarmProduceStats } from "./types";
import { formatDate, getCertificationStyles } from "./utils";

type FarmProduceSummaryCardProps = {
  farm?: FarmDetailResponseDto;
  farmId: string;
  isDesktop: boolean;
  certifications: string[];
  stats: FarmProduceStats;
};

const FarmProduceSummaryCard: FC<FarmProduceSummaryCardProps> = ({
  farm,
  farmId,
  isDesktop,
  certifications,
  stats,
}) => {
  const latestHarvestDate = formatDate(stats.lastHarvestDate);
  const farmImage =
    (farm as { imageUrl?: string | null })?.imageUrl ??
    (farm as { image_url?: string | null })?.image_url ??
    null;

  return (
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
            imageUrl={farmImage}
            icon="\uD83C\uDF3E"
            accessibilityLabel="Farm image"
            alt={`Photo of ${farm?.name ?? "farm"}`}
          />
          <View className="flex-1 gap-2">
            <Text className="text-gray-900 text-2xl font-bold">
              {farm?.name ?? "Farm"}
            </Text>
            <Text className="text-gray-500 text-sm">ID: {farm?.id ?? farmId}</Text>
            {farm?.location ? (
              <View className="flex-row items-center gap-2 mt-1">
                <MapPin color="#6b7280" size={16} />
                <Text className="text-gray-600 text-sm">{farm.location}</Text>
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
                      <Text className={`text-xs font-semibold ${styles.text}`}>
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
                {stats.total}
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
                {stats.verified}{" "}
                <Text className="text-sm text-gray-500 font-medium">
                  ({stats.verifiedPercentage}%)
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
};

export default FarmProduceSummaryCard;
