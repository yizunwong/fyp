import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Archive, Plus } from "lucide-react-native";
import { router } from "expo-router";
import { useAgencyLayout } from "@/components/agency/layout/AgencyLayoutContext";
import { usePoliciesQuery } from "@/hooks/usePolicy";
import { PolicyResponseDtoStatus, type PolicyResponseDto } from "@/api";
import { PoliciesTable } from "@/components/agency/policy-management/PoliciesTable";
import { PolicyCard } from "@/components/agency/policy-management/PolicyCard";
import {
  PolicySummaryCards,
  PolicyStats,
} from "@/components/agency/policy-management/PolicySummaryCards";
import { formatDate } from '@/components/farmer/farm-produce/utils';

export default function PolicyManagementScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;
  useAgencyLayout({
    title: "Policy Management",
    subtitle: "Create and manage subsidy policies",
  });

  const {
    policies: policyDtos,
    isLoading: isLoadingPolicies,
    isFetching: isFetchingPolicies,
    error: policiesError,
    refetch: refetchPolicies,
  } = usePoliciesQuery();
  const [policies, setPolicies] = useState<PolicyResponseDto[]>([]);
  const [statusPickerPolicy, setStatusPickerPolicy] =
    useState<PolicyResponseDto | null>(null);

  useEffect(() => {
    setPolicies(policyDtos ?? []);
  }, [policyDtos]);

  const stats = useMemo<PolicyStats>(
    () => ({
      active: policies.filter(
        (p) => (p.status ?? "").toString().toLowerCase() === "active"
      ).length,
      draft: policies.filter(
        (p) => (p.status ?? "").toString().toLowerCase() === "draft"
      ).length,
      archived: policies.filter(
        (p) => (p.status ?? "").toString().toLowerCase() === "archived"
      ).length,
      total: policies.length,
    }),
    [policies]
  );


  const getStatusColor = (status: string | undefined | null) => {
    const statusValue = (status ?? "").toString().toLowerCase();
    switch (statusValue) {
      case "active":
        return "bg-green-100 text-green-700";
      case "draft":
        return "bg-yellow-100 text-yellow-700";
      case "archived":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeColor = (type: string | undefined | null) => {
    const typeValue = (type ?? "").toString().toLowerCase();
    switch (typeValue) {
      case "drought":
        return "bg-orange-100 text-orange-700";
      case "flood":
        return "bg-blue-100 text-blue-700";
      case "crop_loss":
        return "bg-red-100 text-red-700";
      case "manual":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const statusOrder: PolicyResponseDtoStatus[] = [
    PolicyResponseDtoStatus.draft,
    PolicyResponseDtoStatus.active,
    PolicyResponseDtoStatus.archived,
  ];

  const handleSelectStatus = (
    policyId: string,
    status: PolicyResponseDto["status"]
  ) => {
    setPolicies((prev) =>
      prev.map((p) => (p.id === policyId ? { ...p, status } : p))
    );
    // TODO: Wire up API mutation to persist status change.
    setStatusPickerPolicy(null);
  };

  const isInitialLoading =
    (isLoadingPolicies || isFetchingPolicies) && policies.length === 0;
  const shouldShowEmptyState =
    !isLoadingPolicies && !isFetchingPolicies && policies.length === 0;

  if (isInitialLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-700 mt-3">Loading policies...</Text>
      </View>
    );
  }

  if (policiesError && policies.length > 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-gray-900 text-xl font-bold mb-2">
          Failed to load policies
        </Text>
        <Text className="text-gray-600 text-sm mb-4">
          {policiesError as string}
        </Text>
        <TouchableOpacity
          onPress={() => refetchPolicies()}
          className="px-4 py-2 bg-blue-600 rounded-lg"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const pageContent = (
    <View className="px-6 py-6">
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-gray-900 text-xl font-bold">
            Policy Management
          </Text>
          <Text className="text-gray-600 text-sm">
            Create and manage subsidy policies
          </Text>
        </View>
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() =>
              router.push("/dashboard/agency/policies/create" as never)
            }
            className="flex-row items-center gap-2 px-4 py-2 bg-blue-500 rounded-lg"
          >
            <Plus color="#fff" size={18} />
            <Text className="text-white text-sm font-semibold">
              Create Policy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg">
            <Archive color="#6b7280" size={18} />
            <Text className="text-gray-700 text-sm font-semibold">
              Archived
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <PolicySummaryCards
        stats={stats}
        isDesktop={isDesktop}
        isFetchingPolicies={isFetchingPolicies}
      />
      {shouldShowEmptyState ? (
        <View className="bg-white border border-dashed border-gray-300 rounded-xl p-6 items-center justify-center">
          <Text className="text-gray-900 text-base font-semibold">
            No policies found
          </Text>
          <Text className="text-gray-600 text-sm mt-1 text-center">
            Create a new policy to get started or refresh to fetch the latest
            records.
          </Text>
          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
              onPress={() => refetchPolicies()}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg"
            >
              <Text className="text-gray-800 text-sm font-semibold">
                Refresh
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                router.push("/dashboard/agency/policies/create" as never)
              }
              className="px-4 py-2 bg-blue-500 rounded-lg"
            >
              <Text className="text-white text-sm font-semibold">
                Create Policy
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : isDesktop ? (
        <PoliciesTable
          policies={policies}
          isWeb={isWeb}
          onSelectStatus={handleSelectStatus}
          onOpenStatusPicker={setStatusPickerPolicy}
          statusOptions={statusOrder}
          getStatusColor={getStatusColor}
          getTypeColor={getTypeColor}
          formatDate={formatDate}
        />
      ) : (
        <View>
          {policies.map((policy) => (
            <PolicyCard
              key={policy.id}
              policy={policy}
              onOpenStatusPicker={setStatusPickerPolicy}
              getTypeColor={getTypeColor}
              getStatusColor={getStatusColor}
              formatDate={formatDate}
            />
          ))}
        </View>
      )}
    </View>
  );

  return (
    <>
      {!isWeb && (
        <Modal
          visible={Boolean(statusPickerPolicy)}
          transparent
          animationType="fade"
          onRequestClose={() => setStatusPickerPolicy(null)}
        >
          <Pressable
            className="flex-1 bg-black/30 justify-center px-6"
            onPress={() => setStatusPickerPolicy(null)}
          >
            <View className="bg-white rounded-2xl p-4 shadow-lg">
              <Text className="text-gray-900 text-base font-semibold mb-3">
                Change status
              </Text>
              <View className="gap-2">
                {statusOrder.map((status) => (
                  <TouchableOpacity
                    key={status}
                    onPress={() =>
                      statusPickerPolicy &&
                      handleSelectStatus(statusPickerPolicy.id, status)
                    }
                    className="px-4 py-2 border border-gray-200 rounded-lg"
                  >
                    <Text className="text-sm text-gray-800 capitalize">
                      {status.toLowerCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Pressable>
        </Modal>
      )}
      {isDesktop ? (
        pageContent
      ) : (
        <View className="flex-1 bg-gray-50">
          <ScrollView className="flex-1">{pageContent}</ScrollView>
        </View>
      )}
    </>
  );
}
