import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  useWindowDimensions,
  Modal,
  TextInput,
} from "react-native";
import {
  Plus,
  Archive,
  Edit,
  Eye,
  Calendar,
  AlertTriangle,
  CheckCircle,
  FileText,
  Settings,
  X,
  Save,
  Trash2,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAgencyLayout } from "@/components/agency/layout/AgencyLayoutContext";

interface EnvironmentalTrigger {
  parameter: string;
  operator: string;
  threshold: number;
  windowValue: number;
  windowUnit: "hours" | "days";
}

interface EligibilityCriteria {
  minFarmSize?: number;
  maxFarmSize?: number;
  states: string[];
  districts: string[];
  cropTypes: string[];
  certifications: string[];
}

interface PayoutRules {
  amount: number;
  frequency: string;
  maxCap: number;
  beneficiaryCategory: string;
}

interface Policy {
  id: string;
  name: string;
  description: string;
  type: "drought" | "flood" | "crop_loss" | "manual";
  startDate: string;
  endDate: string;
  status: "draft" | "active" | "archived";
  eligibility: EligibilityCriteria;
  environmentalTriggers: EnvironmentalTrigger[];
  payoutRules: PayoutRules;
  createdBy: string;
  lastModified: string;
}

const mockPolicies: Policy[] = [
  {
    id: "1",
    name: "Drought Relief Subsidy 2025",
    description:
      "Automatic subsidy for farms experiencing severe drought conditions",
    type: "drought",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    status: "active",
    eligibility: {
      minFarmSize: 5,
      maxFarmSize: 50,
      states: ["Kedah", "Perlis", "Penang"],
      districts: ["Kubang Pasu", "Kangar", "Seberang Perai"],
      cropTypes: ["Paddy", "Vegetables"],
      certifications: ["MyGAP"],
    },
    environmentalTriggers: [
      {
        parameter: "Rainfall",
        operator: "<",
        threshold: 50,
        windowValue: 30,
        windowUnit: "days",
      },
    ],
    payoutRules: {
      amount: 5000,
      frequency: "per_trigger",
      maxCap: 15000,
      beneficiaryCategory: "small_medium_farmers",
    },
    createdBy: "Officer Ahmad",
    lastModified: "2025-11-20",
  },
  {
    id: "2",
    name: "Flood Damage Compensation",
    description: "Emergency compensation for flood-affected farms",
    type: "flood",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    status: "active",
    eligibility: {
      minFarmSize: 1,
      states: ["Kelantan", "Terengganu", "Pahang"],
      districts: ["Kuala Krai", "Kemaman", "Kuantan"],
      cropTypes: ["Paddy", "Fruits", "Vegetables"],
      certifications: [],
    },
    environmentalTriggers: [
      {
        parameter: "Rainfall",
        operator: ">",
        threshold: 200,
        windowValue: 24,
        windowUnit: "hours",
      },
    ],
    payoutRules: {
      amount: 8000,
      frequency: "per_trigger",
      maxCap: 24000,
      beneficiaryCategory: "all_farmers",
    },
    createdBy: "Officer Fatimah",
    lastModified: "2025-11-18",
  },
  {
    id: "3",
    name: "Organic Farming Incentive",
    description: "Annual incentive for certified organic farmers",
    type: "manual",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    status: "draft",
    eligibility: {
      states: ["All"],
      districts: [],
      cropTypes: ["Vegetables", "Fruits", "Herbs"],
      certifications: ["Organic"],
    },
    environmentalTriggers: [],
    payoutRules: {
      amount: 10000,
      frequency: "annual",
      maxCap: 10000,
      beneficiaryCategory: "organic_farmers",
    },
    createdBy: "Officer Kumar",
    lastModified: "2025-11-15",
  },
];

export default function PolicyManagementScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;
  useAgencyLayout({
    title: "Policy Management",
    subtitle: "Create and manage subsidy policies",
  });

  const [policies, setPolicies] = useState<Policy[]>(mockPolicies);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [showEditorModal, setShowEditorModal] = useState(false);

  const stats = {
    active: policies.filter((p) => p.status === "active").length,
    draft: policies.filter((p) => p.status === "draft").length,
    archived: policies.filter((p) => p.status === "archived").length,
    total: policies.length,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getTypeColor = (type: string) => {
    switch (type) {
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

  const handleEditPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    setShowEditorModal(true);
  };

  const SummaryCards = () => (
    <View className={isDesktop ? "flex-row gap-4 mb-6" : "gap-3 mb-6"}>
      <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-green-50 rounded-lg items-center justify-center">
            <CheckCircle color="#15803d" size={20} />
          </View>
          <Text className="text-2xl font-bold text-gray-900">
            {stats.active}
          </Text>
        </View>
        <Text className="text-gray-600 text-sm font-medium">
          Active Policies
        </Text>
        <Text className="text-gray-500 text-xs mt-1">Currently enforced</Text>
      </View>

      <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-yellow-50 rounded-lg items-center justify-center">
            <FileText color="#b45309" size={20} />
          </View>
          <Text className="text-2xl font-bold text-gray-900">
            {stats.draft}
          </Text>
        </View>
        <Text className="text-gray-600 text-sm font-medium">
          Draft Policies
        </Text>
        <Text className="text-gray-500 text-xs mt-1">Pending review</Text>
      </View>

      <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-gray-50 rounded-lg items-center justify-center">
            <Archive color="#6b7280" size={20} />
          </View>
          <Text className="text-2xl font-bold text-gray-900">
            {stats.archived}
          </Text>
        </View>
        <Text className="text-gray-600 text-sm font-medium">Archived</Text>
        <Text className="text-gray-500 text-xs mt-1">Past policies</Text>
      </View>

      <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <View className="w-10 h-10 bg-blue-50 rounded-lg items-center justify-center">
            <Settings color="#2563eb" size={20} />
          </View>
          <Text className="text-2xl font-bold text-gray-900">
            {stats.total}
          </Text>
        </View>
        <Text className="text-gray-600 text-sm font-medium">
          Total Policies
        </Text>
        <Text className="text-gray-500 text-xs mt-1">All time</Text>
      </View>
    </View>
  );

  const PolicyCard = ({ policy }: { policy: Policy }) => (
    <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-gray-900 text-base font-bold">
              {policy.name}
            </Text>
            <View
              className={`px-2 py-0.5 rounded-full ${getTypeColor(
                policy.type
              )}`}
            >
              <Text className="text-xs font-semibold capitalize">
                {policy.type.replace("_", " ")}
              </Text>
            </View>
          </View>
          <Text className="text-gray-600 text-sm">{policy.description}</Text>
        </View>
        <View
          className={`px-3 py-1 rounded-full ${getStatusColor(policy.status)}`}
        >
          <Text className="text-xs font-semibold capitalize">
            {policy.status}
          </Text>
        </View>
      </View>

      <View className="gap-2 mb-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">Period</Text>
          <Text className="text-gray-900 text-sm font-medium">
            {formatDate(policy.startDate)} - {formatDate(policy.endDate)}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 text-sm">Payout Amount</Text>
          <Text className="text-gray-900 text-sm font-medium">
            RM {policy.payoutRules.amount.toLocaleString()}
          </Text>
        </View>
        {policy.environmentalTriggers.length > 0 && (
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 text-sm">Threshold</Text>
            <Text className="text-gray-900 text-sm font-medium">
              {policy.environmentalTriggers[0].parameter}{" "}
              {policy.environmentalTriggers[0].operator}{" "}
              {policy.environmentalTriggers[0].threshold}mm
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        onPress={() => handleEditPolicy(policy)}
        className="rounded-lg overflow-hidden"
      >
        <LinearGradient
          colors={["#2563eb", "#1d4ed8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex-row items-center justify-center gap-2 py-2.5"
        >
          <Edit color="#fff" size={18} />
          <Text className="text-white text-sm font-semibold">Edit Policy</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const PoliciesTable = () => (
    <View className="bg-white rounded-xl border border-gray-200">
      <View className="flex-row border-b border-gray-200 px-6 py-4 bg-gray-50 rounded-t-xl">
        <Text className="flex-1 text-gray-600 text-xs font-semibold">
          Policy Name
        </Text>
        <Text className="w-32 text-gray-600 text-xs font-semibold">Type</Text>
        <Text className="w-48 text-gray-600 text-xs font-semibold">
          Active Period
        </Text>
        <Text className="w-40 text-gray-600 text-xs font-semibold">
          Thresholds
        </Text>
        <Text className="w-24 text-gray-600 text-xs font-semibold">Status</Text>
        <Text className="w-24 text-gray-600 text-xs font-semibold">Action</Text>
      </View>

      <ScrollView className="max-h-[600px]">
        {policies.map((policy) => (
          <View
            key={policy.id}
            className="flex-row items-center px-6 py-4 border-b border-gray-100"
          >
            <View className="flex-1">
              <Text className="text-gray-900 text-sm font-medium">
                {policy.name}
              </Text>
              <Text className="text-gray-500 text-xs mt-0.5">
                {policy.description}
              </Text>
            </View>
            <View className="w-32">
              <View
                className={`px-2 py-1 rounded-full self-start ${getTypeColor(
                  policy.type
                )}`}
              >
                <Text className="text-xs font-semibold capitalize">
                  {policy.type.replace("_", " ")}
                </Text>
              </View>
            </View>
            <View className="w-48">
              <Text className="text-gray-900 text-xs font-medium">
                {formatDate(policy.startDate)}
              </Text>
              <Text className="text-gray-500 text-xs">
                to {formatDate(policy.endDate)}
              </Text>
            </View>
            <View className="w-40">
              {policy.environmentalTriggers.length > 0 ? (
                <Text className="text-gray-900 text-xs">
                  {policy.environmentalTriggers[0].parameter}{" "}
                  {policy.environmentalTriggers[0].operator}{" "}
                  {policy.environmentalTriggers[0].threshold}
                </Text>
              ) : (
                <Text className="text-gray-500 text-xs italic">
                  Manual approval
                </Text>
              )}
            </View>
            <View className="w-24">
              <View
                className={`px-2 py-1 rounded-full self-start ${getStatusColor(
                  policy.status
                )}`}
              >
                <Text className="text-xs font-semibold capitalize">
                  {policy.status}
                </Text>
              </View>
            </View>
            <View className="w-24">
              <TouchableOpacity
                onPress={() => handleEditPolicy(policy)}
                className="flex-row items-center justify-center gap-1 bg-blue-50 border border-blue-200 rounded-lg py-1.5 px-2"
              >
                <Edit color="#2563eb" size={14} />
                <Text className="text-blue-700 text-xs font-semibold">
                  Edit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

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

      <SummaryCards />

      {isDesktop ? (
        <PoliciesTable />
      ) : (
        <View>
          {policies.map((policy) => (
            <PolicyCard key={policy.id} policy={policy} />
          ))}
        </View>
      )}
    </View>
  );

  return (
    <>
      {isDesktop ? (
        pageContent
      ) : (
        <View className="flex-1 bg-gray-50">
          <ScrollView className="flex-1">{pageContent}</ScrollView>
        </View>
      )}

      <Modal visible={showEditorModal} transparent animationType="slide">
        <View className="flex-1 bg-white">
          <ScrollView>
            <View className="px-6 py-6">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-gray-900 text-xl font-bold">
                  Edit Policy
                </Text>
                <TouchableOpacity
                  onPress={() => setShowEditorModal(false)}
                  className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                >
                  <X color="#6b7280" size={20} />
                </TouchableOpacity>
              </View>

              {selectedPolicy && (
                <View className="gap-6">
                  <View>
                    <Text className="text-gray-700 text-sm font-bold mb-3">
                      A. Policy Basics
                    </Text>
                    <View className="gap-3">
                      <View>
                        <Text className="text-gray-600 text-xs mb-1">
                          Policy Name*
                        </Text>
                        <TextInput
                          value={selectedPolicy.name}
                          onChangeText={(text) =>
                            setSelectedPolicy({ ...selectedPolicy, name: text })
                          }
                          placeholder="e.g., Drought Relief Subsidy 2025"
                          className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                          placeholderTextColor="#9ca3af"
                        />
                      </View>

                      <View>
                        <Text className="text-gray-600 text-xs mb-1">
                          Description*
                        </Text>
                        <TextInput
                          value={selectedPolicy.description}
                          onChangeText={(text) =>
                            setSelectedPolicy({
                              ...selectedPolicy,
                              description: text,
                            })
                          }
                          placeholder="Brief description of the policy purpose"
                          multiline
                          numberOfLines={3}
                          className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                          placeholderTextColor="#9ca3af"
                          style={{ textAlignVertical: "top" }}
                        />
                      </View>

                      <View>
                        <Text className="text-gray-600 text-xs mb-1">
                          Policy Type*
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                          {["drought", "flood", "crop_loss", "manual"].map(
                            (type) => (
                              <TouchableOpacity
                                key={type}
                                onPress={() =>
                                  setSelectedPolicy({
                                    ...selectedPolicy,
                                    type: type as Policy["type"],
                                  })
                                }
                                className={`px-4 py-2 rounded-lg border ${
                                  selectedPolicy.type === type
                                    ? "bg-blue-50 border-blue-500"
                                    : "bg-white border-gray-300"
                                }`}
                              >
                                <Text
                                  className={`text-sm font-medium capitalize ${
                                    selectedPolicy.type === type
                                      ? "text-blue-700"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {type.replace("_", " ")}
                                </Text>
                              </TouchableOpacity>
                            )
                          )}
                        </View>
                      </View>

                      <View className="flex-row gap-3">
                        <View className="flex-1">
                          <Text className="text-gray-600 text-xs mb-1">
                            Start Date*
                          </Text>
                          <TextInput
                            value={selectedPolicy.startDate}
                            onChangeText={(text) =>
                              setSelectedPolicy({
                                ...selectedPolicy,
                                startDate: text,
                              })
                            }
                            placeholder="YYYY-MM-DD"
                            className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                            placeholderTextColor="#9ca3af"
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-gray-600 text-xs mb-1">
                            End Date*
                          </Text>
                          <TextInput
                            value={selectedPolicy.endDate}
                            onChangeText={(text) =>
                              setSelectedPolicy({
                                ...selectedPolicy,
                                endDate: text,
                              })
                            }
                            placeholder="YYYY-MM-DD"
                            className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                            placeholderTextColor="#9ca3af"
                          />
                        </View>
                      </View>
                    </View>
                  </View>

                  <View>
                    <Text className="text-gray-700 text-sm font-bold mb-3">
                      B. Eligibility Builder
                    </Text>
                    <View className="gap-3">
                      <View className="flex-row gap-3">
                        <View className="flex-1">
                          <Text className="text-gray-600 text-xs mb-1">
                            Min Farm Size (ha)
                          </Text>
                          <TextInput
                            value={
                              selectedPolicy.eligibility.minFarmSize?.toString() ||
                              ""
                            }
                            onChangeText={(text) =>
                              setSelectedPolicy({
                                ...selectedPolicy,
                                eligibility: {
                                  ...selectedPolicy.eligibility,
                                  minFarmSize: parseFloat(text) || undefined,
                                },
                              })
                            }
                            placeholder="0"
                            keyboardType="numeric"
                            className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                            placeholderTextColor="#9ca3af"
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-gray-600 text-xs mb-1">
                            Max Farm Size (ha)
                          </Text>
                          <TextInput
                            value={
                              selectedPolicy.eligibility.maxFarmSize?.toString() ||
                              ""
                            }
                            onChangeText={(text) =>
                              setSelectedPolicy({
                                ...selectedPolicy,
                                eligibility: {
                                  ...selectedPolicy.eligibility,
                                  maxFarmSize: parseFloat(text) || undefined,
                                },
                              })
                            }
                            placeholder="No limit"
                            keyboardType="numeric"
                            className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                            placeholderTextColor="#9ca3af"
                          />
                        </View>
                      </View>

                      <View>
                        <Text className="text-gray-600 text-xs mb-1">
                          States*
                        </Text>
                        <TextInput
                          value={selectedPolicy.eligibility.states.join(", ")}
                          onChangeText={(text) =>
                            setSelectedPolicy({
                              ...selectedPolicy,
                              eligibility: {
                                ...selectedPolicy.eligibility,
                                states: text.split(",").map((s) => s.trim()),
                              },
                            })
                          }
                          placeholder="e.g., Kedah, Perlis, Penang"
                          className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                          placeholderTextColor="#9ca3af"
                        />
                      </View>

                      <View>
                        <Text className="text-gray-600 text-xs mb-1">
                          Districts
                        </Text>
                        <TextInput
                          value={selectedPolicy.eligibility.districts.join(
                            ", "
                          )}
                          onChangeText={(text) =>
                            setSelectedPolicy({
                              ...selectedPolicy,
                              eligibility: {
                                ...selectedPolicy.eligibility,
                                districts: text.split(",").map((s) => s.trim()),
                              },
                            })
                          }
                          placeholder="e.g., Kubang Pasu, Kangar (optional)"
                          className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                          placeholderTextColor="#9ca3af"
                        />
                      </View>

                      <View>
                        <Text className="text-gray-600 text-xs mb-1">
                          Crop Types*
                        </Text>
                        <TextInput
                          value={selectedPolicy.eligibility.cropTypes.join(
                            ", "
                          )}
                          onChangeText={(text) =>
                            setSelectedPolicy({
                              ...selectedPolicy,
                              eligibility: {
                                ...selectedPolicy.eligibility,
                                cropTypes: text.split(",").map((s) => s.trim()),
                              },
                            })
                          }
                          placeholder="e.g., Paddy, Vegetables, Fruits"
                          className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                          placeholderTextColor="#9ca3af"
                        />
                      </View>

                      <View>
                        <Text className="text-gray-600 text-xs mb-1">
                          Certification Requirements
                        </Text>
                        <TextInput
                          value={selectedPolicy.eligibility.certifications.join(
                            ", "
                          )}
                          onChangeText={(text) =>
                            setSelectedPolicy({
                              ...selectedPolicy,
                              eligibility: {
                                ...selectedPolicy.eligibility,
                                certifications: text
                                  .split(",")
                                  .map((s) => s.trim()),
                              },
                            })
                          }
                          placeholder="e.g., MyGAP, Organic (optional)"
                          className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                          placeholderTextColor="#9ca3af"
                        />
                      </View>
                    </View>
                  </View>

                  <View>
                    <Text className="text-gray-700 text-sm font-bold mb-3">
                      C. Environmental Trigger Builder
                    </Text>
                    <View className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-3">
                      <Text className="text-blue-700 text-xs">
                        Environmental triggers enable automatic subsidy
                        activation when weather conditions meet specified
                        thresholds. Leave empty for manual approval policies.
                      </Text>
                    </View>

                    {selectedPolicy.environmentalTriggers.length > 0 ? (
                      <View className="gap-3">
                        {selectedPolicy.environmentalTriggers.map(
                          (trigger, index) => (
                            <View
                              key={index}
                              className="bg-gray-50 rounded-lg p-4 border border-gray-300"
                            >
                              <View className="flex-row items-center justify-between mb-3">
                                <Text className="text-gray-700 text-sm font-semibold">
                                  Trigger {index + 1}
                                </Text>
                                <TouchableOpacity
                                  onPress={() => {
                                    const newTriggers = [
                                      ...selectedPolicy.environmentalTriggers,
                                    ];
                                    newTriggers.splice(index, 1);
                                    setSelectedPolicy({
                                      ...selectedPolicy,
                                      environmentalTriggers: newTriggers,
                                    });
                                  }}
                                >
                                  <Trash2 color="#dc2626" size={18} />
                                </TouchableOpacity>
                              </View>

                              <View className="gap-3">
                                <View>
                                  <Text className="text-gray-600 text-xs mb-1">
                                    MET Parameter*
                                  </Text>
                                  <View className="flex-row gap-2">
                                    {[
                                      "Rainfall",
                                      "Temperature",
                                      "Humidity",
                                    ].map((param) => (
                                      <TouchableOpacity
                                        key={param}
                                        onPress={() => {
                                          const newTriggers = [
                                            ...selectedPolicy.environmentalTriggers,
                                          ];
                                          newTriggers[index].parameter = param;
                                          setSelectedPolicy({
                                            ...selectedPolicy,
                                            environmentalTriggers: newTriggers,
                                          });
                                        }}
                                        className={`px-3 py-2 rounded-lg border ${
                                          trigger.parameter === param
                                            ? "bg-blue-50 border-blue-500"
                                            : "bg-white border-gray-300"
                                        }`}
                                      >
                                        <Text
                                          className={`text-xs font-medium ${
                                            trigger.parameter === param
                                              ? "text-blue-700"
                                              : "text-gray-700"
                                          }`}
                                        >
                                          {param}
                                        </Text>
                                      </TouchableOpacity>
                                    ))}
                                  </View>
                                </View>

                                <View className="flex-row gap-3">
                                  <View className="w-24">
                                    <Text className="text-gray-600 text-xs mb-1">
                                      Operator*
                                    </Text>
                                    <View className="flex-row gap-1">
                                      {["<", ">", "<=", ">="].map((op) => (
                                        <TouchableOpacity
                                          key={op}
                                          onPress={() => {
                                            const newTriggers = [
                                              ...selectedPolicy.environmentalTriggers,
                                            ];
                                            newTriggers[index].operator = op;
                                            setSelectedPolicy({
                                              ...selectedPolicy,
                                              environmentalTriggers:
                                                newTriggers,
                                            });
                                          }}
                                          className={`flex-1 py-2 rounded-lg border ${
                                            trigger.operator === op
                                              ? "bg-blue-50 border-blue-500"
                                              : "bg-white border-gray-300"
                                          }`}
                                        >
                                          <Text
                                            className={`text-center text-xs font-medium ${
                                              trigger.operator === op
                                                ? "text-blue-700"
                                                : "text-gray-700"
                                            }`}
                                          >
                                            {op}
                                          </Text>
                                        </TouchableOpacity>
                                      ))}
                                    </View>
                                  </View>
                                  <View className="flex-1">
                                    <Text className="text-gray-600 text-xs mb-1">
                                      Threshold Value*
                                    </Text>
                                    <TextInput
                                      value={trigger.threshold.toString()}
                                      onChangeText={(text) => {
                                        const newTriggers = [
                                          ...selectedPolicy.environmentalTriggers,
                                        ];
                                        newTriggers[index].threshold =
                                          parseFloat(text) || 0;
                                        setSelectedPolicy({
                                          ...selectedPolicy,
                                          environmentalTriggers: newTriggers,
                                        });
                                      }}
                                      placeholder="e.g., 50"
                                      keyboardType="numeric"
                                      className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 text-sm"
                                      placeholderTextColor="#9ca3af"
                                    />
                                  </View>
                                </View>

                                <View className="flex-row gap-3">
                                  <View className="flex-1">
                                    <Text className="text-gray-600 text-xs mb-1">
                                      Trigger Window*
                                    </Text>
                                    <TextInput
                                      value={trigger.windowValue.toString()}
                                      onChangeText={(text) => {
                                        const newTriggers = [
                                          ...selectedPolicy.environmentalTriggers,
                                        ];
                                        newTriggers[index].windowValue =
                                          parseInt(text) || 0;
                                        setSelectedPolicy({
                                          ...selectedPolicy,
                                          environmentalTriggers: newTriggers,
                                        });
                                      }}
                                      placeholder="e.g., 30"
                                      keyboardType="numeric"
                                      className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 text-sm"
                                      placeholderTextColor="#9ca3af"
                                    />
                                  </View>
                                  <View className="w-28">
                                    <Text className="text-gray-600 text-xs mb-1">
                                      Unit*
                                    </Text>
                                    <View className="flex-row gap-1">
                                      {["hours", "days"].map((unit) => (
                                        <TouchableOpacity
                                          key={unit}
                                          onPress={() => {
                                            const newTriggers = [
                                              ...selectedPolicy.environmentalTriggers,
                                            ];
                                            newTriggers[index].windowUnit =
                                              unit as "hours" | "days";
                                            setSelectedPolicy({
                                              ...selectedPolicy,
                                              environmentalTriggers:
                                                newTriggers,
                                            });
                                          }}
                                          className={`flex-1 py-2 rounded-lg border ${
                                            trigger.windowUnit === unit
                                              ? "bg-blue-50 border-blue-500"
                                              : "bg-white border-gray-300"
                                          }`}
                                        >
                                          <Text
                                            className={`text-center text-xs font-medium capitalize ${
                                              trigger.windowUnit === unit
                                                ? "text-blue-700"
                                                : "text-gray-700"
                                            }`}
                                          >
                                            {unit}
                                          </Text>
                                        </TouchableOpacity>
                                      ))}
                                    </View>
                                  </View>
                                </View>
                              </View>
                            </View>
                          )
                        )}
                      </View>
                    ) : null}

                    <TouchableOpacity
                      onPress={() => {
                        setSelectedPolicy({
                          ...selectedPolicy,
                          environmentalTriggers: [
                            ...selectedPolicy.environmentalTriggers,
                            {
                              parameter: "Rainfall",
                              operator: "<",
                              threshold: 0,
                              windowValue: 30,
                              windowUnit: "days",
                            },
                          ],
                        });
                      }}
                      className="flex-row items-center justify-center gap-2 bg-blue-50 border border-blue-300 rounded-lg py-3 mt-2"
                    >
                      <Plus color="#2563eb" size={18} />
                      <Text className="text-blue-700 text-sm font-semibold">
                        Add Trigger
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View>
                    <Text className="text-gray-700 text-sm font-bold mb-3">
                      D. Subsidy Payout Rules
                    </Text>
                    <View className="gap-3">
                      <View className="flex-row gap-3">
                        <View className="flex-1">
                          <Text className="text-gray-600 text-xs mb-1">
                            Payment Amount (RM)*
                          </Text>
                          <TextInput
                            value={selectedPolicy.payoutRules.amount.toString()}
                            onChangeText={(text) =>
                              setSelectedPolicy({
                                ...selectedPolicy,
                                payoutRules: {
                                  ...selectedPolicy.payoutRules,
                                  amount: parseFloat(text) || 0,
                                },
                              })
                            }
                            placeholder="e.g., 5000"
                            keyboardType="numeric"
                            className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                            placeholderTextColor="#9ca3af"
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-gray-600 text-xs mb-1">
                            Max Cap (RM)*
                          </Text>
                          <TextInput
                            value={selectedPolicy.payoutRules.maxCap.toString()}
                            onChangeText={(text) =>
                              setSelectedPolicy({
                                ...selectedPolicy,
                                payoutRules: {
                                  ...selectedPolicy.payoutRules,
                                  maxCap: parseFloat(text) || 0,
                                },
                              })
                            }
                            placeholder="e.g., 15000"
                            keyboardType="numeric"
                            className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm"
                            placeholderTextColor="#9ca3af"
                          />
                        </View>
                      </View>

                      <View>
                        <Text className="text-gray-600 text-xs mb-1">
                          Payment Frequency*
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                          {[
                            "per_trigger",
                            "monthly",
                            "quarterly",
                            "annual",
                          ].map((freq) => (
                            <TouchableOpacity
                              key={freq}
                              onPress={() =>
                                setSelectedPolicy({
                                  ...selectedPolicy,
                                  payoutRules: {
                                    ...selectedPolicy.payoutRules,
                                    frequency: freq,
                                  },
                                })
                              }
                              className={`px-4 py-2 rounded-lg border ${
                                selectedPolicy.payoutRules.frequency === freq
                                  ? "bg-blue-50 border-blue-500"
                                  : "bg-white border-gray-300"
                              }`}
                            >
                              <Text
                                className={`text-sm font-medium capitalize ${
                                  selectedPolicy.payoutRules.frequency === freq
                                    ? "text-blue-700"
                                    : "text-gray-700"
                                }`}
                              >
                                {freq.replace("_", " ")}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      <View>
                        <Text className="text-gray-600 text-xs mb-1">
                          Beneficiary Category*
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                          {[
                            "all_farmers",
                            "small_medium_farmers",
                            "organic_farmers",
                            "certified_farmers",
                          ].map((cat) => (
                            <TouchableOpacity
                              key={cat}
                              onPress={() =>
                                setSelectedPolicy({
                                  ...selectedPolicy,
                                  payoutRules: {
                                    ...selectedPolicy.payoutRules,
                                    beneficiaryCategory: cat,
                                  },
                                })
                              }
                              className={`px-4 py-2 rounded-lg border ${
                                selectedPolicy.payoutRules
                                  .beneficiaryCategory === cat
                                  ? "bg-blue-50 border-blue-500"
                                  : "bg-white border-gray-300"
                              }`}
                            >
                              <Text
                                className={`text-sm font-medium capitalize ${
                                  selectedPolicy.payoutRules
                                    .beneficiaryCategory === cat
                                    ? "text-blue-700"
                                    : "text-gray-700"
                                }`}
                              >
                                {cat.replace(/_/g, " ")}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </View>
                  </View>

                  <View className="gap-3 pt-4 border-t border-gray-200">
                    <TouchableOpacity className="rounded-lg overflow-hidden">
                      <LinearGradient
                        colors={["#22c55e", "#15803d"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="flex-row items-center justify-center gap-2 py-3"
                      >
                        <CheckCircle color="#fff" size={20} />
                        <Text className="text-white text-[15px] font-bold">
                          Publish Policy
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center justify-center gap-2 bg-gray-100 border border-gray-300 rounded-lg py-3">
                      <Save color="#6b7280" size={20} />
                      <Text className="text-gray-700 text-[15px] font-bold">
                        Save as Draft
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setShowEditorModal(false)}
                      className="flex-row items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg py-3"
                    >
                      <X color="#6b7280" size={20} />
                      <Text className="text-gray-700 text-[15px] font-bold">
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
