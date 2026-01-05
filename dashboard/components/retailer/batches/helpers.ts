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
  if (!cert) return { label: "N/A", color: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" };
  switch (cert.toLowerCase()) {
    case "mygap":
      return { label: "MyGAP", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" };
    case "organic":
      return { label: "Organic", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" };
    default:
      return { label: cert, color: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" };
  }
};

export const getStatusColor = (status: string) => {
  if (status === "IN_TRANSIT") return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
  if (status === "ARRIVED") return "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300";
  if (status === "RETAILER_VERIFIED") return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
  if (status === "ARCHIVED") return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
  if (status === "ONCHAIN_CONFIRMED") return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300";
  return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
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
