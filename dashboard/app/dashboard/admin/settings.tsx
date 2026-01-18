import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Linking,
  Platform,
} from "react-native";
import { useReport } from "@/hooks/useReport";
import { useEthToMyr } from "@/hooks/useEthToMyr";
import { CreateReportDtoReportType } from "@/api";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar, LogOut } from "lucide-react-native";
import { useAppLayout } from "@/components/layout/AppLayoutContext";
import { useSession } from "@/contexts/SessionContext";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";

export default function AdminSettingsScreen() {
  const { generateReport, isGenerating } = useReport();
  const { ethToMyr } = useEthToMyr();
  const { isMobile } = useResponsiveLayout();
  const { signOut } = useSession();
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<CreateReportDtoReportType>(
    CreateReportDtoReportType.FARM_SUMMARY
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [farmId, setFarmId] = useState<string>("");
  const [farmState, setFarmState] = useState<string>("");
  const [farmDistrict, setFarmDistrict] = useState<string>("");
  const [minFarmSize, setMinFarmSize] = useState<string>("");
  const [maxFarmSize, setMaxFarmSize] = useState<string>("");
  const [farmVerificationStatus, setFarmVerificationStatus] =
    useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [programTypeFilter, setProgramTypeFilter] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("");
  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isWeb = Platform.OS === "web";

  useAppLayout({
    title: "Settings",
    subtitle: "Configure system settings and generate reports",
  });

  const statusOptions = useMemo(() => {
    if (selectedType === CreateReportDtoReportType.SUBSIDY_REPORT) {
      // Matches SubsidyStatus enum in prisma schema
      return ["PENDING", "APPROVED", "REJECTED", "DISBURSED"];
    }
    if (selectedType === CreateReportDtoReportType.PRODUCE_REPORT) {
      // Matches ProduceStatus enum in prisma schema
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
    if (selectedType === CreateReportDtoReportType.PROGRAM_REPORT) {
      // Matches ProgramStatus enum in prisma schema
      return ["DRAFT", "ACTIVE"];
    }
    return [];
  }, [selectedType]);

  const programTypeOptions = useMemo(() => {
    if (selectedType === CreateReportDtoReportType.PROGRAM_REPORT) {
      // Matches ProgramType enum in prisma schema (only flood is auto-handled by Chainlink)
      return ["DROUGHT", "FLOOD", "CROP_LOSS"];
    }
    return [];
  }, [selectedType]);

  const handleGenerate = async () => {
    try {
      setStatusMessage(null);

      const trimmedFarmId = farmId.trim() || undefined;
      const trimmedFarmState = farmState.trim() || undefined;
      const trimmedFarmDistrict = farmDistrict.trim() || undefined;
      const trimmedMinFarmSize = minFarmSize.trim() || undefined;
      const trimmedMaxFarmSize = maxFarmSize.trim() || undefined;
      const trimmedFarmVerificationStatus =
        farmVerificationStatus.trim() || undefined;
      const trimmedDateFrom = dateFrom.trim() || undefined;
      const trimmedDateTo = dateTo.trim() || undefined;
      const trimmedStatus = statusFilter.trim() || undefined;
      const trimmedProgramType = programTypeFilter.trim() || undefined;
      const trimmedAction = actionFilter.trim() || undefined;

      const created = await generateReport({
        reportType: selectedType,
        farmId:
          selectedType === CreateReportDtoReportType.FARM_SUMMARY ||
          selectedType === CreateReportDtoReportType.PRODUCE_REPORT
            ? trimmedFarmId
            : undefined,
        state:
          selectedType === CreateReportDtoReportType.FARM_SUMMARY
            ? trimmedFarmState
            : undefined,
        district:
          selectedType === CreateReportDtoReportType.FARM_SUMMARY
            ? trimmedFarmDistrict
            : undefined,
        minFarmSize:
          selectedType === CreateReportDtoReportType.FARM_SUMMARY
            ? trimmedMinFarmSize
            : undefined,
        maxFarmSize:
          selectedType === CreateReportDtoReportType.FARM_SUMMARY
            ? trimmedMaxFarmSize
            : undefined,
        farmVerificationStatus:
          selectedType === CreateReportDtoReportType.FARM_SUMMARY
            ? trimmedFarmVerificationStatus
            : undefined,
        dateFrom:
          selectedType === CreateReportDtoReportType.SUBSIDY_REPORT ||
          selectedType === CreateReportDtoReportType.PRODUCE_REPORT ||
          selectedType === CreateReportDtoReportType.PROGRAM_REPORT ||
          selectedType === CreateReportDtoReportType.ACTIVITY_REPORT
            ? trimmedDateFrom
            : undefined,
        dateTo:
          selectedType === CreateReportDtoReportType.SUBSIDY_REPORT ||
          selectedType === CreateReportDtoReportType.PRODUCE_REPORT ||
          selectedType === CreateReportDtoReportType.PROGRAM_REPORT ||
          selectedType === CreateReportDtoReportType.ACTIVITY_REPORT
            ? trimmedDateTo
            : undefined,
        status:
          selectedType === CreateReportDtoReportType.SUBSIDY_REPORT ||
          selectedType === CreateReportDtoReportType.PRODUCE_REPORT ||
          selectedType === CreateReportDtoReportType.PROGRAM_REPORT
            ? trimmedStatus
            : undefined,
        programType:
          selectedType === CreateReportDtoReportType.PROGRAM_REPORT
            ? trimmedProgramType
            : undefined,
        action:
          selectedType === CreateReportDtoReportType.ACTIVITY_REPORT
            ? trimmedAction
            : undefined,
        ethToMyr:
          selectedType === CreateReportDtoReportType.SUBSIDY_REPORT
            ? ethToMyr ?? undefined
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

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      router.replace("/home");
      Toast.show({
        type: "success",
        text1: "Logged out",
        text2: "See you soon!",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Logout failed",
        text2: "Please try again.",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const reportTypes: { key: CreateReportDtoReportType; label: string }[] = [
    { key: CreateReportDtoReportType.FARM_SUMMARY, label: "Farm Summary" },
    { key: CreateReportDtoReportType.SUBSIDY_REPORT, label: "Subsidies" },
    { key: CreateReportDtoReportType.PRODUCE_REPORT, label: "Produce" },
    { key: CreateReportDtoReportType.PROGRAM_REPORT, label: "Programs" },
    { key: CreateReportDtoReportType.ACTIVITY_REPORT, label: "Activity" },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-dark-bg">
      <View className="px-6 py-6">

        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mt-2">
          <Text className="text-gray-900 dark:text-gray-100 text-lg font-semibold mb-2">
            Generate System Report
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Select a report type and generate a PDF using the latest system
            data.
          </Text>

          <View className="mb-4">
            {(selectedType === CreateReportDtoReportType.FARM_SUMMARY ||
              selectedType === CreateReportDtoReportType.PRODUCE_REPORT) && (
              <>
                <Text className="text-gray-800 dark:text-gray-200 text-xs font-semibold mb-1">
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

            {selectedType === CreateReportDtoReportType.FARM_SUMMARY && (
              <>
                <Text className="text-gray-800 dark:text-gray-200 text-xs font-semibold mb-1">
                  State (optional)
                </Text>
                <TextInput
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="e.g. Selangor"
                  value={farmState}
                  onChangeText={setFarmState}
                  editable={!isGenerating}
                />

                <Text className="text-gray-800 dark:text-gray-200 text-xs font-semibold mb-1">
                  District (optional)
                </Text>
                <TextInput
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="e.g. Petaling"
                  value={farmDistrict}
                  onChangeText={setFarmDistrict}
                  editable={!isGenerating}
                />

                <View className="flex-row gap-3 mb-2">
                  <View className="flex-1">
                    <Text className="text-gray-800 dark:text-gray-200 text-xs font-semibold mb-1">
                      Min Farm Size (optional)
                    </Text>
                    <TextInput
                      className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="e.g. 1.0"
                      keyboardType="numeric"
                      value={minFarmSize}
                      onChangeText={setMinFarmSize}
                      editable={!isGenerating}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-800 dark:text-gray-200 text-xs font-semibold mb-1">
                      Max Farm Size (optional)
                    </Text>
                    <TextInput
                      className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="e.g. 10.0"
                      keyboardType="numeric"
                      value={maxFarmSize}
                      onChangeText={setMaxFarmSize}
                      editable={!isGenerating}
                    />
                  </View>
                </View>

                <Text className="text-gray-800 dark:text-gray-200 text-xs font-semibold mb-1 mt-1">
                  Farm Verification Status (optional)
                </Text>
                <View className="flex-row flex-wrap mb-2">
                  {["PENDING", "VERIFIED", "REJECTED"].map((status) => {
                    const isActive = farmVerificationStatus === status;
                    return (
                      <TouchableOpacity
                        key={status}
                        className={`px-3 py-1 mr-2 mb-2 rounded-full border ${
                          isActive
                            ? "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-500 dark:border-emerald-600"
                            : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        }`}
                        onPress={() =>
                          setFarmVerificationStatus(isActive ? "" : status)
                        }
                        disabled={isGenerating}
                      >
                        <Text
                          className={`text-xs ${
                            isActive
                              ? "text-emerald-700 dark:text-emerald-500 font-semibold"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {status}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            {(selectedType === CreateReportDtoReportType.SUBSIDY_REPORT ||
              selectedType === CreateReportDtoReportType.PRODUCE_REPORT ||
              selectedType === CreateReportDtoReportType.PROGRAM_REPORT ||
              selectedType === CreateReportDtoReportType.ACTIVITY_REPORT) && (
              <>
                <Text className="text-gray-800 dark:text-gray-200 text-xs font-semibold mb-1">
                  Date From (ISO 8601, optional)
                </Text>
                <View className="flex-row items-center rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 mb-2">
                  <Calendar color="#6b7280" size={20} />
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

                <Text className="text-gray-800 dark:text-gray-200 text-xs font-semibold mb-1">
                  Date To (ISO 8601, optional)
                </Text>
                <View className="flex-row items-center rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 mb-2">
                  <Calendar color="#6b7280" size={20} />
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
                <Text className="text-gray-800 dark:text-gray-200 text-xs font-semibold mb-1">
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
                              ? "text-emerald-700 dark:text-emerald-500 font-semibold"
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

            {programTypeOptions.length > 0 && (
              <View className="mt-2">
                <Text className="text-gray-800 dark:text-gray-200 text-xs font-semibold mb-1">
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
                            ? "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-500 dark:border-emerald-600"
                            : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        }`}
                        onPress={() =>
                          setProgramTypeFilter(isActive ? "" : type)
                        }
                        disabled={isGenerating}
                      >
                        <Text
                          className={`text-xs ${
                            isActive
                              ? "text-emerald-700 dark:text-emerald-500 font-semibold"
                              : "text-gray-700 dark:text-gray-300"
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

            {selectedType === CreateReportDtoReportType.ACTIVITY_REPORT && (
              <>
                <Text className="text-gray-800 dark:text-gray-200 text-xs font-semibold mb-1">
                  Action Filter (optional)
                </Text>
                <TextInput
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="e.g. LOGIN, UPDATE_PROFILE"
                  placeholderTextColor="#9ca3af"
                  value={actionFilter}
                  onChangeText={setActionFilter}
                  editable={!isGenerating}
                />
              </>
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
                        ? "text-emerald-700 dark:text-emerald-500 font-semibold"
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
                setFarmState("");
                setFarmDistrict("");
                setMinFarmSize("");
                setMaxFarmSize("");
                setFarmVerificationStatus("");
                setDateFrom("");
                setDateTo("");
                setStatusFilter("");
                setProgramTypeFilter("");
                setActionFilter("");
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
            <Text className="text-gray-600 dark:text-gray-400 text-xs mt-3">{statusMessage}</Text>
          )}
        </View>

        {/* Logout Button - Mobile Only */}
        {isMobile && (
          <View className="bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-900/30 p-5 shadow-sm mt-4">
            <TouchableOpacity
              className="flex-row items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3"
              onPress={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <LogOut color="#fff" size={18} />
                  <Text className="text-white font-semibold text-base">
                    Logout
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
