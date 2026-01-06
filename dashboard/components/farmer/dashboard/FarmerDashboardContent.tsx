import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import {
  CloudRain,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import FarmerDashboardKpiCards from "./KpiCards";
import RecentActivity from "./RecentActivity";
import RecentProduceCard from "./RecentProduceCard";
import SubsidyStatusCard from "./SubsidyStatusCard";
import {
  KPIItem,
  RecentProduceItem,
  SubsidyStatusItem,
  TimelineItem,
} from "./types";
import type { WeatherAlert } from "@/hooks/useWeather";

type Props = {
  isDesktop: boolean;
  kpis: KPIItem[];
  recentProduce: RecentProduceItem[];
  subsidyStatus: SubsidyStatusItem[];
  timeline: TimelineItem[];
  onViewAllProduce: () => void;
  onViewAllSubsidy: () => void;
  weatherAlerts: WeatherAlert[];
  isLoadingWeather: boolean;
  weatherTotal: number;
  weatherPage: number;
  setWeatherPage: (page: number | ((prev: number) => number)) => void;
  expandedAlerts: Set<number>;
  setExpandedAlerts: (alerts: Set<number>) => void;
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "retailer_verified":
      return "bg-green-100 dark:bg-green-900/90 text-green-700 dark:text-green-400";
    case "onchain_confirmed":
      return "bg-yellow-100 dark:bg-yellow-900/90 text-yellow-700 dark:text-yellow-400";
    case "in_transit":
      return "bg-blue-100 dark:bg-blue-900/90 text-blue-700 dark:text-blue-400";
    case "arrived":
      return "bg-indigo-100 dark:bg-indigo-900/90 text-indigo-700 dark:text-indigo-400";
    case "archived":
      return "bg-gray-100 dark:bg-gray-900/90 text-gray-700 dark:text-gray-400";
    case "disbursed":
      return "bg-emerald-100 dark:bg-emerald-900/90 text-emerald-700 dark:text-emerald-400";
    default:
      return "bg-gray-100 dark:bg-gray-900/90 text-gray-700 dark:text-gray-400";
  }
};

const FarmerDashboardContent = ({
  isDesktop,
  kpis,
  recentProduce,
  subsidyStatus,
  timeline,
  onViewAllProduce,
  onViewAllSubsidy,
  weatherAlerts,
  isLoadingWeather,
  weatherTotal,
  weatherPage,
  setWeatherPage,
  expandedAlerts,
  setExpandedAlerts,
}: Props) => {
  return (
    <View className={isDesktop ? "px-6 py-6" : "flex-1"}>
      <View className={isDesktop ? "" : "px-6 pt-6"}>
        <FarmerDashboardKpiCards kpis={kpis} isDesktop={isDesktop} />

        <View className={isDesktop ? "flex-row gap-6" : ""}>
          <View className={isDesktop ? "flex-1" : "mb-6"}>
            <RecentProduceCard
              recentProduce={recentProduce}
              onViewAll={onViewAllProduce}
              getStatusColor={getStatusColor}
            />
          </View>

          <View className={isDesktop ? "flex-1" : "mb-6"}>
            <SubsidyStatusCard
              subsidyStatus={subsidyStatus}
              onViewAll={onViewAllSubsidy}
              getStatusColor={getStatusColor}
            />
          </View>
        </View>

        {/* Weather Alerts Section */}
        <View className={isDesktop ? "mt-6" : "mt-6 px-0"}>
          <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-gray-900 dark:text-gray-100 text-lg font-bold">
                Weather Alerts
              </Text>
              <View className="flex-row items-center gap-2">
                <CloudRain color="#2563eb" size={18} />
                <Text className="text-blue-700 dark:text-blue-300 text-xs font-semibold">
                  Live
                </Text>
              </View>
            </View>
            <View className="gap-3">
              {isLoadingWeather ? (
                <View className="items-center justify-center py-4">
                  <ActivityIndicator size="small" color="#2563eb" />
                  <Text className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                    Loading weather alerts...
                  </Text>
                </View>
              ) : weatherAlerts.length === 0 ? (
                <Text className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                  No weather alerts
                </Text>
              ) : (
                <>
                  {weatherAlerts.map((alert, idx) => {
                    const isExpanded = expandedAlerts.has(idx);
                    const maxLength = 100;
                    const shouldTruncate = alert.message.length > maxLength;
                    const displayMessage =
                      isExpanded || !shouldTruncate
                        ? alert.message
                        : `${alert.message.substring(0, maxLength)}...`;

                    return (
                      <View
                        key={`${alert.region}-${idx}`}
                        className="p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className="text-gray-900 dark:text-gray-100 font-semibold">
                            {alert.region}
                          </Text>
                          <View className="flex-row items-center gap-1">
                            <Clock color="#6b7280" size={12} />
                            <Text className="text-gray-500 dark:text-gray-400 text-xs">
                              {alert.updatedAt}
                            </Text>
                          </View>
                        </View>
                        <View className="flex-row items-start gap-2">
                          <View className="mt-0.5">
                            <AlertTriangle color="#f97316" size={16} />
                          </View>
                          <View className="flex-1">
                            <Text className="text-gray-700 dark:text-gray-300 text-sm">
                              {displayMessage}
                            </Text>
                            {shouldTruncate && (
                              <TouchableOpacity
                                onPress={() => {
                                  const newExpanded = new Set(expandedAlerts);
                                  if (isExpanded) {
                                    newExpanded.delete(idx);
                                  } else {
                                    newExpanded.add(idx);
                                  }
                                  setExpandedAlerts(newExpanded);
                                }}
                                className="flex-row items-center gap-1 mt-1"
                              >
                                <Text className="text-blue-600 dark:text-blue-400 text-xs font-semibold">
                                  {isExpanded ? "Read less" : "Read all"}
                                </Text>
                                {isExpanded ? (
                                  <ChevronUp color="#2563eb" size={14} />
                                ) : (
                                  <ChevronDown color="#2563eb" size={14} />
                                )}
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  })}

                  {/* Pagination Controls */}
                  {weatherTotal > 5 && (
                    <View className="flex-row items-center justify-between mt-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <TouchableOpacity
                        onPress={() =>
                          setWeatherPage((p) => Math.max(1, p - 1))
                        }
                        disabled={weatherPage === 1}
                        className={`flex-row items-center gap-1 px-3 py-1.5 rounded-lg ${
                          weatherPage === 1
                            ? "bg-gray-100 dark:bg-gray-800 opacity-50"
                            : "bg-blue-50 dark:bg-blue-900/30"
                        }`}
                      >
                        <ChevronLeft
                          color={weatherPage === 1 ? "#9ca3af" : "#2563eb"}
                          size={16}
                        />
                        <Text
                          className={`text-xs font-semibold ${
                            weatherPage === 1
                              ? "text-gray-400"
                              : "text-blue-700 dark:text-blue-300"
                          }`}
                        >
                          Previous
                        </Text>
                      </TouchableOpacity>

                      <Text className="text-gray-600 dark:text-gray-400 text-xs">
                        Page {weatherPage} of {Math.ceil(weatherTotal / 5)}
                      </Text>

                      <TouchableOpacity
                        onPress={() => setWeatherPage((p) => p + 1)}
                        disabled={weatherPage >= Math.ceil(weatherTotal / 5)}
                        className={`flex-row items-center gap-1 px-3 py-1.5 rounded-lg ${
                          weatherPage >= Math.ceil(weatherTotal / 5)
                            ? "bg-gray-100 dark:bg-gray-800 opacity-50"
                            : "bg-blue-50 dark:bg-blue-900/30"
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            weatherPage >= Math.ceil(weatherTotal / 5)
                              ? "text-gray-400"
                              : "text-blue-700 dark:text-blue-300"
                          }`}
                        >
                          Next
                        </Text>
                        <ChevronRight
                          color={
                            weatherPage >= Math.ceil(weatherTotal / 5)
                              ? "#9ca3af"
                              : "#2563eb"
                          }
                          size={16}
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        </View>

        {isDesktop && <RecentActivity timeline={timeline} />}
      </View>
    </View>
  );
};

export default FarmerDashboardContent;
