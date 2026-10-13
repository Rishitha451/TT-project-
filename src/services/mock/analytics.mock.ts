import type { AnalyticsSummary, ApiResponse } from '../../types';

const MOCK_ANALYTICS_DATA: AnalyticsSummary = {
  timeframe: 'Last 6 Months',
  totalIncome: 510000,
  totalExpenses: 337200,
  netSavings: 172800,
  savingsRate: 33.88,
  monthlyTrends: [
    { month: 'Apr 2026', income: 85000, expenses: 58000, savings: 27000 },
    { month: 'May 2026', income: 85000, expenses: 54500, savings: 30500 },
    { month: 'Jun 2026', income: 85000, expenses: 59200, savings: 25800 },
    { month: 'Jul 2026', income: 85000, expenses: 53800, savings: 31200 },
    { month: 'Aug 2026', income: 85000, expenses: 55500, savings: 29500 },
    { month: 'Sep 2026', income: 85000, expenses: 56200, savings: 28800 },
  ],
  categoryBreakdown: [
    { category: 'Housing & Rent', amount: 18000, color: '#4f46e5', percentage: 32.0 },
    { category: 'Shopping', amount: 14200, color: '#06b6d4', percentage: 25.2 },
    { category: 'Food & Groceries', amount: 11500, color: '#10b981', percentage: 20.5 },
    { category: 'Bills & Utilities', amount: 7500, color: '#f59e0b', percentage: 13.3 },
    { category: 'Transport', amount: 3000, color: '#ec4899', percentage: 5.4 },
    { category: 'Entertainment', amount: 2000, color: '#8b5cf6', percentage: 3.6 },
  ],
  topExpenses: [
    { category: 'Housing & Rent', amount: 18000, percentage: 32.0 },
    { category: 'Shopping', amount: 14200, percentage: 25.2 },
    { category: 'Food & Groceries', amount: 11500, percentage: 20.5 },
    { category: 'Utilities', amount: 7500, percentage: 13.3 },
    { category: 'Transportation', amount: 3000, percentage: 5.4 },
  ],
};

const MOCK_LATENCY = 600;

export const mockAnalyticsService = {
  async getAnalyticsSummary(_timeframe = '6m'): Promise<ApiResponse<AnalyticsSummary>> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY));
    return {
      success: true,
      data: MOCK_ANALYTICS_DATA,
      timestamp: new Date().toISOString(),
    };
  },
};