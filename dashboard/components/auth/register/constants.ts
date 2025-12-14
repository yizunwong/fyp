import { Sprout, Store, Building2 } from "lucide-react-native";

export type RegisterRole = "farmer" | "retailer" | "agency";

export const roleConfig = {
  farmer: {
    label: "Farmer",
    icon: Sprout,
    gradientColors: ["#22c55e", "#059669"] as const,
    description: "Join as a farmer to manage your crops and supply chain",
  },
  retailer: {
    label: "Retailer",
    icon: Store,
    gradientColors: ["#3b82f6", "#06b6d4"] as const,
    description: "Join as a retailer to track product distribution",
  },
  agency: {
    label: "Government Agency",
    icon: Building2,
    gradientColors: ["#8b5cf6", "#7c3aed"] as const,
    description: "Join as an agency to monitor and regulate",
  },
} as const;

export type RoleConfig = typeof roleConfig[RegisterRole];
export type SelectableRegisterRole = RegisterRole;
