import { Sprout, Store, Building2 } from "lucide-react-native";

export type UserRole = "farmer" | "retailer" | "government" | null;

export const roles = [
  {
    id: "farmer" as const,
    label: "Farmer",
    icon: Sprout,
    description: "Manage crops and supply chain",
    bgColor: "#22c55e",
  },
  {
    id: "retailer" as const,
    label: "Retailer",
    icon: Store,
    description: "Track product distribution",
    bgColor: "#3b82f6",
  },
  {
    id: "government" as const,
    label: "Government Agency",
    icon: Building2,
    description: "Monitor and regulate",
    bgColor: "#a855f7",
  },
];

