import { useQuery } from '@tanstack/react-query';
import { fetchDashboardData } from '../api/dashboard.api';

export const DASHBOARD_QUERY_KEY = ['dashboard', 'summary'];

export const useDashboard = () => {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};
