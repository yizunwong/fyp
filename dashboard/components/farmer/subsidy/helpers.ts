export type SubsidyStatusFilter =
  | "ALL"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "DISBURSED";

export const getStatusLabel = (status: string) => {
  if (status === "PENDING") return "Pending";
  if (status === "APPROVED") return "Approved";
  if (status === "REJECTED") return "Rejected";
  if (status === "DISBURSED") return "Disbursed";
  return "All";
};

export const displayDateValue = (value: string) => {
  return value?.trim() ? value.trim() : "Select date";
};
