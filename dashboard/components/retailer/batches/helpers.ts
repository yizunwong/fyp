import type { ProduceListResponseDto } from "@/api";

export type BatchStatusFilter =
  | "ALL"
  | "IN_TRANSIT"
  | "ARRIVED"
  | "RETAILER_VERIFIED"
  | "ARCHIVED";

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const getCertificationBadge = (cert?: string) => {
  if (!cert) return { label: "N/A", color: "bg-gray-100 text-gray-700" };
  switch (cert.toLowerCase()) {
    case "mygap":
      return { label: "MyGAP", color: "bg-blue-100 text-blue-700" };
    case "organic":
      return { label: "Organic", color: "bg-green-100 text-green-700" };
    default:
      return { label: cert, color: "bg-gray-100 text-gray-700" };
  }
};

export const getStatusColor = (status: string) => {
  if (status === "IN_TRANSIT") return "bg-blue-100 text-blue-700";
  if (status === "ARRIVED") return "bg-indigo-100 text-indigo-700";
  if (status === "RETAILER_VERIFIED") return "bg-green-100 text-green-700";
  if (status === "ARCHIVED") return "bg-gray-100 text-gray-700";
  if (status === "ONCHAIN_CONFIRMED") return "bg-yellow-100 text-yellow-700";
  return "bg-gray-100 text-gray-700";
};

export const getStatusLabel = (status: string) => {
  if (status === "IN_TRANSIT") return "In Transit";
  if (status === "ARRIVED") return "Arrived";
  if (status === "RETAILER_VERIFIED") return "Verified";
  if (status === "ARCHIVED") return "Archived";
  if (status === "ONCHAIN_CONFIRMED") return "On-chain Pending";
  return "Pending";
};

export const displayDateValue = (value: string) => {
  return value?.trim() ? value.trim() : "Select date";
};

export type BatchWithDetails = ProduceListResponseDto | null;
