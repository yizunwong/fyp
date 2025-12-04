import type {
  PendingFarmResponseDtoSizeUnit,
  PendingFarmResponseDtoVerificationStatus,
} from "@/api";

export type StatusStyle = {
  badge: string;
  text: string;
  label: string;
};

export const STATUS_STYLES: Record<PendingFarmResponseDtoVerificationStatus, StatusStyle> = {
  PENDING: {
    badge: "bg-yellow-100 border border-yellow-200",
    text: "text-yellow-800",
    label: "Pending review",
  },
  VERIFIED: {
    badge: "bg-green-100 border border-green-200",
    text: "text-green-800",
    label: "Verified",
  },
  REJECTED: {
    badge: "bg-red-100 border border-red-200",
    text: "text-red-800",
    label: "Rejected",
  },
};

export const formatSizeUnit = (unit?: PendingFarmResponseDtoSizeUnit) => {
  switch (unit) {
    case "HECTARE":
      return "ha";
    case "ACRE":
      return "acre";
    case "SQUARE_METER":
      return "m2";
    default:
      return unit ?? "";
  }
};

export const formatDate = (value?: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
