import { useQuery } from '@tanstack/react-query';
import { CACHE_TIMES } from '@/config/query-config';
import { fetchDashboardSummary } from '@/modules/dashboard/services/dashboard.service';

export const dashboardKeys = {
  summary: ['dashboard', 'summary'] as const,
};

export const useDashboardSummary = () => {
  const query = useQuery({
    queryKey: dashboardKeys.summary,
    queryFn: fetchDashboardSummary,
    staleTime: CACHE_TIMES.LIST_STALE,
    gcTime: CACHE_TIMES.LIST_GC,
  });

  return {
    summary: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
};
