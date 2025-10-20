import { View, Text } from "react-native";
import { Warehouse, MapPin, Ruler, Leaf, FileText } from "lucide-react-native";
import { FARM_SIZE_UNIT_LABELS, RegisterFarmFormData } from "@/validation/farm";

const formatFileSize = (size?: number) => {
  if (!size || size <= 0) return "Unknown size";
  const units = ["B", "KB", "MB", "GB"];
  let current = size;
  let index = 0;

  while (current >= 1024 && index < units.length - 1) {
    current /= 1024;
    index += 1;
  }

  return `${current.toFixed(current >= 10 || current % 1 === 0 ? 0 : 1)} ${
    units[index]
  }`;
};

const formatCertificationType = (
  type: RegisterFarmFormData["certifications"][number]["type"],
  otherType?: string
) => {
  switch (type) {
    case "HALAL":
      return "Halal";
    case "MYGAP":
      return "MyGAP";
    case "ORGANIC":
      return "Organic";
    case "OTHER":
    default:
      return otherType?.trim() ? otherType.trim() : "Other certification";
  }
};

const formatCertificationDates = (issue?: string | null, expiry?: string | null) => {
  if (!issue && !expiry) {
    return "No dates provided";
  }
  if (issue && expiry) {
    return `Issued ${issue} | Expires ${expiry}`;
  }
  if (issue) {
    return `Issued ${issue}`;
  }
  return `Expires ${expiry}`;
};

interface FarmPreviewCardProps {
  formData: RegisterFarmFormData;
  compact?: boolean;
}

export default function FarmPreviewCard({
  formData,
  compact = false,
}: FarmPreviewCardProps) {
  const landDocuments = Array.isArray(formData.landDocuments)
    ? formData.landDocuments
    : [];
  const certifications = Array.isArray(formData.certifications)
    ? formData.certifications
    : [];
  const hasLandDocuments = landDocuments.length > 0;
  const hasCertifications = certifications.length > 0;

  return (
    <View
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${
        compact ? "mt-6" : ""
      } p-6 md:p-8`}
    >
      <Text className="text-gray-900 text-lg font-semibold mb-1">
        Registration Preview
      </Text>
      <Text className="text-gray-500 text-sm mb-6">
        See how this farm will appear in your records
      </Text>

      <View className="flex-row items-center gap-3 mb-6">
        <View className="w-14 h-14 bg-emerald-100 rounded-2xl items-center justify-center">
          <Warehouse color="#047857" size={28} />
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 text-lg font-semibold">
            {formData.name || "New Farm"}
          </Text>
          <Text className="text-gray-500 text-sm">
            {formData.location || "Location pending"}
          </Text>
        </View>
      </View>

      <View className="bg-emerald-50 rounded-2xl p-5 mb-6">
        <View className="flex-row items-center gap-3 mb-4">
          <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
            <MapPin color="#059669" size={18} />
          </View>
          <View className="flex-1">
            <Text className="text-gray-500 text-xs tracking-wide uppercase">
              Location
            </Text>
            <Text className="text-gray-900 text-sm font-semibold">
              {formData.location || "Not provided"}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-3 mb-4">
          <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
            <Ruler color="#059669" size={18} />
          </View>
          <View className="flex-1">
            <Text className="text-gray-500 text-xs tracking-wide uppercase">
              Farm Size
            </Text>
            <Text className="text-gray-900 text-sm font-semibold">
              {formData.size
                ? `${formData.size} ${
                    FARM_SIZE_UNIT_LABELS[
                      formData.sizeUnit as keyof typeof FARM_SIZE_UNIT_LABELS
                    ] ?? formData.sizeUnit
                  }`
                : "Not set"}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
            <Leaf color="#059669" size={18} />
          </View>
          <View className="flex-1">
            <Text className="text-gray-500 text-xs tracking-wide uppercase">
              Primary Crops
            </Text>
            <Text className="text-gray-900 text-sm font-semibold">
              {formData.primaryCrops || "Not listed"}
            </Text>
          </View>
        </View>
      </View>

      <View className="bg-gray-50 rounded-2xl p-5">
        <View className="flex-row items-center gap-3 mb-4">
          <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
            <FileText color="#6b7280" size={18} />
          </View>
          <View className="flex-1">
            <Text className="text-gray-500 text-xs tracking-wide uppercase">
              Land Documents
            </Text>
            <Text className="text-gray-900 text-sm font-semibold">
              {hasLandDocuments
                ? `${landDocuments.length} file${landDocuments.length === 1 ? "" : "s"} attached`
                : "No documents uploaded"}
            </Text>
          </View>
        </View>
        {hasLandDocuments ? (
          <View className="gap-2">
            {landDocuments.slice(0, 3).map((doc) => (
              <View
                key={doc.id}
                className="border border-gray-200 rounded-xl bg-white px-3 py-2"
              >
                <Text className="text-gray-800 text-xs font-medium" numberOfLines={1}>
                  {doc.name}
                </Text>
                <Text className="text-gray-500 text-xs mt-1">
                  {formatFileSize(doc.size)}
                </Text>
              </View>
            ))}
            {landDocuments.length > 3 ? (
              <Text className="text-gray-400 text-xs">
                +{landDocuments.length - 3} more document
                {landDocuments.length - 3 === 1 ? "" : "s"}
              </Text>
            ) : null}
          </View>
        ) : (
          <Text className="text-gray-500 text-xs">
            Upload land titles, tenancy agreements or registration proof.
          </Text>
        )}

        <View className="border-t border-gray-200 my-4" />

        <View className="flex-row items-center gap-3 mb-4">
          <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
            <FileText color="#6b7280" size={18} />
          </View>
          <View className="flex-1">
            <Text className="text-gray-500 text-xs tracking-wide uppercase">
              Certifications
            </Text>
            <Text className="text-gray-900 text-sm font-semibold">
              {hasCertifications
                ? `${certifications.length} certification${
                    certifications.length === 1 ? "" : "s"
                  } added`
                : "No certifications added"}
            </Text>
          </View>
        </View>
        {hasCertifications ? (
          <View className="gap-3">
            {certifications.slice(0, 2).map((cert, index) => (
              <View
                key={`${cert.type}-${index}`}
                className="border border-gray-200 rounded-xl bg-white px-3 py-2"
              >
                <Text className="text-gray-800 text-sm font-semibold">
                  {formatCertificationType(cert.type, cert.otherType)}
                </Text>
                <Text className="text-gray-500 text-xs mt-1">
                  {formatCertificationDates(cert.issueDate, cert.expiryDate)}
                </Text>
                <Text className="text-gray-400 text-xs mt-1">
                  {(cert.documents?.length ?? 0)} file
                  {(cert.documents?.length ?? 0) === 1 ? "" : "s"}
                </Text>
              </View>
            ))}
            {certifications.length > 2 ? (
              <Text className="text-gray-400 text-xs">
                +{certifications.length - 2} more certification
                {certifications.length - 2 === 1 ? "" : "s"}
              </Text>
            ) : null}
          </View>
        ) : (
          <Text className="text-gray-500 text-xs">
            Add Halal, MyGAP, Organic or other certificates to boost buyer confidence.
          </Text>
        )}
      </View>
    </View>
  );
}
