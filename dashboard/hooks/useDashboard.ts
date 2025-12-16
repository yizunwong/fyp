import {
  useDashboardControllerGetStats,
  useDashboardControllerGetRetailerOrderStats,
  useDashboardControllerGetFarmerStats,
  useDashboardControllerGetProgramStats,
  useDashboardControllerGetSubsidyStats,
  useDashboardControllerGetFarmVerificationStats,
  useDashboardControllerGetAgencySubsidyStats,
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

export function useSubsidyStats() {
  const query = useDashboardControllerGetSubsidyStats();
  return {
    ...query,
    stats: query.data?.data,
    error: query.error ? parseError(query.error) : null,
  };
}

export function useFarmVerificationStats() {
  const query = useDashboardControllerGetFarmVerificationStats();
  return {
    ...query,
    stats: query.data?.data,
    error: query.error ? parseError(query.error) : null,
  };
}

export function useAgencySubsidyStats() {
  const query = useDashboardControllerGetAgencySubsidyStats();
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
