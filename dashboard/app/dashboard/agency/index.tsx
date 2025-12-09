import { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  useWindowDimensions,
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
} from "lucide-react-native";
import { router } from "expo-router";
import { useAgencyLayout } from "@/components/agency/layout/AgencyLayoutContext";

const registrationStats = [
  {
    label: "Pending Review",
    value: 18,
    icon: FileCheck,
    color: "#b45309",
    bg: "bg-yellow-50",
  },
  {
    label: "On-Chain",
    value: 46,
    icon: Shield,
    color: "#047857",
    bg: "bg-emerald-50",
  },
  {
    label: "Approved",
    value: 132,
    icon: TrendingUp,
    color: "#1d4ed8",
    bg: "bg-blue-50",
  },
  {
    label: "Docs Required",
    value: 9,
    icon: FileText,
    color: "#4338ca",
    bg: "bg-indigo-50",
  },
];

const recentRegistrations = [
  {
    id: "FARM-145",
    farmer: "Nur Aina",
    state: "Perak",
    status: "pending_review",
    submitted: "2h ago",
  },
  {
    id: "FARM-142",
    farmer: "Hafiz Rahman",
    state: "Johor",
    status: "approved",
    submitted: "6h ago",
  },
  {
    id: "FARM-139",
    farmer: "Lim Wei",
    state: "Penang",
    status: "docs_required",
    submitted: "1d ago",
  },
];

const pendingClaims = [
  {
    id: "SUB-2025-0188",
    programs: "Flood Relief Fund",
    amount: "RM 5,000",
    state: "Terengganu",
    type: "oracle",
  },
  {
    id: "SUB-2025-0187",
    programs: "Organic Farming Support",
    amount: "RM 3,500",
    state: "Pahang",
    type: "manual",
  },
  {
    id: "SUB-2025-0186",
    programs: "Drought Assistance",
    amount: "RM 4,200",
    state: "Kedah",
    type: "oracle",
  },
];

const activePrograms = [
  {
    name: "Flood Damage Compensation",
    type: "Flood",
    activeTo: "Dec 2025",
    status: "active",
  },
  {
    name: "Organic Farming Incentive",
    type: "Manual",
    activeTo: "Dec 2025",
    status: "draft",
  },
  {
    name: "Drought Relief Subsidy",
    type: "Drought",
    activeTo: "Oct 2025",
    status: "active",
  },
];

const weatherAlerts = [
  {
    region: "Kuala Terengganu",
    severity: "Critical",
    message: "Heavy rainfall expected in next 12h",
  },
  {
    region: "Kota Bharu",
    severity: "Warning",
    message: "River levels rising, monitor closely",
  },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { text: string; className: string }> = {
    pending_review: {
      text: "Pending",
      className: "bg-yellow-100 text-yellow-700",
    },
    approved: { text: "Approved", className: "bg-green-100 text-green-700" },
    docs_required: {
      text: "Docs Required",
      className: "bg-blue-100 text-blue-700",
    },
    draft: { text: "Draft", className: "bg-gray-100 text-gray-700" },
    active: { text: "Active", className: "bg-emerald-100 text-emerald-700" },
  };
  const data = map[status] ?? {
    text: status,
    className: "bg-gray-100 text-gray-700",
  };
  return (
    <View className={`px-2 py-0.5 rounded-full self-start ${data.className}`}>
      <Text className="text-xs font-semibold">{data.text}</Text>
    </View>
  );
}

export default function AgencyDashboardScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;

  useAgencyLayout({
    title: "Agency Dashboard",
    subtitle: "Overview of registrations, programs, and claims",
  });

  const renderStatCards = useMemo(
    () => (
      <View className={isDesktop ? "flex-row gap-4 mb-6" : "gap-3 mb-6"}>
        {registrationStats.map((item) => {
          const Icon = item.icon;
          return (
            <View
              key={item.label}
              className="flex-1 bg-white rounded-xl p-4 border border-gray-200"
            >
              <View className="flex-row items-center justify-between mb-2">
                <View
                  className={`w-10 h-10 ${item.bg} rounded-lg items-center justify-center`}
                >
                  <Icon color={item.color} size={20} />
                </View>
                <Text className="text-2xl font-bold text-gray-900">
                  {item.value}
                </Text>
              </View>
              <Text className="text-gray-600 text-sm font-medium">
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    ),
    [isDesktop]
  );

  const pageContent = (
    <View className="px-6 py-6">
      {renderStatCards}

      <View className={isDesktop ? "flex-row gap-4" : "gap-4"}>
        <View className="flex-1 bg-white rounded-xl border border-gray-200 p-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-900 text-lg font-bold">
              Recent Registrations
            </Text>
            <TouchableOpacity
              onPress={() =>
                router.push("/dashboard/agency/registrations" as never)
              }
              className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200"
            >
              <Text className="text-blue-700 text-xs font-semibold">
                Review All
              </Text>
            </TouchableOpacity>
          </View>
          <View className="gap-3">
            {recentRegistrations.map((reg) => (
              <View
                key={reg.id}
                className="p-3 rounded-lg border border-gray-200 flex-row items-center justify-between"
              >
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold">{reg.id}</Text>
                  <Text className="text-gray-600 text-sm">{reg.farmer}</Text>
                  <View className="flex-row items-center gap-1 mt-1">
                    <MapPin color="#6b7280" size={14} />
                    <Text className="text-gray-500 text-xs">{reg.state}</Text>
                  </View>
                </View>
                <View className="items-end gap-1">
                  <StatusBadge status={reg.status} />
                  <Text className="text-gray-500 text-xs">{reg.submitted}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="flex-1 bg-white rounded-xl border border-gray-200 p-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-900 text-lg font-bold">
              Pending Claims
            </Text>
            <TouchableOpacity
              onPress={() =>
                router.push("/dashboard/agency/approvals" as never)
              }
              className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200"
            >
              <Text className="text-blue-700 text-xs font-semibold">
                Process
              </Text>
            </TouchableOpacity>
          </View>
          <View className="gap-3">
            {pendingClaims.map((claim) => (
              <View
                key={claim.id}
                className="p-3 rounded-lg border border-gray-200"
              >
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-gray-900 font-semibold">
                    {claim.id}
                  </Text>
                  <Text className="text-gray-500 text-xs">{claim.type}</Text>
                </View>
                <Text className="text-gray-700 text-sm">{claim.programs}</Text>
                <View className="flex-row items-center justify-between mt-2">
                  <View className="flex-row items-center gap-1">
                    <MapPin color="#6b7280" size={14} />
                    <Text className="text-gray-500 text-xs">{claim.state}</Text>
                  </View>
                  <Text className="text-emerald-700 text-sm font-semibold">
                    {claim.amount}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={isDesktop ? "flex-row gap-4 mt-4" : "gap-4 mt-4"}>
        <View className="flex-1 bg-white rounded-xl border border-gray-200 p-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-900 text-lg font-bold">
              Active Programs
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/dashboard/agency/programs" as never)}
              className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200"
            >
              <Text className="text-blue-700 text-xs font-semibold">
                Manage
              </Text>
            </TouchableOpacity>
          </View>
          <View className="gap-3">
            {activePrograms.map((programs) => (
              <View
                key={programs.name}
                className="p-3 rounded-lg border border-gray-200 flex-row items-center justify-between"
              >
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold">
                    {programs.name}
                  </Text>
                  <Text className="text-gray-600 text-xs">
                    {programs.type} • Active until {programs.activeTo}
                  </Text>
                </View>
                <StatusBadge status={programs.status} />
              </View>
            ))}
          </View>
        </View>

        <View className="flex-1 bg-white rounded-xl border border-gray-200 p-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-900 text-lg font-bold">
              Weather Alerts
            </Text>
            <View className="flex-row items-center gap-2">
              <CloudRain color="#2563eb" size={18} />
              <Text className="text-blue-700 text-xs font-semibold">Live</Text>
            </View>
          </View>
          <View className="gap-3">
            {weatherAlerts.map((alert, idx) => (
              <View
                key={`${alert.region}-${idx}`}
                className="p-3 rounded-lg border border-gray-200"
              >
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-gray-900 font-semibold">
                    {alert.region}
                  </Text>
                  <StatusBadge
                    status={
                      alert.severity === "Critical"
                        ? "pending_review"
                        : "docs_required"
                    }
                  />
                </View>
                <View className="flex-row items-center gap-2">
                  <AlertTriangle color="#f97316" size={16} />
                  <Text className="text-gray-700 text-sm">{alert.message}</Text>
                </View>
                <View className="flex-row items-center gap-1 mt-2">
                  <Clock color="#6b7280" size={14} />
                  <Text className="text-gray-500 text-xs">
                    Updated moments ago
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  return <View className="flex-1 bg-gray-50">{pageContent}</View>;
}
