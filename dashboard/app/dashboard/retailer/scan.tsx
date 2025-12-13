import { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import {
  Camera,
  QrCode,
  CheckCircle,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAppLayout } from "@/components/layout/AppLayoutContext";
import { CameraView, useCameraPermissions } from "expo-camera";

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
  const isWeb = Platform.OS === "web";

  const [cameraPermission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [scannedContent, setScannedContent] = useState<string | null>(null);
  const [, setScannedBatch] = useState<ScannedBatch | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const layoutMeta = useMemo(
    () => ({
      title: "QR Code Scanner",
      subtitle: "Verify produce authenticity and traceability",
      mobile: {
        disableScroll: false,
      },
    }),
    []
  );

  useAppLayout(layoutMeta);

  useEffect(() => {
    if (isWeb) return;
    if (!cameraPermission) {
      requestPermission().catch(() => undefined);
    }
  }, [cameraPermission, isWeb, requestPermission]);

  const hasPermission = isWeb ? true : cameraPermission?.granted === true;

  const parseScannedPayload = useMemo(
    () => (data: string): ScannedBatch => {
      try {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === "object") {
          return {
            batchNumber: parsed.batchNumber ?? parsed.batchId ?? "Unknown",
            produceType: parsed.produceType ?? parsed.name ?? "Unknown Produce",
            farmName: parsed.farmName ?? parsed.farm ?? "Unknown Farm",
            farmerName: parsed.farmerName ?? parsed.farmer ?? "Unknown Farmer",
            quantity: Number(parsed.quantity ?? 0),
            unit: parsed.unit ?? "unit",
            harvestDate: parsed.harvestDate ?? new Date().toISOString(),
            certification: parsed.certification ?? "Pending",
            location: parsed.location ?? "Unknown location",
            blockchainHash:
              parsed.blockchainHash ??
              parsed.hash ??
              "Verification hash unavailable",
            verified: parsed.verified ?? true,
            rating: Number(parsed.rating ?? 0),
          };
        }
      } catch {
        // fall back to defaults below
      }

      return {
        batchNumber: data,
        produceType: "Scanned QR",
        farmName: "Unknown Farm",
        farmerName: "Unknown Farmer",
        quantity: 0,
        unit: "unit",
        harvestDate: new Date().toISOString(),
        certification: "Pending",
        location: "Unknown location",
        blockchainHash: data,
        verified: true,
        rating: 0,
      };
    },
    []
  );

  const handleStartScan = () => {
    if (!hasPermission) return;
    setScanned(false);
    setScannedContent(null);
    setScanning(true);
  };

  const handleCloseScan = () => {
    setScanning(false);
    setScannedBatch(null);
    setScannedContent(null);
    setScanned(false);
    setIsRedirecting(false);
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setScanning(false);
    setScannedContent(data);
    setScannedBatch(parseScannedPayload(data));
    setIsRedirecting(true);

    // If the QR contains a URL, redirect immediately
    try {
      const url = new URL(data);
      router.push(url.toString() as any);
      return;
    } catch {
      // not a URL, fall back to modal preview
    }

    // If the QR contains a verify path, also navigate there
    if (data.startsWith("/verify/") || data.includes("/verify/")) {
      router.push(data as any);
    }
  };


  const pageContent = (
    <View className="px-6 py-6">

      {!scanning ? (
        <>
          {isRedirecting && scannedContent && (
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <Text className="text-blue-700 text-sm font-bold mb-1">
                Redirecting to scanned link...
              </Text>
              <Text className="text-blue-600 text-xs break-all">{scannedContent}</Text>
            </View>
          )}
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
              disabled={!hasPermission}
              className={`rounded-lg overflow-hidden w-full ${
                !hasPermission ? "opacity-50" : ""
              }`}
            >
              <LinearGradient
                colors={["#ea580c", "#c2410c"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="flex-row items-center justify-center gap-2 py-4"
              >
                <Camera color="#fff" size={24} />
                <Text className="text-white text-base font-bold">
                  {!hasPermission ? "Requesting camera permission..." : "Start Scanning"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            {!hasPermission && !isWeb && (
              <Text className="text-red-600 text-xs mt-3 text-center">
                Camera permission required to scan QR codes.
              </Text>
            )}
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
          <View className="bg-gray-900 aspect-square items-center justify-center relative overflow-hidden">
            <CameraView
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={{ width: "100%", height: "100%" }}
            />
            <View className="absolute inset-0 items-center justify-center pointer-events-none">
              <View className="w-64 h-64 border-4 border-orange-500 rounded-2xl" />
              <Text className="text-white text-sm mt-4 bg-black/50 px-3 py-1 rounded-full">
                Align QR within the frame
              </Text>
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
    </View>
  );
}
