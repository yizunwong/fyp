import { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import {
  Shield,
  Wallet,
  Link,
  Bell,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Calendar,
  FileText,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-toast-message";
import WalletSettingsSection from "@/components/wallet/WalletSettingsSection";
import { useAgencyLayout } from "@/components/agency/layout/AgencyLayoutContext";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useSubsidyPayout } from "@/hooks/useBlockchain";
import { formatEther } from "viem";
import { formatCurrency } from "@/components/farmer/farm-produce/utils";
import { useEthToMyr } from "@/hooks/useEthToMyr";
import useAuth from "@/hooks/useAuth";
import { CreateReportDtoReportType } from "@/api";
import { useReport } from "@/hooks/useReport";
import { useUserProfile } from "@/hooks/useUserManagement";

const connectionSteps = [
  "Install MetaMask on web or use the in-app AppKit button on mobile.",
  "Tap “Connect Wallet” and pick the agency account that will sign approvals.",
  "Approve the request in your wallet. Your selected address will be used for on-chain approvals and payouts.",
];

const walletTips = [
  {
    title: "Use official networks",
    description:
      "Mainnet and Sepolia are supported. Use Hardhat only for sandbox testing.",
    icon: Link,
  },
  {
    title: "Keep approvals secure",
    description:
      "Only officers with signing permission should connect. Never share seed phrases.",
    icon: Shield,
  },
  {
    title: "Enable notifications",
    description:
      "Turn on wallet notifications so you don’t miss approval or payout prompts.",
    icon: Bell,
  },
];

const highlightCards = [
  {
    title: "Approvals & subsidies",
    description:
      "Use your connected wallet to sign farm approvals and release subsidy payouts directly on-chain.",
  },
  {
    title: "Traceability",
    description:
      "Every approval leaves an auditable transaction hash so farmers and auditors can verify actions.",
  },
  {
    title: "Role-based access",
    description:
      "Only authenticated agency users inside the portal can trigger wallet requests from this page.",
  },
];

export default function AgencyWalletSettings() {
  const { isDesktop } = useResponsiveLayout();
  const {
    deposit,
    getAgencyBalance,
    walletAddress,
    isWriting,
    isWaitingReceipt,
  } = useSubsidyPayout();
  const { ethToMyr: ethToMyrRate } = useEthToMyr();
  const { generateReport, isGenerating } = useReport();
  const [depositAmount, setDepositAmount] = useState("");
  const [agencyBalance, setAgencyBalance] = useState<bigint>(0n);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [agencyName, setAgencyName] = useState("");
  const [department, setDepartment] = useState("");
  const { updateProfile, isUpdatingProfile } = useAuth();
  const { profile, isLoading: isProfileLoading } = useUserProfile();
  const [selectedType, setSelectedType] = useState<CreateReportDtoReportType>(
    CreateReportDtoReportType.SUBSIDY_REPORT
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [programTypeFilter, setProgramTypeFilter] = useState<string>("");
  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);
  const isWeb = Platform.OS === "web";

  useAgencyLayout({
    title: "Wallet settings",
    subtitle: "Link the agency wallet for approvals, payouts, and audit trails",
  });

  useEffect(() => {
    if (profile?.agency) {
      setAgencyName(profile.agency.agencyName);
      setDepartment(profile.agency.department);
    }
  }, [profile?.agency]);

  const handleSaveProfile = async () => {
    if (!agencyName.trim() || !department.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing information",
        text2: "Agency name and department are required",
      });
      return;
    }

    try {
      await updateProfile({
        agencyName: agencyName.trim(),
        department: department.trim(),
      });
      Toast.show({
        type: "success",
        text1: "Profile saved",
        text2: "Agency profile has been updated",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Failed to save",
        text2: error?.message || "Could not save profile",
      });
    }
  };

  const loadBalance = useCallback(async () => {
    if (!walletAddress) {
      setAgencyBalance(0n);
      return;
    }
    setIsLoadingBalance(true);
    try {
      const balance = await getAgencyBalance();
      setAgencyBalance(balance);
    } catch (error) {
      console.error("Error loading balance:", error);
    } finally {
      setIsLoadingBalance(false);
    }
  }, [walletAddress, getAgencyBalance]);

  useEffect(() => {
    loadBalance();
    // Refresh balance periodically
    const interval = setInterval(loadBalance, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, [loadBalance]);

  const handleDeposit = async () => {
    if (!walletAddress) {
      Toast.show({
        type: "error",
        text1: "Wallet not connected",
        text2: "Please connect your wallet first",
      });
      return;
    }

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      Toast.show({
        type: "error",
        text1: "Invalid amount",
        text2: "Please enter a valid amount greater than 0",
      });
      return;
    }

    try {
      Toast.show({
        type: "info",
        text1: "Depositing funds...",
        text2: "Please confirm the transaction in your wallet",
      });

      await deposit(depositAmount);

      Toast.show({
        type: "success",
        text1: "Deposit successful",
        text2: `${depositAmount} ETH has been deposited to your agency balance`,
      });

      setDepositAmount("");
      // Refresh balance after a short delay to allow transaction to be mined
      setTimeout(loadBalance, 2000);
    } catch (error: any) {
      console.error("Error depositing:", error);
      const errorMessage =
        error?.message || error?.shortMessage || "Failed to deposit funds";
      Toast.show({
        type: "error",
        text1: "Deposit failed",
        text2: errorMessage,
      });
    }
  };

  const balanceEth = formatEther(agencyBalance);
  const balanceMyr = ethToMyrRate
    ? parseFloat(balanceEth) * ethToMyrRate
    : null;
  const isDepositing = isWriting || isWaitingReceipt;

  const statusOptions = useMemo(() => {
    if (selectedType === CreateReportDtoReportType.SUBSIDY_REPORT) {
      return ["PENDING", "APPROVED", "REJECTED", "DISBURSED"];
    }
    if (selectedType === CreateReportDtoReportType.PROGRAM_REPORT) {
      return ["DRAFT", "ACTIVE"];
    }
    return [];
  }, [selectedType]);

  const programTypeOptions = useMemo(() => {
    if (selectedType === CreateReportDtoReportType.PROGRAM_REPORT) {
      return ["DROUGHT", "FLOOD", "CROP_LOSS"];
    }
    return [];
  }, [selectedType]);

  const reportTypes: { key: CreateReportDtoReportType; label: string }[] = [
    { key: CreateReportDtoReportType.SUBSIDY_REPORT, label: "Subsidies" },
    { key: CreateReportDtoReportType.PROGRAM_REPORT, label: "Programs" },
  ];

  const handleGenerate = async () => {
    try {
      setStatusMessage(null);

      const trimmedDateFrom = dateFrom.trim() || undefined;
      const trimmedDateTo = dateTo.trim() || undefined;
      const trimmedStatus = statusFilter.trim() || undefined;
      const trimmedProgramType = programTypeFilter.trim() || undefined;

      const created = await generateReport({
        reportType: selectedType,
        dateFrom:
          selectedType === CreateReportDtoReportType.SUBSIDY_REPORT ||
          selectedType === CreateReportDtoReportType.PROGRAM_REPORT
            ? trimmedDateFrom
            : undefined,
        dateTo:
          selectedType === CreateReportDtoReportType.SUBSIDY_REPORT ||
          selectedType === CreateReportDtoReportType.PROGRAM_REPORT
            ? trimmedDateTo
            : undefined,
        status:
          selectedType === CreateReportDtoReportType.SUBSIDY_REPORT ||
          selectedType === CreateReportDtoReportType.PROGRAM_REPORT
            ? trimmedStatus
            : undefined,
        programType:
          selectedType === CreateReportDtoReportType.PROGRAM_REPORT
            ? trimmedProgramType
            : undefined,
        ethToMyr:
          selectedType === CreateReportDtoReportType.SUBSIDY_REPORT
            ? ethToMyrRate ?? undefined
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
      <View className={isDesktop ? "px-8 py-6 gap-5" : "px-4 py-4 gap-4"}>
        <View className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
              <Shield color="#2563eb" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-lg font-bold">
                Agency Profile
              </Text>
              <Text className="text-gray-600 text-sm">
                Provide agency details to enable role-specific features
              </Text>
            </View>
          </View>

          <View className="gap-3">
            <View>
              <Text className="text-gray-700 text-sm font-semibold mb-2">
                Agency Name
              </Text>
              <TextInput
                value={agencyName}
                onChangeText={setAgencyName}
                placeholder="Enter agency name"
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-base"
                placeholderTextColor="#9ca3af"
                autoCapitalize="words"
              />
            </View>

            <View>
              <Text className="text-gray-700 text-sm font-semibold mb-2">
                Department
              </Text>
              <TextInput
                value={department}
                onChangeText={setDepartment}
                placeholder="Enter department"
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-base"
                placeholderTextColor="#9ca3af"
                autoCapitalize="words"
              />
            </View>

            <TouchableOpacity
              onPress={handleSaveProfile}
              disabled={isUpdatingProfile || isProfileLoading}
              className={`rounded-lg overflow-hidden ${
                isUpdatingProfile || isProfileLoading ? "opacity-50" : ""
              }`}
            >
              <LinearGradient
                colors={["#2563eb", "#1d4ed8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="flex-row items-center justify-center gap-2 py-3 rounded-lg"
              >
                <Shield color="#fff" size={18} />
                <Text className="text-white text-sm font-semibold">
                  {isProfileLoading
                    ? "Loading..."
                    : isUpdatingProfile
                    ? "Saving..."
                    : "Save Profile"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <WalletSettingsSection
          audience="Agency"
          title="Connect the agency wallet"
          subtitle="Authorize one wallet to sign approvals and payouts. You can switch accounts anytime using the connect button."
          steps={connectionSteps}
          tips={walletTips}
        />

        {/* Fund Smart Contract Section */}
        <View className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
              <DollarSign color="#2563eb" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-lg font-bold">
                Fund Smart Contract
              </Text>
              <Text className="text-gray-600 text-sm">
                Deposit funds to your agency balance for subsidy payouts
              </Text>
            </View>
          </View>

          {/* Current Balance */}
          <View className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-gray-600 text-sm font-medium">
                Your Agency Balance
              </Text>
              <TouchableOpacity
                onPress={loadBalance}
                disabled={isLoadingBalance}
                className="p-1"
              >
                <RefreshCw
                  color="#6b7280"
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
              <Text className="text-gray-900 text-2xl font-bold">
                {balanceEth} ETH
              </Text>
              {balanceMyr && (
                <Text className="text-gray-500 text-sm">
                  ≈ {formatCurrency(balanceMyr)}
                </Text>
              )}
            </View>
            {!walletAddress && (
              <Text className="text-amber-600 text-xs mt-2">
                Connect your wallet to view balance
              </Text>
            )}
          </View>

          {/* Deposit Form */}
          <View className="gap-3">
            <View>
              <Text className="text-gray-700 text-sm font-semibold mb-2">
                Deposit Amount (ETH)
              </Text>
              <TextInput
                value={depositAmount}
                onChangeText={setDepositAmount}
                placeholder="0.0"
                keyboardType="decimal-pad"
                editable={!isDepositing && !!walletAddress}
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-base"
                placeholderTextColor="#9ca3af"
              />
              {depositAmount &&
                !isNaN(parseFloat(depositAmount)) &&
                ethToMyrRate && (
                  <Text className="text-gray-500 text-xs mt-1">
                    ≈ {formatCurrency(parseFloat(depositAmount) * ethToMyrRate)}
                  </Text>
                )}
            </View>

            <TouchableOpacity
              onPress={handleDeposit}
              disabled={isDepositing || !walletAddress || !depositAmount}
              className="rounded-lg overflow-hidden"
            >
              <LinearGradient
                colors={["#2563eb", "#1d4ed8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className={`flex-row items-center justify-center gap-2 py-3 ${
                  isDepositing || !walletAddress || !depositAmount
                    ? "opacity-50"
                    : ""
                }`}
              >
                <TrendingUp color="#fff" size={18} />
                <Text className="text-white text-sm font-semibold">
                  {isDepositing ? "Depositing..." : "Deposit Funds"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {!walletAddress && (
              <Text className="text-amber-600 text-xs text-center">
                Please connect your wallet to deposit funds
              </Text>
            )}
          </View>

          {/* Info Box */}
          <View className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <Text className="text-blue-800 text-xs leading-relaxed">
              <Text className="font-semibold">Note:</Text> Funds deposited here
              are used exclusively for your agency&apos;s subsidy payouts. Each
              agency maintains a separate balance, ensuring proper fund
              allocation and accountability.
            </Text>
          </View>
        </View>

        <View className={isDesktop ? "flex-row gap-4" : "gap-3"}>
          {highlightCards.map((card) => (
            <View
              key={card.title}
              className="flex-1 bg-white rounded-2xl border border-gray-200 p-4 shadow-sm"
            >
              <View className="flex-row items-center gap-2 mb-2">
                <View className="w-8 h-8 rounded-full bg-emerald-50 items-center justify-center">
                  <Wallet color="#047857" size={18} />
                </View>
                <Text className="text-gray-900 text-base font-semibold">
                  {card.title}
                </Text>
              </View>
              <Text className="text-gray-600 text-sm leading-relaxed">
                {card.description}
              </Text>
            </View>
          ))}
        </View>

        {/* Report Generation Section */}
        <View className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
              <FileText color="#2563eb" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-lg font-bold">
                Generate Report
              </Text>
              <Text className="text-gray-600 text-sm">
                Select a report type and generate a PDF using agency data
              </Text>
            </View>
          </View>

          <View className="mb-4">
            {(selectedType === CreateReportDtoReportType.SUBSIDY_REPORT ||
              selectedType === CreateReportDtoReportType.PROGRAM_REPORT) && (
              <>
                <Text className="text-gray-800 text-xs font-semibold mb-1">
                  Date From (ISO 8601, optional)
                </Text>
                <View className="flex-row items-center rounded-xl border border-gray-300 bg-white px-3 py-2 mb-2">
                  <Calendar color="#6b7280" size={20} />
                  {isWeb ? (
                    <input
                      type="date"
                      value={dateFrom ? dateFrom.split("T")[0] : ""}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="flex-1 ml-3 text-gray-900 bg-white outline-none"
                      style={{ border: "none", padding: 0 }}
                    />
                  ) : (
                    <>
                      <Text
                        onPress={() => setShowDateFromPicker(true)}
                        className="flex-1 ml-3 text-gray-900 text-base"
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

                <Text className="text-gray-800 text-xs font-semibold mb-1">
                  Date To (ISO 8601, optional)
                </Text>
                <View className="flex-row items-center rounded-xl border border-gray-300 bg-white px-3 py-2 mb-2">
                  <Calendar color="#6b7280" size={20} />
                  {isWeb ? (
                    <input
                      type="date"
                      value={dateTo ? dateTo.split("T")[0] : ""}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="flex-1 ml-3 text-gray-900 bg-white outline-none"
                      style={{ border: "none", padding: 0 }}
                    />
                  ) : (
                    <>
                      <Text
                        onPress={() => setShowDateToPicker(true)}
                        className="flex-1 ml-3 text-gray-900 text-base"
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
                <Text className="text-gray-800 text-xs font-semibold mb-1">
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
                            ? "bg-emerald-100 border-emerald-500"
                            : "bg-white border-gray-300"
                        }`}
                        onPress={() => setStatusFilter(isActive ? "" : status)}
                        disabled={isGenerating}
                      >
                        <Text
                          className={`text-xs ${
                            isActive
                              ? "text-emerald-700 font-semibold"
                              : "text-gray-700"
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

            {programTypeOptions.length > 0 && (
              <View className="mt-2">
                <Text className="text-gray-800 text-xs font-semibold mb-1">
                  Program Type Filter (optional)
                </Text>
                <View className="flex-row flex-wrap">
                  {programTypeOptions.map((type) => {
                    const isActive = programTypeFilter === type;
                    return (
                      <TouchableOpacity
                        key={type}
                        className={`px-3 py-1 mr-2 mb-2 rounded-full border ${
                          isActive
                            ? "bg-emerald-100 border-emerald-500"
                            : "bg-white border-gray-300"
                        }`}
                        onPress={() =>
                          setProgramTypeFilter(isActive ? "" : type)
                        }
                        disabled={isGenerating}
                      >
                        <Text
                          className={`text-xs ${
                            isActive
                              ? "text-emerald-700 font-semibold"
                              : "text-gray-700"
                          }`}
                        >
                          {type.replace(/_/g, " ")}
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
                      ? "bg-blue-100 border-blue-500"
                      : "bg-white border-gray-300"
                  }`}
                  onPress={() => setSelectedType(type.key)}
                  disabled={isGenerating}
                >
                  <Text
                    className={`text-sm ${
                      isActive ? "text-blue-700 font-semibold" : "text-gray-700"
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
              className="flex-1 flex-row items-center justify-center rounded-lg bg-gray-100 px-4 py-3 border border-gray-300"
              onPress={() => {
                setDateFrom("");
                setDateTo("");
                setStatusFilter("");
                setProgramTypeFilter("");
              }}
              disabled={isGenerating}
            >
              <Text className="text-gray-800 font-semibold text-base">
                Clear Filters
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center rounded-lg bg-blue-600 px-4 py-3"
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
            <Text className="text-gray-600 text-xs mt-3">{statusMessage}</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
