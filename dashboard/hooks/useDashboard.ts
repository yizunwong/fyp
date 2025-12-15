import {
  useDashboardControllerGetStats,
  useDashboardControllerGetRetailerOrderStats,
  useDashboardControllerGetFarmerStats,
  useDashboardControllerGetProgramStats,
} from "@/api";
import { parseError } from "@/utils/format-error";

export function useDashboardStats() {
  const query = useDashboardControllerGetStats();
  return {
    ...query,
    stats: query.data?.data,
    error: query.error ? parseError(query.error) : null,
  };
}

export function useRetailerOrderStats() {
  const query = useDashboardControllerGetRetailerOrderStats();
  return {
    ...query,
    stats: query.data?.data,
    error: query.error ? parseError(query.error) : null,
  };
}

export function useFarmerDashboardStats() {
  const query = useDashboardControllerGetFarmerStats();
  return {
    ...query,
    stats: query.data?.data,
    error: query.error ? parseError(query.error) : null,
  };
}

export function useProgramStats() {
  const query = useDashboardControllerGetProgramStats();
  return {
    ...query,
    stats: query.data?.data,
    error: query.error ? parseError(query.error) : null,
  };
}

export default function useDashboard() {
  const statsQuery = useDashboardStats();
  const ordersQuery = useRetailerOrderStats();
  const programStatsQuery = useProgramStats();
  return {
    stats: statsQuery.stats,
    isLoading: statsQuery.isLoading,
    orderStats: ordersQuery.stats,
    isOrderStatsLoading: ordersQuery.isLoading,
    programStats: programStatsQuery.stats,
    isProgramStatsLoading: programStatsQuery.isLoading,
  };
}
