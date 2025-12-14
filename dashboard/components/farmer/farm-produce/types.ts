import type { ProduceListResponseDtoStatus } from "@/api";

export type StatusFilter = "all" | ProduceListResponseDtoStatus;

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
