import { useQuery } from '@tanstack/react-query';
import { fetchAnalyticsSummary } from '../api/analytics.api';

export const ANALYTICS_QUERY_KEY = ['analytics', 'summary'];

export const useAnalytics = (timeframe = '6m') => {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEY, timeframe],
    queryFn: () => fetchAnalyticsSummary(timeframe),
    staleTime: 5 * 60 * 1000,
  });
};
