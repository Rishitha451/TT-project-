import type { FinancialReport, ApiResponse } from '../../types';

const INITIAL_REPORTS: FinancialReport[] = [
  {
    id: 'r_1',
    name: 'Monthly Cashflow & Spending Analysis',
    period: 'September 2026',
    date: '2026-09-30',
    status: 'Ready',
    type: 'spending',
    fileSize: '1.4 MB',
    downloadUrl: '#',
  },
  {
    id: 'r_2',
    name: 'Quarterly Investment Performance Review',
    period: 'Q3 2026',
    date: '2026-09-30',
    status: 'Ready',
    type: 'portfolio',
    fileSize: '2.8 MB',
    downloadUrl: '#',
  },
  {
    id: 'r_3',
    name: 'Tax Year Preliminary Projection',
    period: 'FY 2025-2026',
    date: '2026-09-15',
    status: 'Ready',
    type: 'tax',
    fileSize: '3.1 MB',
    downloadUrl: '#',
  },
  {
    id: 'r_4',
    name: 'Annual Net Worth & Wealth Trajectory',
    period: 'Calendar Year 2025',
    date: '2026-01-10',
    status: 'Ready',
    type: 'summary',
    fileSize: '4.2 MB',
    downloadUrl: '#',
  },
  {
    id: 'r_5',
    name: 'Q4 2026 Budget & Savings Forecast',
    period: 'Q4 2026',
    date: '2026-10-01',
    status: 'Processing',
    type: 'summary',
    fileSize: 'Pending',
    downloadUrl: '#',
  },
];

const MOCK_LATENCY = 600;
let memoryReports: FinancialReport[] = [...INITIAL_REPORTS];

export const mockReportsService = {
  async getReports(): Promise<ApiResponse<FinancialReport[]>> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY));
    return {
      success: true,
      data: [...memoryReports],
      timestamp: new Date().toISOString(),
    };
  },

  async generateReport(type: FinancialReport['type'], period: string): Promise<ApiResponse<FinancialReport>> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY));
    const newReport: FinancialReport = {
      id: `r_${Date.now()}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Financial Report (${period})`,
      period,
      date: new Date().toISOString().split('T')[0],
      status: 'Ready',
      type,
      fileSize: '1.8 MB',
      downloadUrl: '#',
    };
    memoryReports = [newReport, ...memoryReports];
    return {
      success: true,
      data: newReport,
      timestamp: new Date().toISOString(),
    };
  },
};