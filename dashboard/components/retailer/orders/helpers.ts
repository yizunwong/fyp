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
      color: "bg-purple-100 text-purple-700",
      icon: Truck,
      iconColor: "#7c3aed",
    };
  if (status === "ARRIVED")
    return {
      label: "Arrived",
      color: "bg-emerald-100 text-emerald-700",
      icon: CheckCircle,
      iconColor: "#10b981",
    };
  if (status === "RETAILER_VERIFIED")
    return {
      label: "Accepted",
      color: "bg-green-100 text-green-700",
      icon: CheckCircle,
      iconColor: "#15803d",
    };
  if (status === "ARCHIVED")
    return {
      label: "Cancelled",
      color: "bg-red-100 text-red-700",
      icon: XCircle,
      iconColor: "#dc2626",
    };
  if (status === "ONCHAIN_CONFIRMED")
    return {
      label: "Processing",
      color: "bg-blue-100 text-blue-700",
      icon: Package,
      iconColor: "#2563eb",
    };
  return {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700",
    icon: Clock,
    iconColor: "#b45309",
  };
};
