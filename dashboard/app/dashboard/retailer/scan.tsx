import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  useWindowDimensions,
  Modal,
} from "react-native";
import {
  Camera,
  QrCode,
  CheckCircle,
  Star,
  AlertCircle,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAppLayout } from "@/components/layout/AppLayoutContext";

interface ScannedBatch {
  batchNumber: string;
  produceType: string;
  farmName: string;
  farmerName: string;
  quantity: number;
  unit: string;
  harvestDate: string;
  certification: string;
  location: string;
  blockchainHash: string;
  verified: boolean;
  rating: number;
}

export default function ScanQRScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 1024;

  const [scanning, setScanning] = useState(false);
  const [scannedBatch, setScannedBatch] = useState<ScannedBatch | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  useAppLayout({
    title: "QR Code Scanner",
    subtitle: "Verify produce authenticity and traceability",
    mobile: {
      disableScroll: false,
    },
  });

  const mockScannedData: ScannedBatch = {
    batchNumber: "BTH-001-2025",
    produceType: "Organic Tomatoes",
    farmName: "Faizal Farm",
    farmerName: "Mohd Faizal bin Ahmad",
    quantity: 500,
    unit: "kg",
    harvestDate: "2025-12-08",
    certification: "MyGAP",
    location: "Kubang Pasu, Kedah",
    blockchainHash:
      "0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385",
    verified: true,
    rating: 4.8,
  };

  const handleStartScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScannedBatch(mockScannedData);
      setScanning(false);
      setShowResultModal(true);
    }, 2000);
  };

  const handleCloseScan = () => {
    setScanning(false);
    setScannedBatch(null);
  };

  const handleCloseResult = () => {
    setShowResultModal(false);
    setScannedBatch(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const pageContent = (
    <View className="px-6 py-6">
      <View className="mb-6">
        <Text className="text-gray-900 text-xl font-bold mb-2">
          QR Code Scanner
        </Text>
        <Text className="text-gray-600 text-sm">
          Scan QR codes on produce packaging to verify authenticity and view
          batch details
        </Text>
      </View>

      {!scanning ? (
        <>
          <View className="bg-white rounded-2xl p-8 border border-gray-200 mb-6 items-center">
            <View className="w-32 h-32 bg-orange-50 rounded-full items-center justify-center mb-6">
              <QrCode color="#ea580c" size={64} />
            </View>
            <Text className="text-gray-900 text-xl font-bold mb-2">
              Ready to Scan
            </Text>
            <Text className="text-gray-600 text-sm text-center mb-6">
              Position the QR code within the camera frame
            </Text>
            <TouchableOpacity
              onPress={handleStartScan}
              className="rounded-lg overflow-hidden w-full"
            >
              <LinearGradient
                colors={["#ea580c", "#c2410c"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="flex-row items-center justify-center gap-2 py-4"
              >
                <Camera color="#fff" size={24} />
                <Text className="text-white text-base font-bold">
                  Start Scanning
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
            <Text className="text-blue-700 text-sm font-bold mb-3">
              How to Use QR Scanner:
            </Text>
            <View className="gap-2">
              <View className="flex-row gap-2">
                <Text className="text-blue-600 text-sm">1.</Text>
                <Text className="text-blue-600 text-sm flex-1">
                  Point camera at the QR code on produce packaging
                </Text>
              </View>
              <View className="flex-row gap-2">
                <Text className="text-blue-600 text-sm">2.</Text>
                <Text className="text-blue-600 text-sm flex-1">
                  Hold steady until scan completes
                </Text>
              </View>
              <View className="flex-row gap-2">
                <Text className="text-blue-600 text-sm">3.</Text>
                <Text className="text-blue-600 text-sm flex-1">
                  View blockchain verification and batch details
                </Text>
              </View>
              <View className="flex-row gap-2">
                <Text className="text-blue-600 text-sm">4.</Text>
                <Text className="text-blue-600 text-sm flex-1">
                  Place order directly from scanned results
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-green-50 rounded-lg p-4 border border-green-200">
            <View className="flex-row items-center gap-2 mb-2">
              <CheckCircle color="#15803d" size={20} />
              <Text className="text-green-700 text-sm font-bold">
                Benefits of QR Verification:
              </Text>
            </View>
            <View className="gap-1">
              <Text className="text-green-600 text-sm">
                - Instant blockchain verification
              </Text>
              <Text className="text-green-600 text-sm">
                - Complete farm-to-table traceability
              </Text>
              <Text className="text-green-600 text-sm">
                - Quality and certification confirmation
              </Text>
              <Text className="text-green-600 text-sm">
                - Farmer ratings and reviews
              </Text>
            </View>
          </View>
        </>
      ) : (
        <View className="bg-white rounded-2xl overflow-hidden border border-gray-200">
          <View className="bg-gray-900 aspect-square items-center justify-center">
            <View className="w-64 h-64 border-4 border-orange-500 rounded-2xl items-center justify-center">
              <Camera color="#fff" size={64} />
            </View>
            <Text className="text-white text-sm mt-6">Scanning QR Code...</Text>
            <View className="flex-row gap-1 mt-2">
              <View className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <View
                className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"
                style={{ animationDelay: "200ms" }}
              />
              <View
                className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"
                style={{ animationDelay: "400ms" }}
              />
            </View>
          </View>
          <View className="p-4">
            <TouchableOpacity
              onPress={handleCloseScan}
              className="bg-gray-200 rounded-lg py-3 items-center"
            >
              <Text className="text-gray-700 text-sm font-semibold">
                Cancel Scan
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {pageContent}

      {isDesktop ? (
        <Modal visible={showResultModal} transparent animationType="fade">
          <View className="flex-1 bg-black/50 items-center justify-center px-6">
            <View className="bg-white rounded-2xl p-6 max-w-md w-full">
              {scannedBatch && (
                <>
                  <View className="items-center mb-6">
                    {scannedBatch.verified ? (
                      <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
                        <CheckCircle color="#15803d" size={40} />
                      </View>
                    ) : (
                      <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-4">
                        <AlertCircle color="#dc2626" size={40} />
                      </View>
                    )}
                    <Text className="text-gray-900 text-xl font-bold mb-2">
                      {scannedBatch.verified
                        ? "Verified Batch"
                        : "Verification Failed"}
                    </Text>
                    <Text className="text-gray-600 text-sm text-center">
                      {scannedBatch.verified
                        ? "This batch has been verified on the blockchain"
                        : "Unable to verify this batch"}
                    </Text>
                  </View>

                  {scannedBatch.verified && (
                    <>
                      <View className="bg-orange-50 rounded-lg p-4 border border-orange-200 mb-4">
                        <Text className="text-orange-900 text-lg font-bold mb-1">
                          {scannedBatch.produceType}
                        </Text>
                        <Text className="text-orange-700 text-sm">
                          Batch: {scannedBatch.batchNumber}
                        </Text>
                      </View>

                      <View className="bg-gray-50 rounded-lg p-4 mb-4">
                        <View className="gap-2">
                          <View className="flex-row items-center justify-between">
                            <Text className="text-gray-600 text-sm">Farm</Text>
                            <Text className="text-gray-900 text-sm font-medium">
                              {scannedBatch.farmName}
                            </Text>
                          </View>
                          <View className="flex-row items-center justify-between">
                            <Text className="text-gray-600 text-sm">
                              Farmer
                            </Text>
                            <Text className="text-gray-900 text-sm font-medium">
                              {scannedBatch.farmerName}
                            </Text>
                          </View>
                          <View className="flex-row items-center justify-between">
                            <Text className="text-gray-600 text-sm">
                              Location
                            </Text>
                            <Text className="text-gray-900 text-sm font-medium">
                              {scannedBatch.location}
                            </Text>
                          </View>
                          <View className="flex-row items-center justify-between">
                            <Text className="text-gray-600 text-sm">
                              Quantity
                            </Text>
                            <Text className="text-gray-900 text-sm font-medium">
                              {scannedBatch.quantity} {scannedBatch.unit}
                            </Text>
                          </View>
                          <View className="flex-row items-center justify-between">
                            <Text className="text-gray-600 text-sm">
                              Harvest Date
                            </Text>
                            <Text className="text-gray-900 text-sm font-medium">
                              {formatDate(scannedBatch.harvestDate)}
                            </Text>
                          </View>
                          <View className="flex-row items-center justify-between">
                            <Text className="text-gray-600 text-sm">
                              Certification
                            </Text>
                            <View className="px-2 py-1 bg-blue-100 rounded-full">
                              <Text className="text-blue-700 text-xs font-semibold">
                                {scannedBatch.certification}
                              </Text>
                            </View>
                          </View>
                          <View className="flex-row items-center justify-between">
                            <Text className="text-gray-600 text-sm">
                              Rating
                            </Text>
                            <View className="flex-row items-center gap-1">
                              <Star color="#f59e0b" size={14} fill="#f59e0b" />
                              <Text className="text-gray-900 text-sm font-bold">
                                {scannedBatch.rating}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      <View className="bg-blue-50 rounded-lg p-3 border border-blue-200 mb-4">
                        <Text className="text-blue-700 text-xs font-bold mb-1">
                          Blockchain Hash:
                        </Text>
                        <Text className="text-blue-600 text-xs font-mono break-all">
                          {scannedBatch.blockchainHash}
                        </Text>
                      </View>
                    </>
                  )}

                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      onPress={handleCloseResult}
                      className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
                    >
                      <Text className="text-gray-700 text-sm font-semibold">
                        Close
                      </Text>
                    </TouchableOpacity>
                    {scannedBatch.verified && (
                      <TouchableOpacity
                        onPress={() => {
                          handleCloseResult();
                          router.push("/dashboard/retailer/batches" as any);
                        }}
                        className="flex-1 bg-orange-500 rounded-lg py-3 items-center"
                      >
                        <Text className="text-white text-sm font-semibold">
                          View Full Details
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      ) : (
        <Modal visible={showResultModal} transparent animationType="slide">
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl max-h-[90%]">
              <ScrollView>
                <View className="p-6">
                  {scannedBatch && (
                    <>
                      <View className="items-center mb-6">
                        {scannedBatch.verified ? (
                          <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
                            <CheckCircle color="#15803d" size={40} />
                          </View>
                        ) : (
                          <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-4">
                            <AlertCircle color="#dc2626" size={40} />
                          </View>
                        )}
                        <Text className="text-gray-900 text-xl font-bold mb-2">
                          {scannedBatch.verified
                            ? "Verified Batch"
                            : "Verification Failed"}
                        </Text>
                        <Text className="text-gray-600 text-sm text-center">
                          {scannedBatch.verified
                            ? "This batch has been verified on the blockchain"
                            : "Unable to verify this batch"}
                        </Text>
                      </View>

                      {scannedBatch.verified && (
                        <>
                          <View className="bg-orange-50 rounded-lg p-4 border border-orange-200 mb-4">
                            <Text className="text-orange-900 text-lg font-bold mb-1">
                              {scannedBatch.produceType}
                            </Text>
                            <Text className="text-orange-700 text-sm">
                              Batch: {scannedBatch.batchNumber}
                            </Text>
                          </View>

                          <View className="bg-gray-50 rounded-lg p-4 mb-4">
                            <View className="gap-2">
                              <View className="flex-row items-center justify-between">
                                <Text className="text-gray-600 text-sm">
                                  Farm
                                </Text>
                                <Text className="text-gray-900 text-sm font-medium">
                                  {scannedBatch.farmName}
                                </Text>
                              </View>
                              <View className="flex-row items-center justify-between">
                                <Text className="text-gray-600 text-sm">
                                  Farmer
                                </Text>
                                <Text className="text-gray-900 text-sm font-medium">
                                  {scannedBatch.farmerName}
                                </Text>
                              </View>
                              <View className="flex-row items-center justify-between">
                                <Text className="text-gray-600 text-sm">
                                  Location
                                </Text>
                                <Text className="text-gray-900 text-sm font-medium">
                                  {scannedBatch.location}
                                </Text>
                              </View>
                              <View className="flex-row items-center justify-between">
                                <Text className="text-gray-600 text-sm">
                                  Quantity
                                </Text>
                                <Text className="text-gray-900 text-sm font-medium">
                                  {scannedBatch.quantity} {scannedBatch.unit}
                                </Text>
                              </View>
                              <View className="flex-row items-center justify-between">
                                <Text className="text-gray-600 text-sm">
                                  Harvest Date
                                </Text>
                                <Text className="text-gray-900 text-sm font-medium">
                                  {formatDate(scannedBatch.harvestDate)}
                                </Text>
                              </View>
                              <View className="flex-row items-center justify-between">
                                <Text className="text-gray-600 text-sm">
                                  Certification
                                </Text>
                                <View className="px-2 py-1 bg-blue-100 rounded-full">
                                  <Text className="text-blue-700 text-xs font-semibold">
                                    {scannedBatch.certification}
                                  </Text>
                                </View>
                              </View>
                              <View className="flex-row items-center justify-between">
                                <Text className="text-gray-600 text-sm">
                                  Rating
                                </Text>
                                <View className="flex-row items-center gap-1">
                                  <Star
                                    color="#f59e0b"
                                    size={14}
                                    fill="#f59e0b"
                                  />
                                  <Text className="text-gray-900 text-sm font-bold">
                                    {scannedBatch.rating}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </View>

                          <View className="bg-blue-50 rounded-lg p-3 border border-blue-200 mb-4">
                            <Text className="text-blue-700 text-xs font-bold mb-1">
                              Blockchain Hash:
                            </Text>
                            <Text className="text-blue-600 text-xs font-mono break-all">
                              {scannedBatch.blockchainHash}
                            </Text>
                          </View>
                        </>
                      )}

                      <View className="flex-row gap-3">
                        <TouchableOpacity
                          onPress={handleCloseResult}
                          className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
                        >
                          <Text className="text-gray-700 text-sm font-semibold">
                            Close
                          </Text>
                        </TouchableOpacity>
                        {scannedBatch.verified && (
                          <TouchableOpacity
                            onPress={() => {
                              handleCloseResult();
                              router.push("/dashboard/retailer/batches" as any);
                            }}
                            className="flex-1 bg-orange-500 rounded-lg py-3 items-center"
                          >
                            <Text className="text-white text-sm font-semibold">
                              View Full Details
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
