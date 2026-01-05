import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
} from "lucide-react-native";

export const toStatusInfo = (status: string) => {
  if (status === "IN_TRANSIT")
    return {
      label: "In Transit",
      color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
      icon: Truck,
      iconColor: "#7c3aed",
    };
  if (status === "ARRIVED")
    return {
      label: "Arrived",
      color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
      icon: CheckCircle,
      iconColor: "#10b981",
    };
  if (status === "RETAILER_VERIFIED")
    return {
      label: "Accepted",
      color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
      icon: CheckCircle,
      iconColor: "#15803d",
    };
  if (status === "ARCHIVED")
    return {
      label: "Cancelled",
      color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
      icon: XCircle,
      iconColor: "#dc2626",
    };
  if (status === "ONCHAIN_CONFIRMED")
    return {
      label: "Processing",
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
      icon: Package,
      iconColor: "#2563eb",
    };
  return {
    label: "Pending",
    color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
    icon: Clock,
    iconColor: "#b45309",
  };
};
