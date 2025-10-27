export type VerificationStatus = "verified" | "pending" | "failed";

export type StatusFilter = VerificationStatus | "all";

export type SortOption =
  | "harvest_desc"
  | "harvest_asc"
  | "quantity_desc"
  | "quantity_asc";

export type FarmProduceStats = {
  total: number;
  verified: number;
  verifiedPercentage: number;
  lastHarvestDate: string | null;
};
