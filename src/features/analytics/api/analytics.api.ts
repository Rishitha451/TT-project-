import { apiClient } from '../../../lib/api-client';
import { API_ENDPOINTS } from '../../../lib/api-contracts';
import type { AnalyticsSummary } from '../../../types';

export const fetchAnalyticsSummary = async (timeframe = '6m'): Promise<AnalyticsSummary> => {
  const response = await apiClient.get<AnalyticsSummary>(`${API_ENDPOINTS.ANALYTICS.SUMMARY}?timeframe=${timeframe}`);
  if (!response.success || !response.data) {
    throw response.error || { code: 'ANALYTICS_FETCH_FAILED', message: 'Unable to load analytics summary' };
  }
  return response.data;
};
