import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  useWindowDimensions,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Plus,
  Calendar,
  Warehouse,
  FileText,
  CheckCircle,
  Copy,
  Eye,
  Home as HomeIcon,
  Sparkles,
} from "lucide-react-native";
import FarmerLayout from "@/components/ui/farmer-layout";

interface Farm {
  id: string;
  name: string;
}

interface FormData {
  batchId: string;
  name: string;
  harvestDate: string;
  farmId: string;
  certifications: string[];
}

const mockFarms: Farm[] = [
  { id: "1", name: "Green Valley Farm" },
  { id: "2", name: "Sunrise Acres" },
  { id: "3", name: "Organic Fields Estate" },
];

export default function AddProducePage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;

  const [formData, setFormData] = useState<FormData>({
    batchId: "",
    name: "",
    harvestDate: "",
    farmId: "",
    certifications: [],
  });

  const [showFarmDropdown, setShowFarmDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    txHash: string;
    qrCode: string;
    batchId: string;
  } | null>(null);

  const generateBatchId = () => {
    const prefix = "BTH";
    const randomNum = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, "0");
    setFormData({ ...formData, batchId: `${prefix}-${randomNum}` });
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert("Validation Error", "Please enter produce name");
      return false;
    }
    if (!formData.harvestDate) {
      Alert.alert("Validation Error", "Please select harvest date");
      return false;
    }
    if (!formData.farmId) {
      Alert.alert("Validation Error", "Please select a farm");
      return false;
    }
    if (!formData.batchId) {
      Alert.alert("Validation Error", "Please generate or enter batch ID");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockResponse = {
        txHash: "0x" + Math.random().toString(16).substring(2, 42),
        qrCode:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        batchId: formData.batchId,
      };

      setSuccessData(mockResponse);
      setShowSuccessModal(true);
    } catch (error) {
      Alert.alert("Error", "Failed to record produce. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (Platform.OS === "web") {
      navigator.clipboard.writeText(text);
      Alert.alert("Copied", "Transaction hash copied to clipboard");
    }
  };

  const Header = () => (
    <LinearGradient
      colors={["#22c55e", "#059669"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      className="px-6 py-6"
    >
      <View className="flex-row items-center gap-4 mb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
        >
          <ArrowLeft color="#fff" size={20} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white text-2xl font-bold">
            Add New Produce Batch
          </Text>
          <Text className="text-white/90 text-sm mt-1">
            Register your produce to generate a traceable blockchain record.
          </Text>
        </View>
      </View>
    </LinearGradient>
  );

  const FormSection = () => (
    <View className={isDesktop ? "flex-1 pr-6" : ""}>
      <View className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <Text className="text-gray-900 text-lg font-bold mb-4">
          General Information
        </Text>

        <View className="mb-4">
          <Text className="text-gray-700 text-sm font-semibold mb-2">
            Batch ID
          </Text>
          <View className="flex-row gap-3">
            <TextInput
              value={formData.batchId}
              onChangeText={(text) =>
                setFormData({ ...formData, batchId: text })
              }
              placeholder="BTH-00000"
              className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
            />
            <TouchableOpacity
              onPress={generateBatchId}
              className="bg-emerald-500 rounded-lg px-4 py-3 items-center justify-center"
            >
              <Sparkles color="#fff" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 text-sm font-semibold mb-2">
            Produce Name
          </Text>
          <TextInput
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="e.g., Organic Tomatoes"
            className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 text-sm font-semibold mb-2">
            Harvest Date
          </Text>
          <View className="flex-row items-center bg-gray-50 border border-gray-300 rounded-lg px-4 py-3">
            <Calendar color="#6b7280" size={20} />
            <TextInput
              value={formData.harvestDate}
              onChangeText={(text) =>
                setFormData({ ...formData, harvestDate: text })
              }
              placeholder="YYYY-MM-DD"
              className="flex-1 ml-3 text-gray-900"
            />
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 text-sm font-semibold mb-2">
            Select Farm
          </Text>
          <TouchableOpacity
            onPress={() => setShowFarmDropdown(!showFarmDropdown)}
            className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 flex-row items-center"
          >
            <Warehouse color="#6b7280" size={20} />
            <Text className="flex-1 ml-3 text-gray-900">
              {formData.farmId
                ? mockFarms.find((f) => f.id === formData.farmId)?.name
                : "Choose a farm..."}
            </Text>
          </TouchableOpacity>
          {showFarmDropdown && (
            <View className="mt-2 bg-white border border-gray-300 rounded-lg overflow-hidden">
              {mockFarms.map((farm) => (
                <TouchableOpacity
                  key={farm.id}
                  onPress={() => {
                    setFormData({ ...formData, farmId: farm.id });
                    setShowFarmDropdown(false);
                  }}
                  className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50"
                >
                  <Text className="text-gray-900">{farm.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      <View className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <Text className="text-gray-900 text-lg font-bold mb-2">
          Certifications / Documents
        </Text>
        <Text className="text-gray-600 text-sm mb-4">Optional</Text>

        <TouchableOpacity className="border-2 border-dashed border-gray-300 rounded-lg py-6 items-center hover:border-emerald-500 hover:bg-emerald-50">
          <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mb-2">
            <Plus color="#6b7280" size={24} />
          </View>
          <Text className="text-gray-700 text-sm font-semibold">Add File</Text>
          <Text className="text-gray-500 text-xs">
            DOA certificates, land titles, etc.
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row gap-4">
        {/* Cancel Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-1 bg-gray-100 rounded-lg py-4 items-center justify-center"
        >
          <Text className="text-gray-700 text-base font-semibold">Cancel</Text>
        </TouchableOpacity>

        {/* Record Produce Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 rounded-lg overflow-hidden"
        >
          <LinearGradient
            colors={["#22c55e", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="w-full py-4 items-center justify-center"
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-semibold">
                Record Produce
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const BlockchainPreview = () => (
    <View className="w-96">
      <View className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border-2 border-emerald-200">
        <View className="flex-row items-center gap-3 mb-4">
          <View className="w-10 h-10 bg-emerald-500 rounded-full items-center justify-center">
            <FileText color="#fff" size={20} />
          </View>
          <Text className="text-gray-900 text-lg font-bold">
            Blockchain Preview
          </Text>
        </View>
        <View className="bg-white rounded-lg p-4 border border-emerald-200">
          <Text className="text-gray-600 text-sm text-center leading-relaxed">
            Once submitted, your produce will be recorded on the blockchain with
            a unique transaction hash and QR code for traceability.
          </Text>
        </View>
        <View className="mt-4 bg-white rounded-lg p-8 items-center justify-center border border-dashed border-emerald-300">
          <View className="w-32 h-32 bg-gray-100 rounded-lg items-center justify-center mb-3">
            <Text className="text-gray-400 text-xs text-center">
              QR Code{"\n"}Preview
            </Text>
          </View>
          <Text className="text-gray-500 text-xs text-center">
            QR code will appear here after submission
          </Text>
        </View>
      </View>
    </View>
  );

  const SuccessModal = () => (
    <Modal visible={showSuccessModal} transparent animationType="fade">
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="bg-white rounded-2xl p-8 max-w-lg w-full">
          <View className="items-center mb-6">
            <View className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-4">
              <CheckCircle color="#059669" size={40} />
            </View>
            <Text className="text-gray-900 text-2xl font-bold mb-2 text-center">
              Produce Successfully Recorded!
            </Text>
            <Text className="text-gray-600 text-sm text-center">
              Your produce has been added to the blockchain
            </Text>
          </View>

          <View className="bg-gray-50 rounded-xl p-4 mb-6">
            <View className="mb-4">
              <Text className="text-gray-600 text-xs font-semibold mb-1">
                Transaction Hash
              </Text>
              <View className="flex-row items-center gap-2">
                <Text className="flex-1 text-gray-900 text-sm font-mono">
                  {successData?.txHash.substring(0, 20)}...
                </Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(successData?.txHash || "")}
                >
                  <Copy color="#6b7280" size={16} />
                </TouchableOpacity>
              </View>
            </View>

            <View className="items-center py-4">
              <View className="w-40 h-40 bg-white rounded-lg border border-gray-200 items-center justify-center">
                <Text className="text-gray-400 text-xs">QR Code</Text>
              </View>
              <Text className="text-gray-600 text-xs mt-2">
                Batch ID: {successData?.batchId}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => {
                setShowSuccessModal(false);
                router.push("/dashboard/farmer");
              }}
              className="flex-1 bg-gray-100 rounded-lg py-3 items-center"
            >
              <HomeIcon color="#374151" size={18} />
              <Text className="text-gray-700 text-sm font-semibold mt-1">
                Back to Dashboard
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowSuccessModal(false);
              }}
              className="flex-1 rounded-lg py-3 items-center overflow-hidden"
            >
              <LinearGradient
                colors={["#22c55e", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="w-full h-full items-center justify-center"
              >
                <Eye color="#fff" size={18} />
                <Text className="text-white text-sm font-semibold mt-1">
                  View Details
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (isDesktop) {
    return (
      <>
        <FarmerLayout
          headerTitle="Add New Produce Batch"
          headerSubtitle="Register your produce to generate a traceable blockchain record"
        >
          <View className="p-6">
            <View className="flex-row gap-6">
              <FormSection />
              <BlockchainPreview />
            </View>
          </View>
        </FarmerLayout>
        <SuccessModal />
      </>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <Header />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 20,
        }}
      >
        <FormSection />
      </ScrollView>
      <SuccessModal />
    </View>
  );
}
