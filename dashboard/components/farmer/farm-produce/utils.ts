import type { ProduceListResponseDto } from "@/api";

export const formatDate = (dateInput: string | Date | undefined | null) => {
  if (!dateInput) return "-";
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatCurrency = (amount: number) => {
  return `RM ${amount.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`;
};

export const formatQuantity = (quantity?: number, unit?: string | null) => {
  if (typeof quantity !== "number" || Number.isNaN(quantity)) {
    return "--";
  }

  const normalizedUnit = unit ?? "";
  return `${quantity.toLocaleString()} ${normalizedUnit}`.trim();
};

export const getQrCodeUrl = (batch: ProduceListResponseDto) => {
  const fromCamel = (batch as { qrCode?: string | null }).qrCode;
  if (typeof fromCamel === "string" && fromCamel.trim().length) {
    return fromCamel;
  }

  const fromSnake = (batch as { qr_code?: string | null }).qr_code;
  if (typeof fromSnake === "string" && fromSnake.trim().length) {
    return fromSnake;
  }

  return "";
};

export const getCertificationStyles = (label: string) => {
  const normalized = label.toLowerCase();

  if (normalized.includes("organic")) {
    return {
      container: "bg-amber-100 border border-amber-200",
      text: "text-amber-700",
    };
  }

  if (normalized.includes("halal")) {
    return {
      container: "bg-blue-100 border border-blue-200",
      text: "text-blue-700",
    };
  }

  if (normalized.includes("gap")) {
    return {
      container: "bg-emerald-100 border border-emerald-200",
      text: "text-emerald-700",
    };
  }

  return {
    container: "bg-lime-100 border border-lime-200",
    text: "text-lime-700",
  };
};
