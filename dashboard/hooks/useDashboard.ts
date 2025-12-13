import {
  useDashboardControllerGetStats,
  useDashboardControllerGetRetailerOrderStats,
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

export default function useDashboard() {
  const statsQuery = useDashboardStats();
  const ordersQuery = useRetailerOrderStats();
  return {
    stats: statsQuery.stats,
    isLoading: statsQuery.isLoading,
    orderStats: ordersQuery.stats,
    isOrderStatsLoading: ordersQuery.isLoading,
  };
}
