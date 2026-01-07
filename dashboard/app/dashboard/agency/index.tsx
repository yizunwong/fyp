import { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import {
  FileCheck,
  FileText,
  CloudRain,
  AlertTriangle,
  Shield,
  TrendingUp,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import { router } from "expo-router";
import { useAgencyDashboardStats } from "@/hooks/useDashboard";
import { useAppLayout } from "@/components/layout";
import useWeather from "@/hooks/useWeather";

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
}

function mapVerificationStatusToStatus(verificationStatus: string): string {
  const statusMap: Record<string, string> = {
    PENDING: "pending_review",
    APPROVED: "approved",
    REJECTED: "docs_required",
    DOCS_REQUIRED: "docs_required",
  };
  return statusMap[verificationStatus.toUpperCase()] || "pending_review";
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string | Date): string {
  const date = dateString instanceof Date ? dateString : new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatProgramType(type: string): string {
  const typeMap: Record<string, string> = {
    FLOOD: "Flood",
    DROUGHT: "Drought",
    CROP_LOSS: "Crop Loss",
  };
  return typeMap[type.toUpperCase()] || type;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { text: string; className: string }> = {
    pending_review: {
      text: "Pending",
      className: "bg-yellow-100 dark:bg-yellow-900/90",
    },
    approved: {
      text: "Approved",
      className: "bg-green-100 dark:bg-green-900/30",
    },
    docs_required: {
      text: "Docs Required",
      className: "bg-blue-100 dark:bg-blue-900/30",
    },
    draft: {
      text: "Draft",
      className: "bg-gray-100 dark:bg-gray-700",
    },
    active: {
      text: "Active",
      className: "bg-emerald-100 dark:bg-emerald-900/30",
    },
  };
  const data = map[status] ?? {
    text: status,
    className: "bg-gray-100 dark:bg-gray-700",
  };
  return (
    <View className={`px-2 py-0.5 rounded-full self-start ${data.className}`}>
      <Text className="text-xs font-semibold text-gray-700 dark:text-gray-300">{data.text}</Text>
    </View>
  );
}

export default function AgencyDashboardScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const { stats, isLoading, error } = useAgencyDashboardStats();
  const [weatherPage, setWeatherPage] = useState(1);
  const {
    alerts: weatherAlerts,
    isLoading: isLoadingWeather,
    total: weatherTotal,
  } = useWeather({ limit: 5, page: weatherPage });
  const [expandedAlerts, setExpandedAlerts] = useState<Set<number>>(new Set());

  useAppLayout({
    title: "Agency Dashboard",
    subtitle: "Overview of registrations, programs, and claims",
  });

  const registrationStats = useMemo(
    () => [
      {
        label: "Pending Review",
        value: stats?.pendingReview ?? 0,
        icon: FileCheck,
        color: "#b45309",
        bg: "bg-yellow-50",
      },
      {
        label: "On-Chain",
        value: stats?.onChain ?? 0,
        icon: Shield,
        color: "#047857",
        bg: "bg-emerald-50",
      },
      {
        label: "Approved",
        value: stats?.approved ?? 0,
        icon: TrendingUp,
        color: "#1d4ed8",
        bg: "bg-blue-50",
      },
      {
        label: "Docs Required",
        value: stats?.docsRequired ?? 0,
        icon: FileText,
        color: "#4338ca",
        bg: "bg-indigo-50",
      },
    ],
    [stats]
  );

  const renderStatCards = useMemo(
    () => (
      <View className={isDesktop ? "flex-row gap-4 mb-6" : "gap-3 mb-6"}>
        {registrationStats.map((item) => {
          const Icon = item.icon;
          return (
            <View
              key={item.label}
              className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <View className="flex-row items-center justify-between mb-2">
                <View
                  className={`w-10 h-10 ${item.bg} dark:bg-opacity-20 rounded-lg items-center justify-center`}
                >
                  <Icon color={item.color} size={20} />
                </View>
                <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {item.value}
                </Text>
              </View>
              <Text className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    ),
    [isDesktop, registrationStats]
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-600 dark:text-gray-400 mt-4">
          Loading dashboard data...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center px-6">
        <AlertTriangle color="#ef4444" size={48} />
        <Text className="text-gray-900 dark:text-gray-100 text-lg font-semibold mt-4">
          Error loading dashboard
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 text-sm mt-2 text-center">
          {error}
        </Text>
      </View>
    );
  }

  const recentRegistrations = stats?.recentRegistrations ?? [];

  const pageContent = (
    <View className="px-6 py-6">
      {renderStatCards}

      <View className={isDesktop ? "flex-row gap-4" : "gap-4"}>
        <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-900 dark:text-gray-100 text-lg font-bold">
              Recent Registrations
            </Text>
            <TouchableOpacity
              onPress={() =>
                router.push("/dashboard/agency/registrations" as never)
              }
              className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
            >
              <Text className="text-blue-700 dark:text-blue-300 text-xs font-semibold">
                Review All
              </Text>
            </TouchableOpacity>
          </View>
          <View className="gap-3">
            {recentRegistrations.length === 0 ? (
              <Text className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                No recent registrations
              </Text>
            ) : (
              recentRegistrations.map((reg) => (
                <View
                  key={reg.id}
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex-row items-center justify-between"
                >
                  <View className="flex-1">
                    <Text className="text-gray-900 dark:text-gray-100 font-semibold">
                      {reg.id}
                    </Text>
                    <Text className="text-gray-600 dark:text-gray-400 text-sm">
                      {reg.name}
                    </Text>
                    <View className="flex-row items-center gap-1 mt-1">
                      <MapPin color="#6b7280" size={14} />
                      <Text className="text-gray-500 dark:text-gray-400 text-xs">
                        {reg.state}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end gap-1 ">
                    <StatusBadge
                      status={mapVerificationStatusToStatus(
                        reg.verificationStatus
                      )}
                    />
                    <Text className="text-gray-500 dark:text-gray-400 text-xs">
                      {getTimeAgo(reg.createdAt)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-900 dark:text-gray-100 text-lg font-bold">
              Pending Claims
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/dashboard/agency/approvals")}
              className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
            >
              <Text className="text-blue-700 dark:text-blue-300 text-xs font-semibold">
                Process
              </Text>
            </TouchableOpacity>
          </View>
          <View className="gap-3">
            {!stats?.pendingClaims || stats.pendingClaims.length === 0 ? (
              <Text className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                No pending claims
              </Text>
            ) : (
              stats.pendingClaims.map((claim) => (
                <View
                  key={claim.id}
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-gray-900 dark:text-gray-100 font-semibold text-xs">
                      {claim.id.slice(0, 12)}...
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-xs">
                      {claim.onChainTxHash ? "oracle" : "manual"}
                    </Text>
                  </View>
                  <Text className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                    {claim.programName}
                  </Text>
                  <View className="flex-row items-center justify-between mt-2">
                    <View className="flex-row items-center gap-1">
                      <MapPin color="#6b7280" size={14} />
                      <Text className="text-gray-500 dark:text-gray-400 text-xs">
                        {claim.farmerName} • {claim.state}
                      </Text>
                    </View>
                    <Text className="text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
                      {formatCurrency(claim.amount)}
                    </Text>
                  </View>
                  <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                    {getTimeAgo(claim.createdAt)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </View>

      <View className={isDesktop ? "flex-row gap-4 mt-4" : "gap-4 mt-4"}>
        <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-900 dark:text-gray-100 text-lg font-bold">
              Active Programs
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/dashboard/agency/programs" as never)}
              className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
            >
              <Text className="text-blue-700 dark:text-blue-300 text-xs font-semibold">
                Manage
              </Text>
            </TouchableOpacity>
          </View>
          <View className="gap-3">
            {!stats?.activePrograms || stats.activePrograms.length === 0 ? (
              <Text className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                No active programs
              </Text>
            ) : (
              stats.activePrograms.map((program) => (
                <View
                  key={program.id}
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex-row items-center justify-between"
                >
                  <View className="flex-1">
                    <Text className="text-gray-900 dark:text-gray-100 font-semibold">
                      {program.name}
                    </Text>
                    <Text className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                      {formatProgramType(program.type)} • Active until{" "}
                      {formatDate(program.endDate)}
                    </Text>
                    {program.payoutAmount && (
                      <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                        Payout: {formatCurrency(program.payoutAmount)}
                      </Text>
                    )}
                  </View>
                  <StatusBadge status={program.status.toLowerCase()} />
                </View>
              ))
            )}
          </View>
        </View>

        <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
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
                      onPress={() => setWeatherPage((p) => Math.max(1, p - 1))}
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
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">{pageContent}</View>
  );
}
