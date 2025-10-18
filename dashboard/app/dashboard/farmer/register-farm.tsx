import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  useWindowDimensions,
  KeyboardAvoidingView,
  Modal,
} from "react-native";
import {
  ArrowLeft,
  Upload,
  X,
  CheckCircle,
  Warehouse,
  Edit,
  Plus,
  Package,
  FileText,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import FarmerLayout from "@/components/ui/FarmerLayout";

interface DocumentFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface Farm {
  id: string;
  name: string;
  location: string;
  size: number;
  sizeUnit: string;
  produceType: string;
  produceBatchCount: number;
  documents: DocumentFile[];
}

const mockExistingFarm: Farm = {
  id: "1",
  name: "Green Valley Farm",
  location: "Northern Region, District 5",
  size: 5.5,
  sizeUnit: "hectares",
  produceType: "Rice, Vegetables",
  produceBatchCount: 6,
  documents: [
    {
      id: "1",
      name: "Land_Title_Certificate.pdf",
      size: 245000,
      type: "application/pdf",
    },
    {
      id: "2",
      name: "DOA_Registration.pdf",
      size: 180000,
      type: "application/pdf",
    },
  ],
};

export default function RegisterFarmScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;

  const [hasFarm, setHasFarm] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingFarm, setExistingFarm] = useState<Farm | null>(
    mockExistingFarm
  );

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    size: "",
    sizeUnit: "hectares",
    produceType: "",
  });

  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existingFarm && isEditMode) {
      setFormData({
        name: existingFarm.name,
        location: existingFarm.location,
        size: existingFarm.size.toString(),
        sizeUnit: existingFarm.sizeUnit,
        produceType: existingFarm.produceType,
      });
      setDocuments(existingFarm.documents);
    }
  }, [isEditMode, existingFarm]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Farm name is required";
    }
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }
    if (!formData.size.trim()) {
      newErrors.size = "Size is required";
    } else if (isNaN(Number(formData.size)) || Number(formData.size) <= 0) {
      newErrors.size = "Please enter a valid size";
    }
    if (!formData.produceType.trim()) {
      newErrors.produceType = "Produce type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegisterOrUpdateFarm = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (isEditMode) {
        setExistingFarm({
          id: existingFarm?.id || "1",
          name: formData.name,
          location: formData.location,
          size: Number(formData.size),
          sizeUnit: formData.sizeUnit,
          produceType: formData.produceType,
          produceBatchCount: existingFarm?.produceBatchCount || 0,
          documents: documents,
        });
        setIsEditMode(false);
      } else {
        setExistingFarm({
          id: "1",
          name: formData.name,
          location: formData.location,
          size: Number(formData.size),
          sizeUnit: formData.sizeUnit,
          produceType: formData.produceType,
          produceBatchCount: 0,
          documents: documents,
        });
        setHasFarm(true);
      }
      setIsLoading(false);
      setShowSuccessModal(true);

      setTimeout(() => {
        setShowSuccessModal(false);
      }, 2000);
    }, 1500);
  };

  const handleFileUpload = () => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx";

      input.onchange = (e: any) => {
        const files = Array.from(e.target.files || []) as File[];
        const newDocs: DocumentFile[] = files.map((file) => ({
          id: Math.random().toString(36).substring(7),
          name: file.name,
          size: file.size,
          type: file.type,
        }));
        setDocuments([...documents, ...newDocs]);
      };

      input.click();
    } else {
      alert("File upload on mobile coming soon!");
    }
  };

  const removeDocument = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setErrors({});
    if (existingFarm) {
      setFormData({
        name: existingFarm.name,
        location: existingFarm.location,
        size: existingFarm.size.toString(),
        sizeUnit: existingFarm.sizeUnit,
        produceType: existingFarm.produceType,
      });
      setDocuments(existingFarm.documents);
    }
  };

  if (hasFarm && existingFarm && !isEditMode) {
    const farmViewContent = (
      <View className="px-6 py-6">
        <View className={isDesktop ? "flex-row gap-8" : ""}>
          <View className={isDesktop ? "flex-1" : ""}>
            <View className="bg-white rounded-xl p-6 border border-gray-200 mb-4">
              <View className="flex-row items-start justify-between mb-4">
                <View className="flex-1">
                  <Text className="text-gray-900 text-2xl font-bold mb-1">
                    {existingFarm.name}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    Farm ID: {existingFarm.id}
                  </Text>
                </View>
                <View className="w-12 h-12 bg-emerald-50 rounded-xl items-center justify-center">
                  <Warehouse color="#059669" size={24} />
                </View>
              </View>

              <View className="gap-3 mb-6">
                <View className="flex-row items-start gap-3">
                  <View className="w-8 h-8 bg-gray-100 rounded-lg items-center justify-center mt-0.5">
                    <Text className="text-gray-600 text-xs">📍</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-500 text-xs font-semibold mb-1">
                      Location
                    </Text>
                    <Text className="text-gray-900 text-[15px]">
                      {existingFarm.location}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-start gap-3">
                  <View className="w-8 h-8 bg-gray-100 rounded-lg items-center justify-center mt-0.5">
                    <Text className="text-gray-600 text-xs">📏</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-500 text-xs font-semibold mb-1">
                      Farm Size
                    </Text>
                    <Text className="text-gray-900 text-[15px]">
                      {existingFarm.size} {existingFarm.sizeUnit}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-start gap-3">
                  <View className="w-8 h-8 bg-gray-100 rounded-lg items-center justify-center mt-0.5">
                    <Text className="text-gray-600 text-xs">🌾</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-500 text-xs font-semibold mb-1">
                      Produce Type
                    </Text>
                    <Text className="text-gray-900 text-[15px]">
                      {existingFarm.produceType}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-start gap-3">
                  <View className="w-8 h-8 bg-emerald-100 rounded-lg items-center justify-center mt-0.5">
                    <Package color="#059669" size={16} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-500 text-xs font-semibold mb-1">
                      Registered Produce Batches
                    </Text>
                    <Text className="text-gray-900 text-[15px] font-bold">
                      {existingFarm.produceBatchCount} batches
                    </Text>
                  </View>
                </View>
              </View>

              <View className={`gap-3 ${isDesktop ? "flex-row" : ""}`}>
                <TouchableOpacity
                  onPress={() => setIsEditMode(true)}
                  className={`flex-row items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg py-3 ${
                    isDesktop ? "flex-1" : ""
                  }`}
                >
                  <Edit color="#374151" size={18} />
                  <Text className="text-gray-900 text-[15px] font-semibold">
                    Edit Farm Info
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push("/dashboard/farmer/add-produce")}
                  className={`rounded-lg overflow-hidden ${
                    isDesktop ? "flex-1" : ""
                  }`}
                >
                  <LinearGradient
                    colors={["#22c55e", "#059669"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="flex-row items-center justify-center gap-2 py-3"
                  >
                    <Plus color="#fff" size={18} />
                    <Text className="text-white text-[15px] font-semibold">
                      Add Produce
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {existingFarm.documents.length > 0 && (
              <View className="bg-white rounded-xl p-6 border border-gray-200">
                <View className="flex-row items-center gap-2 mb-4">
                  <FileText color="#374151" size={20} />
                  <Text className="text-gray-900 text-lg font-bold">
                    Uploaded Documents
                  </Text>
                  <View className="bg-emerald-100 rounded-full px-2 py-0.5">
                    <Text className="text-emerald-700 text-xs font-bold">
                      {existingFarm.documents.length}
                    </Text>
                  </View>
                </View>

                <View className="gap-2">
                  {existingFarm.documents.map((doc) => (
                    <View
                      key={doc.id}
                      className="flex-row items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200"
                    >
                      <View className="flex-1">
                        <Text
                          className="text-gray-900 text-sm font-medium"
                          numberOfLines={1}
                        >
                          {doc.name}
                        </Text>
                        <Text className="text-gray-500 text-xs">
                          {formatFileSize(doc.size)}
                        </Text>
                      </View>
                      <TouchableOpacity className="ml-3">
                        <Text className="text-emerald-600 text-xs font-semibold">
                          View
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {isDesktop && (
            <View className="w-96">
              <View className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
                <View className="w-16 h-16 bg-emerald-100 rounded-2xl items-center justify-center mb-4">
                  <CheckCircle color="#059669" size={32} />
                </View>
                <Text className="text-gray-900 text-xl font-bold mb-3">
                  Farm Registered
                </Text>
                <Text className="text-gray-600 text-sm leading-relaxed mb-6">
                  Your farm is successfully registered on the AgriChain
                  platform. You can now track produce, manage batches, and
                  maintain transparency in your supply chain.
                </Text>
                <View className="gap-3">
                  <View className="flex-row items-start gap-3">
                    <CheckCircle color="#059669" size={20} />
                    <Text className="text-gray-700 text-sm flex-1">
                      {existingFarm.produceBatchCount} produce batches
                      registered
                    </Text>
                  </View>
                  <View className="flex-row items-start gap-3">
                    <CheckCircle color="#059669" size={20} />
                    <Text className="text-gray-700 text-sm flex-1">
                      {existingFarm.documents.length} documents uploaded
                    </Text>
                  </View>
                  <View className="flex-row items-start gap-3">
                    <CheckCircle color="#059669" size={20} />
                    <Text className="text-gray-700 text-sm flex-1">
                      Blockchain verification active
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    );

    if (isDesktop) {
      return (
        <FarmerLayout
          headerTitle="My Farm"
          headerSubtitle="View and manage your farm details"
          rightHeaderButton={
            <TouchableOpacity
              onPress={() => router.push("/dashboard/farmer/add-produce")}
              className="rounded-lg overflow-hidden"
            >
              <LinearGradient
                colors={["#22c55e", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="flex-row items-center gap-2 px-5 py-3"
              >
                <Plus color="#fff" size={20} />
                <Text className="text-white text-[15px] font-semibold">
                  Add Produce
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          }
        >
          {farmViewContent}
        </FarmerLayout>
      );
    }

    return (
      <View className="flex-1 bg-gray-50">
        <View className="overflow-hidden">
          <LinearGradient
            colors={["#22c55e", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="px-6 py-8 pb-12"
          >
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-row items-center mb-6"
            >
              <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity>
            <View className="flex-row items-center gap-3 mb-2">
              <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
                <Warehouse color="#fff" size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-white text-2xl font-bold">My Farm</Text>
                <Text className="text-white/90 text-sm mt-1">
                  View and manage your farm details
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {farmViewContent}
        </ScrollView>
      </View>
    );
  }

  const formContent = (
    <View className="px-6 py-6">
      <View className={isDesktop ? "flex-row gap-8" : ""}>
        <View className={isDesktop ? "flex-1" : ""}>
          <View className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
            <Text className="text-gray-900 text-lg font-bold mb-4">
              Farm Details
            </Text>

            {errors.general && (
              <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <Text className="text-red-700 text-sm">{errors.general}</Text>
              </View>
            )}

            <View className="mb-5">
              <Text className="text-gray-700 text-sm font-semibold mb-2">
                Farm Name
              </Text>
              <TextInput
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                placeholder="e.g., Green Valley Farm"
                className={`bg-white border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } rounded-lg px-4 py-3 text-gray-900 text-[15px]`}
                placeholderTextColor="#9ca3af"
              />
              {errors.name && (
                <Text className="text-red-500 text-xs mt-1">{errors.name}</Text>
              )}
            </View>

            <View className="mb-5">
              <Text className="text-gray-700 text-sm font-semibold mb-2">
                Location
              </Text>
              <TextInput
                value={formData.location}
                onChangeText={(text) =>
                  setFormData({ ...formData, location: text })
                }
                placeholder="e.g., Northern Region, District 5"
                className={`bg-white border ${
                  errors.location ? "border-red-500" : "border-gray-300"
                } rounded-lg px-4 py-3 text-gray-900 text-[15px]`}
                placeholderTextColor="#9ca3af"
              />
              {errors.location && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.location}
                </Text>
              )}
            </View>

            <View className="mb-5">
              <Text className="text-gray-700 text-sm font-semibold mb-2">
                Farm Size
              </Text>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <TextInput
                    value={formData.size}
                    onChangeText={(text) =>
                      setFormData({ ...formData, size: text })
                    }
                    placeholder="e.g., 5.5"
                    keyboardType="numeric"
                    className={`bg-white border ${
                      errors.size ? "border-red-500" : "border-gray-300"
                    } rounded-lg px-4 py-3 text-gray-900 text-[15px]`}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View className="w-32">
                  <View className="bg-white border border-gray-300 rounded-lg px-4 py-3">
                    <TouchableOpacity
                      onPress={() =>
                        setFormData({
                          ...formData,
                          sizeUnit:
                            formData.sizeUnit === "hectares"
                              ? "acres"
                              : "hectares",
                        })
                      }
                    >
                      <Text className="text-gray-900 text-[15px]">
                        {formData.sizeUnit === "hectares"
                          ? "Hectares"
                          : "Acres"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              {errors.size && (
                <Text className="text-red-500 text-xs mt-1">{errors.size}</Text>
              )}
            </View>

            <View className="mb-5">
              <Text className="text-gray-700 text-sm font-semibold mb-2">
                Type of Produce
              </Text>
              <TextInput
                value={formData.produceType}
                onChangeText={(text) =>
                  setFormData({ ...formData, produceType: text })
                }
                placeholder="e.g., Rice, Vegetables, Fruits"
                className={`bg-white border ${
                  errors.produceType ? "border-red-500" : "border-gray-300"
                } rounded-lg px-4 py-3 text-gray-900 text-[15px]`}
                placeholderTextColor="#9ca3af"
              />
              {errors.produceType && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.produceType}
                </Text>
              )}
            </View>
          </View>

          <View className="bg-white rounded-xl p-6 border border-gray-200">
            <Text className="text-gray-900 text-lg font-bold mb-2">
              Supporting Documents
            </Text>
            <Text className="text-gray-600 text-sm mb-4">
              Attach land titles, DOA certificates, or other verification files
              (optional)
            </Text>

            <TouchableOpacity
              onPress={handleFileUpload}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 items-center mb-4"
            >
              <View className="w-12 h-12 bg-emerald-50 rounded-full items-center justify-center mb-3">
                <Upload color="#059669" size={24} />
              </View>
              <Text className="text-gray-900 text-sm font-semibold mb-1">
                Click to upload files
              </Text>
              <Text className="text-gray-500 text-xs">
                PDF, JPG, PNG, DOC (max 10MB each)
              </Text>
            </TouchableOpacity>

            {documents.length > 0 && (
              <View className="gap-2">
                {documents.map((doc) => (
                  <View
                    key={doc.id}
                    className="flex-row items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200"
                  >
                    <View className="flex-1">
                      <Text
                        className="text-gray-900 text-sm font-medium"
                        numberOfLines={1}
                      >
                        {doc.name}
                      </Text>
                      <Text className="text-gray-500 text-xs">
                        {formatFileSize(doc.size)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeDocument(doc.id)}
                      className="w-8 h-8 bg-red-50 rounded-full items-center justify-center ml-3"
                    >
                      <X color="#ef4444" size={16} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {isDesktop && (
          <View className="w-96">
            <View className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
              <View className="w-16 h-16 bg-emerald-100 rounded-2xl items-center justify-center mb-4">
                <Warehouse color="#059669" size={32} />
              </View>
              <Text className="text-gray-900 text-xl font-bold mb-3">
                Farm {isEditMode ? "Update" : "Registration"}
              </Text>
              <Text className="text-gray-600 text-sm leading-relaxed mb-6">
                {isEditMode
                  ? "Update your farm information to keep your records accurate and up to date."
                  : "Register your farm to start tracking produce, accessing subsidies, and building transparency in the supply chain through blockchain verification."}
              </Text>
              <View className="gap-3">
                <View className="flex-row items-start gap-3">
                  <CheckCircle color="#059669" size={20} />
                  <Text className="text-gray-700 text-sm flex-1">
                    Track all produce from your farm
                  </Text>
                </View>
                <View className="flex-row items-start gap-3">
                  <CheckCircle color="#059669" size={20} />
                  <Text className="text-gray-700 text-sm flex-1">
                    Access government subsidies
                  </Text>
                </View>
                <View className="flex-row items-start gap-3">
                  <CheckCircle color="#059669" size={20} />
                  <Text className="text-gray-700 text-sm flex-1">
                    Blockchain-verified records
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const actionButtons = (
    <View className="bg-white border-t border-gray-200 px-6 py-4">
      <View className={`gap-3 ${isDesktop ? "flex-row justify-end" : ""}`}>
        <TouchableOpacity
          onPress={() => {
            if (isEditMode) {
              handleCancelEdit();
            } else {
              router.back();
            }
          }}
          disabled={isLoading}
          className={`border border-gray-300 rounded-lg py-3 items-center ${
            isDesktop ? "px-8" : ""
          }`}
        >
          <Text className="text-gray-700 text-[15px] font-semibold">
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleRegisterOrUpdateFarm}
          disabled={isLoading}
          className={`rounded-lg overflow-hidden ${isDesktop ? "px-8" : ""}`}
        >
          <LinearGradient
            colors={["#22c55e", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-3 items-center justify-center"
          >
            {isLoading ? (
              <Text className="text-white text-[15px] font-semibold">
                {isEditMode ? "Updating..." : "Registering..."}
              </Text>
            ) : (
              <Text className="text-white text-[15px] font-semibold">
                {isEditMode ? "Update Farm" : "Register Farm"}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isDesktop) {
    return (
      <>
        <FarmerLayout
          headerTitle={isEditMode ? "Edit Farm" : "Register New Farm"}
          headerSubtitle={
            isEditMode
              ? "Update your farm details"
              : "Add your farm details to start recording produce"
          }
        >
          {formContent}
          {actionButtons}
        </FarmerLayout>

        <Modal visible={showSuccessModal} transparent animationType="fade">
          <View className="flex-1 bg-black/50 items-center justify-center px-6">
            <View className="bg-white rounded-2xl p-8 items-center max-w-sm w-full">
              <View className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-4">
                <CheckCircle color="#059669" size={40} />
              </View>
              <Text className="text-gray-900 text-xl font-bold mb-2 text-center">
                {isEditMode
                  ? "Farm Updated Successfully!"
                  : "Farm Successfully Registered!"}
              </Text>
              <Text className="text-gray-600 text-sm text-center">
                {isEditMode
                  ? "Your farm information has been updated"
                  : "Your farm has been added to the platform"}
              </Text>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="overflow-hidden">
          <LinearGradient
            colors={["#22c55e", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="px-6 py-8 pb-12"
          >
            <TouchableOpacity
              onPress={() => {
                if (isEditMode) {
                  handleCancelEdit();
                } else {
                  router.back();
                }
              }}
              className="flex-row items-center mb-6"
            >
              <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity>
            <View className="flex-row items-center gap-3 mb-2">
              <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
                <Warehouse color="#fff" size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-white text-2xl font-bold">
                  {isEditMode ? "Edit Farm" : "Register New Farm"}
                </Text>
                <Text className="text-white/90 text-sm mt-1">
                  {isEditMode
                    ? "Update your farm details"
                    : "Add your farm details to start recording produce"}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {formContent}
        </ScrollView>

        {actionButtons}
      </KeyboardAvoidingView>

      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-white rounded-2xl p-8 items-center max-w-sm w-full">
            <View className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-4">
              <CheckCircle color="#059669" size={40} />
            </View>
            <Text className="text-gray-900 text-xl font-bold mb-2 text-center">
              {isEditMode
                ? "Farm Updated Successfully!"
                : "Farm Successfully Registered!"}
            </Text>
            <Text className="text-gray-600 text-sm text-center">
              {isEditMode
                ? "Your farm information has been updated"
                : "Your farm has been added to the platform"}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}
