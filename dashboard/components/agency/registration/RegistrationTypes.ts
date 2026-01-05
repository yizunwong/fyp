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
    badge: "bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800",
    text: "text-yellow-800 dark:text-yellow-300",
    label: "Pending review",
  },
  VERIFIED: {
    badge: "bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800",
    text: "text-green-800 dark:text-green-300",
    label: "Verified",
  },
  REJECTED: {
    badge: "bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800",
    text: "text-red-800 dark:text-red-300",
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

