import { View, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { Filter, Search, ChevronDown, ChevronUp, X } from "lucide-react-native";
import type { UserResponseDtoRole } from "@/api";

export type RoleFilter = "ALL" | UserResponseDtoRole;

type UserFiltersProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  roleFilter: RoleFilter;
  onRoleChange: (role: RoleFilter) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onClearRoleFilter: () => void;
};

const getRoleLabel = (role: RoleFilter): string => {
  switch (role) {
    case "ALL":
      return "All";
    case "FARMER":
      return "Farmer";
    case "RETAILER":
      return "Retailer";
    case "GOVERNMENT_AGENCY":
      return "Government Agency";
    case "ADMIN":
      return "Admin";
    default:
      return role;
  }
};

const UserFilters = ({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleChange,
  showFilters,
  onToggleFilters,
  onClearRoleFilter,
}: UserFiltersProps) => {
  const roles: { key: RoleFilter; label: string }[] = [
    { key: "ALL", label: "All" },
    { key: "FARMER", label: "Farmer" },
    { key: "RETAILER", label: "Retailer" },
    { key: "GOVERNMENT_AGENCY", label: "Government Agency" },
    { key: "ADMIN", label: "Admin" },
  ];

  return (
    <View className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
      <View className="flex-row items-center gap-3 mb-4">
        <View className="flex-1 flex-row items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm">
          <Search color="#9ca3af" size={20} />
          <TextInput
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Search by email, username, or NRIC"
            className="flex-1 text-gray-900 text-sm"
            placeholderTextColor="#9ca3af"
          />
        </View>
        <TouchableOpacity
          onPress={onToggleFilters}
          className="flex-row items-center gap-1 px-3 h-10 bg-purple-50 rounded-lg border border-purple-200"
        >
          <Filter color="#7c3aed" size={18} />
          {showFilters ? (
            <ChevronUp color="#7c3aed" size={16} />
          ) : (
            <ChevronDown color="#7c3aed" size={16} />
          )}
          <Text className="text-purple-700 text-xs font-semibold">Filters</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
        <View className="flex-row gap-2">
          {roles.map((role) => (
            <TouchableOpacity
              key={role.key}
              onPress={() => onRoleChange(role.key)}
              className={`px-4 py-2 rounded-full border ${
                roleFilter === role.key
                  ? "bg-purple-50 border-purple-500"
                  : "bg-white border-gray-300"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  roleFilter === role.key ? "text-purple-700" : "text-gray-700"
                }`}
              >
                {role.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View className="flex-row flex-wrap gap-2 mb-1">
        {roleFilter !== "ALL" && (
          <TouchableOpacity
            onPress={onClearRoleFilter}
            className="flex-row items-center gap-1 px-3 py-1.5 bg-purple-50 rounded-full border border-purple-200"
          >
            <Text className="text-xs text-purple-700 font-semibold">
              {getRoleLabel(roleFilter)}
            </Text>
            <X color="#7c3aed" size={14} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default UserFilters;

