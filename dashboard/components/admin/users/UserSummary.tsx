import { View, Text } from "react-native";
import { User, Mail, Phone, Hash, Shield, Building2, MapPin, Briefcase } from "lucide-react-native";
import type { CreateUserFormValues, EditUserFormValues } from "@/validation/user";
import { CreateUserDtoRole } from "@/api";

const getRoleLabel = (role: CreateUserDtoRole): string => {
  switch (role) {
    case CreateUserDtoRole.FARMER:
      return "Farmer";
    case CreateUserDtoRole.RETAILER:
      return "Retailer";
    case CreateUserDtoRole.GOVERNMENT_AGENCY:
      return "Government Agency";
    case CreateUserDtoRole.ADMIN:
      return "Admin";
    default:
      return "User";
  }
};

const getRoleColor = (role: CreateUserDtoRole): string => {
  switch (role) {
    case CreateUserDtoRole.FARMER:
      return "#059669";
    case CreateUserDtoRole.RETAILER:
      return "#3b82f6";
    case CreateUserDtoRole.GOVERNMENT_AGENCY:
      return "#8b5cf6";
    case CreateUserDtoRole.ADMIN:
      return "#dc2626";
    default:
      return "#6b7280";
  }
};

interface UserSummaryProps {
  formData: CreateUserFormValues | EditUserFormValues;
  compact?: boolean;
}

export default function UserSummary({
  formData,
  compact = false,
}: UserSummaryProps) {
  const roleLabel = getRoleLabel(formData.role);
  const roleColor = getRoleColor(formData.role);

  const hasRetailerInfo =
    formData.role === CreateUserDtoRole.RETAILER &&
    (formData.companyName || formData.businessAddress);
  const hasAgencyInfo =
    formData.role === CreateUserDtoRole.GOVERNMENT_AGENCY &&
    (formData.agencyName || formData.department);

  return (
    <View
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${
        compact ? "mt-6" : ""
      } p-6 md:p-8`}
    >
      <Text className="text-gray-900 text-lg font-semibold mb-1">
        User Preview
      </Text>
      <Text className="text-gray-500 text-sm mb-6">
        See how this user will appear in the system
      </Text>

      <View className="flex-row items-center gap-3 mb-6">
        <View
          className="w-14 h-14 rounded-2xl items-center justify-center"
          style={{ backgroundColor: `${roleColor}20` }}
        >
          <User color={roleColor} size={28} />
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 text-lg font-semibold">
            {formData.username || "New User"}
          </Text>
          <Text className="text-gray-500 text-sm">{roleLabel}</Text>
        </View>
      </View>

      <View className="bg-gray-50 rounded-2xl p-5 mb-6">
        <View className="flex-row items-center gap-3 mb-4">
          <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
            <Mail color="#6b7280" size={18} />
          </View>
          <View className="flex-1">
            <Text className="text-gray-500 text-xs tracking-wide uppercase">
              Email
            </Text>
            <Text className="text-gray-900 text-sm font-semibold" numberOfLines={1}>
              {formData.email || "Not provided"}
            </Text>
          </View>
        </View>

        {formData.phone ? (
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
              <Phone color="#6b7280" size={18} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs tracking-wide uppercase">
                Phone
              </Text>
              <Text className="text-gray-900 text-sm font-semibold">
                {formData.phone}
              </Text>
            </View>
          </View>
        ) : null}

        <View className="flex-row items-center gap-3 mb-4">
          <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
            <Hash color="#6b7280" size={18} />
          </View>
          <View className="flex-1">
            <Text className="text-gray-500 text-xs tracking-wide uppercase">
              NRIC
            </Text>
            <Text className="text-gray-900 text-sm font-semibold">
              {formData.nric || "Not provided"}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
            <Shield color={roleColor} size={18} />
          </View>
          <View className="flex-1">
            <Text className="text-gray-500 text-xs tracking-wide uppercase">
              Role
            </Text>
            <Text
              className="text-sm font-semibold"
              style={{ color: roleColor }}
            >
              {roleLabel}
            </Text>
          </View>
        </View>
      </View>

      {hasRetailerInfo ? (
        <View className="bg-blue-50 rounded-2xl p-5 mb-6">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
              <Building2 color="#3b82f6" size={18} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs tracking-wide uppercase">
                Company
              </Text>
              <Text className="text-gray-900 text-sm font-semibold" numberOfLines={2}>
                {formData.companyName || "Not provided"}
              </Text>
            </View>
          </View>
          {formData.businessAddress ? (
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
                <MapPin color="#3b82f6" size={18} />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-xs tracking-wide uppercase">
                  Business Address
                </Text>
                <Text className="text-gray-900 text-sm font-semibold" numberOfLines={2}>
                  {formData.businessAddress}
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      ) : null}

      {hasAgencyInfo ? (
        <View className="bg-purple-50 rounded-2xl p-5">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
              <Briefcase color="#8b5cf6" size={18} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs tracking-wide uppercase">
                Agency
              </Text>
              <Text className="text-gray-900 text-sm font-semibold" numberOfLines={2}>
                {formData.agencyName || "Not provided"}
              </Text>
            </View>
          </View>
          {formData.department ? (
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
                <Building2 color="#8b5cf6" size={18} />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-xs tracking-wide uppercase">
                  Department
                </Text>
                <Text className="text-gray-900 text-sm font-semibold" numberOfLines={2}>
                  {formData.department}
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

