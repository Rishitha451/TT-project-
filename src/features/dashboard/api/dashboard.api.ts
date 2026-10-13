import { apiClient } from '../../../lib/api-client';
import { API_ENDPOINTS } from '../../../lib/api-contracts';
import type { DashboardData } from '../../../types';

export const fetchDashboardData = async (): Promise<DashboardData> => {
  const response = await apiClient.get<DashboardData>(API_ENDPOINTS.DASHBOARD.GET_DATA);
  if (!response.success || !response.data) {
    throw response.error || { code: 'DASHBOARD_FETCH_FAILED', message: 'Unable to load dashboard metrics' };
  }
  return response.data;
};
