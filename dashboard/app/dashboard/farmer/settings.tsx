import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
} from "react-native";
import {
  Sprout,
  ShieldCheck,
  HandCoins,
  Smartphone,
  RefreshCw,
  Wallet,
  Calendar,
  FileText,
} from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import WalletSettingsSection from "@/components/wallet/WalletSettingsSection";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useSubsidyPayout } from "@/hooks/useBlockchain";
import { formatEther } from "viem";
import { formatCurrency } from "@/components/farmer/farm-produce/utils";
import { useEthToMyr } from "@/hooks/useEthToMyr";
import { useReport } from "@/hooks/useReport";
import { CreateReportDtoReportType } from "@/api";
import { useAppLayout } from '@/components/layout';

const connectionSteps = [
  "Install MetaMask on web or use the built-in AppKit button on mobile.",
  "Tap “Connect Wallet” and select the wallet that will receive subsidies and crop payments.",
  "Approve the request in your wallet to link it to your farmer profile for future transactions.",
];

const walletTips = [
  {
    title: "Keep keys safe",
    description:
      "Never share your recovery phrase. Use biometrics or hardware wallets when possible.",
    icon: ShieldCheck,
  },
  {
    title: "Use one wallet for payouts",
    description:
      "Connecting a single wallet helps keep subsidy payouts consistent and auditable.",
    icon: HandCoins,
  },
  {
    title: "Mobile ready",
    description:
      "On mobile, AppKit opens your installed wallet apps automatically.",
    icon: Smartphone,
  },
];

const highlightCards = [
  {
    title: "Receive subsidies",
    description:
      "Your connected wallet is used for subsidy releases and insurance claims, reducing delays.",
  },
  {
    title: "Sign produce updates",
    description:
      "Use the same wallet to sign important farm updates and batch submissions for traceability.",
  },
  {
    title: "Switch anytime",
    description:
      "Need a different payout wallet? Reconnect with a new address to update your profile.",
  },
];

export default function FarmerWalletSettings() {
  const { isDesktop } = useResponsiveLayout();
  const { walletAddress, publicClient } = useSubsidyPayout();
  const { ethToMyr: ethToMyrRate } = useEthToMyr();
  const { generateReport, isGenerating } = useReport();
  const [walletBalance, setWalletBalance] = useState<bigint>(0n);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [selectedType, setSelectedType] = useState<CreateReportDtoReportType>(
    CreateReportDtoReportType.FINANCIAL_REPORT
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [farmId, setFarmId] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);
  const isWeb = Platform.OS === "web";

  // Cache for balance with 5-minute TTL
  const balanceCache = useRef<{
    balance: bigint;
    timestamp: number;
    address: string;
  } | null>(null);
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  useAppLayout({
    title: "Wallet settings",
    subtitle:
      "Connect your wallet for payouts, subsidies, and on-chain updates",
  });

  const loadBalance = useCallback(async () => {
    // Don't request if wallet is not connected
    if (!walletAddress || !publicClient) {
      setWalletBalance(0n);
      balanceCache.current = null;
      return;
    }

    // Check cache validity
    const now = Date.now();
    if (
      balanceCache.current &&
      balanceCache.current.address === walletAddress &&
      now - balanceCache.current.timestamp < CACHE_TTL
    ) {
      // Use cached balance
      setWalletBalance(balanceCache.current.balance);
      return;
    }

    // Fetch new balance
    setIsLoadingBalance(true);
    try {
      const balance = await publicClient.getBalance({
        address: walletAddress,
      });
      setWalletBalance(balance);
      // Update cache
      balanceCache.current = {
        balance,
        timestamp: now,
        address: walletAddress,
      };
    } catch (error) {
      console.error("Error loading wallet balance:", error);
    } finally {
      setIsLoadingBalance(false);
    }
  }, [walletAddress, publicClient, CACHE_TTL]);

  useEffect(() => {
    // Only set up interval if wallet is connected
    if (!walletAddress || !publicClient) {
      setWalletBalance(0n);
      balanceCache.current = null;
      return;
    }

    // Load balance immediately
    loadBalance();

    // Refresh balance every 5 minutes
    const interval = setInterval(loadBalance, CACHE_TTL);
    return () => clearInterval(interval);
  }, [walletAddress, publicClient, loadBalance, CACHE_TTL]);

  const balanceEthFormatted = (() => {
    const balance = formatEther(walletBalance);
    const numBalance = parseFloat(balance);
    if (isNaN(numBalance)) return "0.0000";
    return numBalance.toLocaleString("en-MY", {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    });
  })();
  const balanceMyr = ethToMyrRate
    ? parseFloat(formatEther(walletBalance)) * ethToMyrRate
    : null;

  const statusOptions = useMemo(() => {
    if (selectedType === CreateReportDtoReportType.PRODUCE_REPORT) {
      return [
        "DRAFT",
        "PENDING_CHAIN",
        "ONCHAIN_CONFIRMED",
        "IN_TRANSIT",
        "ARRIVED",
        "RETAILER_VERIFIED",
        "ARCHIVED",
      ];
    }
    return [];
  }, [selectedType]);

  const reportTypes: { key: CreateReportDtoReportType; label: string }[] = [
    { key: CreateReportDtoReportType.FINANCIAL_REPORT, label: "Financial" },
    { key: CreateReportDtoReportType.PRODUCE_REPORT, label: "Produce" },
  ];

  const handleGenerate = async () => {
    try {
      setStatusMessage(null);

      const trimmedFarmId = farmId.trim() || undefined;
      const trimmedDateFrom = dateFrom.trim() || undefined;
      const trimmedDateTo = dateTo.trim() || undefined;
      const trimmedStatus = statusFilter.trim() || undefined;

      const created = await generateReport({
        reportType: selectedType,
        farmId:
          selectedType === CreateReportDtoReportType.PRODUCE_REPORT
            ? trimmedFarmId
            : undefined,
        dateFrom:
          selectedType === CreateReportDtoReportType.PRODUCE_REPORT
            ? trimmedDateFrom
            : undefined,
        dateTo:
          selectedType === CreateReportDtoReportType.PRODUCE_REPORT
            ? trimmedDateTo
            : undefined,
        status:
          selectedType === CreateReportDtoReportType.PRODUCE_REPORT
            ? trimmedStatus
            : undefined,
      });

      if (!created?.id) {
        setStatusMessage("Report request sent, but no report id was returned.");
        return;
      }

      const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "";
      const base = apiUrl.replace(/\/$/, "");
      const downloadUrl = `${base}/reports/${created.id}/download`;

      setStatusMessage("Opening PDF in browser to download locally...");

      Linking.openURL(downloadUrl).catch(() => {
        setStatusMessage(
          "Report created, but failed to open the download link."
        );
      });
    } catch {
      setStatusMessage("Failed to start report generation. Please try again.");
    }
  };

  return (
    <ScrollView className="flex-1">
      <View className={isDesktop ? "px-6 py-5 gap-5" : "px-4 py-4 gap-4"}>
        <WalletSettingsSection
          audience="Farmer"
          title="Connect your farmer wallet"
          subtitle="Link the wallet that will receive subsidies and sign produce updates. You stay in control—keys never leave your device."
          steps={connectionSteps}
          tips={walletTips}
        />

        {/* Wallet Balance Card */}
        <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 items-center justify-center">
              <Wallet color="#047857" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 dark:text-gray-100 text-lg font-bold">
                Wallet Balance
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                Your connected wallet&apos;s native ETH balance
              </Text>
            </View>
          </View>

          <View className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Your Wallet Balance
              </Text>
              <TouchableOpacity
                onPress={loadBalance}
                disabled={isLoadingBalance}
                className="p-1"
              >
                <RefreshCw
                  color="#9ca3af"
                  size={16}
                  style={{
                    transform: [
                      { rotate: isLoadingBalance ? "180deg" : "0deg" },
                    ],
                  }}
                />
              </TouchableOpacity>
            </View>
            <View className="flex-row items-baseline gap-2">
              <Text className="text-gray-900 dark:text-gray-100 text-2xl font-bold">
                {balanceEthFormatted} ETH
              </Text>
              {balanceMyr && (
                <Text className="text-gray-500 dark:text-gray-300 text-sm">
                  ≈{formatCurrency(balanceMyr)}
                </Text>
              )}
            </View>
            {!walletAddress && (
              <Text className="text-amber-600 dark:text-amber-500 text-xs mt-2">
                Connect your wallet to view balance
              </Text>
            )}
          </View>
        </View>

        <View className={isDesktop ? "flex-row gap-4" : "gap-3"}>
          {highlightCards.map((card) => (
            <View
              key={card.title}
              className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
            >
              <View className="flex-row items-center gap-2 mb-2">
                <View className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 items-center justify-center">
                  <Sprout color="#047857" size={18} />
                </View>
                <Text className="text-gray-900 dark:text-gray-100 text-base font-semibold">
                  {card.title}
                </Text>
              </View>
              <Text className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {card.description}
              </Text>
            </View>
          ))}
        </View>

        {/* Report Generation Section */}
        <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 items-center justify-center">
              <FileText color="#047857" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 dark:text-gray-100 text-lg font-bold">
                Generate Report
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                Select a report type and generate a PDF using your farm data
              </Text>
            </View>
          </View>

          <View className="mb-4">
            {selectedType === CreateReportDtoReportType.PRODUCE_REPORT && (
              <>
                <Text className="text-gray-800 dark:text-gray-300 text-xs font-semibold mb-1">
                  Farm ID (optional)
                </Text>
                <TextInput
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter farm ID"
                  value={farmId}
                  onChangeText={setFarmId}
                  editable={!isGenerating}
                />
              </>
            )}

            {selectedType === CreateReportDtoReportType.PRODUCE_REPORT && (
              <>
                <Text className="text-gray-800 dark:text-gray-300 text-xs font-semibold mb-1">
                  Date From (ISO 8601, optional)
                </Text>
                <View className="flex-row items-center rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 mb-2">
                  <Calendar color="#9ca3af" size={20} />
                  {isWeb ? (
                    <input
                      type="date"
                      value={dateFrom ? dateFrom.split("T")[0] : ""}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="flex-1 ml-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 outline-none"
                      style={{ border: "none", padding: 0 }}
                    />
                  ) : (
                    <>
                      <Text
                        onPress={() => setShowDateFromPicker(true)}
                        className="flex-1 ml-3 text-gray-900 dark:text-gray-100 text-base"
                      >
                        {dateFrom ? dateFrom.split("T")[0] : "Select date"}
                      </Text>
                      {showDateFromPicker && (
                        <DateTimePicker
                          value={dateFrom ? new Date(dateFrom) : new Date()}
                          mode="date"
                          display="default"
                          onChange={(_, selectedDate) => {
                            setShowDateFromPicker(false);
                            if (selectedDate) {
                              setDateFrom(
                                selectedDate.toISOString().split("T")[0]
                              );
                            }
                          }}
                        />
                      )}
                    </>
                  )}
                </View>

                <Text className="text-gray-800 dark:text-gray-300 text-xs font-semibold mb-1">
                  Date To (ISO 8601, optional)
                </Text>
                <View className="flex-row items-center rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 mb-2">
                  <Calendar color="#9ca3af" size={20} />
                  {isWeb ? (
                    <input
                      type="date"
                      value={dateTo ? dateTo.split("T")[0] : ""}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="flex-1 ml-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 outline-none"
                      style={{ border: "none", padding: 0 }}
                    />
                  ) : (
                    <>
                      <Text
                        onPress={() => setShowDateToPicker(true)}
                        className="flex-1 ml-3 text-gray-900 dark:text-gray-100 text-base"
                      >
                        {dateTo ? dateTo.split("T")[0] : "Select date"}
                      </Text>
                      {showDateToPicker && (
                        <DateTimePicker
                          value={dateTo ? new Date(dateTo) : new Date()}
                          mode="date"
                          display="default"
                          onChange={(_, selectedDate) => {
                            setShowDateToPicker(false);
                            if (selectedDate) {
                              setDateTo(
                                selectedDate.toISOString().split("T")[0]
                              );
                            }
                          }}
                        />
                      )}
                    </>
                  )}
                </View>
              </>
            )}

            {statusOptions.length > 0 && (
              <View className="mt-2">
                <Text className="text-gray-800 dark:text-gray-300 text-xs font-semibold mb-1">
                  Status Filter (optional)
                </Text>
                <View className="flex-row flex-wrap">
                  {statusOptions.map((status) => {
                    const isActive = statusFilter === status;
                    return (
                      <TouchableOpacity
                        key={status}
                        className={`px-3 py-1 mr-2 mb-2 rounded-full border ${
                          isActive
                            ? "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-500 dark:border-emerald-600"
                            : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        }`}
                        onPress={() => setStatusFilter(isActive ? "" : status)}
                        disabled={isGenerating}
                      >
                        <Text
                          className={`text-xs ${
                            isActive
                              ? "text-emerald-700 dark:text-emerald-300 font-semibold"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {status}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          <View className="flex-row flex-wrap mb-4">
            {reportTypes.map((type) => {
              const isActive = selectedType === type.key;
              return (
                <TouchableOpacity
                  key={type.key}
                  className={`px-3 py-2 mr-2 mb-2 rounded-full border ${
                    isActive
                      ? "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-500 dark:border-emerald-600"
                      : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  }`}
                  onPress={() => setSelectedType(type.key)}
                  disabled={isGenerating}
                >
                  <Text
                    className={`text-sm ${
                      isActive
                        ? "text-emerald-700 dark:text-emerald-300 font-semibold"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View className="flex-row mt-1 gap-3">
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 px-4 py-3 border border-gray-300 dark:border-gray-600"
              onPress={() => {
                setFarmId("");
                setDateFrom("");
                setDateTo("");
                setStatusFilter("");
              }}
              disabled={isGenerating}
            >
              <Text className="text-gray-800 dark:text-gray-200 font-semibold text-base">
                Clear Filters
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center rounded-lg bg-emerald-600 px-4 py-3"
              onPress={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Generate Report
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {statusMessage && (
            <Text className="text-gray-600 dark:text-gray-400 text-xs mt-3">
              {statusMessage}
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
