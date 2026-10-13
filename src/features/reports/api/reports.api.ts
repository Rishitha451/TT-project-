import { apiClient } from '../../../lib/api-client';
import { API_ENDPOINTS } from '../../../lib/api-contracts';
import { mockReportsService } from '../../../services/mock/reports.mock';
import type { FinancialReport } from '../../../types';

export const fetchReports = async (): Promise<FinancialReport[]> => {
  try {
    const response = await apiClient.get<FinancialReport[]>(API_ENDPOINTS.REPORTS.LIST);
    if (response.success && response.data && Array.isArray(response.data)) {
      return response.data;
    }
  } catch {
    // Graceful fallback to client-side report service when backend reports domain is deferred (501)
  }
  const mockRes = await mockReportsService.getReports();
  return mockRes.data || [];
};

export const generateReportApi = async (type: FinancialReport['type'], period: string): Promise<FinancialReport> => {
  try {
    const response = await apiClient.post<FinancialReport>(API_ENDPOINTS.REPORTS.GENERATE, { type, period });
    if (response.success && response.data) {
      return response.data;
    }
  } catch {
    // Graceful client-side generation fallback
  }
  const mockRes = await mockReportsService.generateReport(type, period);
  if (!mockRes.data) {
    throw new Error('Report generation failed');
  }
  return mockRes.data;
};
