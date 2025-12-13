export interface Subsidy {
  id: string;
  programName: string;
  applicationDate: string;
  amount: number;
  status: "approved" | "pending" | "rejected";
  description: string;
  farmName: string;
  produceBatch?: string;
  approvalDate?: string;
  paymentStatus?: "paid" | "processing" | "pending";
}

export interface SubsidyStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  totalAmount: number;
}

export interface ClaimValidationErrors {
  amount?: string;
  evidence?: string;
}
