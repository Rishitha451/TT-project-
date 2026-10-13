import type { DashboardData, ApiResponse, ApiError } from '../../types';

const MOCK_DASHBOARD_DATA: DashboardData = {
  summary: {
    netWorth: 485000,
    monthlyIncome: 85000,
    monthlyExpenses: 56200,
    savings: 28800,
  },
  netWorth: 485000,
  monthlyIncome: 85000,
  monthlyExpenses: 56200,
  savings: 28800,
  spending: [
    { category: 'Housing & Rent', amount: 18000, color: '#4f46e5' },
    { category: 'Shopping', amount: 14200, color: '#06b6d4' },
    { category: 'Food & Groceries', amount: 11500, color: '#10b981' },
    { category: 'Bills & Utilities', amount: 7500, color: '#f59e0b' },
    { category: 'Transport', amount: 3000, color: '#ec4899' },
    { category: 'Entertainment', amount: 2000, color: '#8b5cf6' },
  ],
  transactions: [
    {
      id: 'tx_1',
      title: 'Salary Deposit',
      category: 'Income',
      amount: 85000,
      type: 'credit',
      date: '2026-09-01T09:00:00Z',
      status: 'completed',
    },
    {
      id: 'tx_2',
      title: 'Monthly Rent Payment',
      category: 'Housing & Rent',
      amount: 18000,
      type: 'debit',
      date: '2026-09-02T14:30:00Z',
      status: 'completed',
    },
    {
      id: 'tx_3',
      title: 'Supermarket Groceries',
      category: 'Food & Groceries',
      amount: 4200,
      type: 'debit',
      date: '2026-09-04T18:15:00Z',
      status: 'completed',
    },
    {
      id: 'tx_4',
      title: 'Metro Rail Transport Card',
      category: 'Transport',
      amount: 1500,
      type: 'debit',
      date: '2026-09-06T11:20:00Z',
      status: 'completed',
    },
    {
      id: 'tx_5',
      title: 'Electronics & Apparel',
      category: 'Shopping',
      amount: 3800,
      type: 'debit',
      date: '2026-09-08T16:45:00Z',
      status: 'completed',
    },

  ],
  insights: [
    {
      id: 'ins_1',
      title: 'Your spending insight',
      description: 'Your shopping expenses are slightly higher than your recent monthly average. Consider setting a category budget.',
      type: 'info',
      date: '2026-09-09T08:00:00Z',
    },
  ],
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockDashboardService = {
  async getDashboardData(): Promise<ApiResponse<DashboardData>> {
    await delay(800);

    if (typeof window !== 'undefined' && window.location.search.includes('mock_error=true')) {
      const error: ApiError = {
        code: 'DASHBOARD_FETCH_FAILED',
        message: 'Unable to load dashboard data. Please check your network connection.',
      };
      throw error;
    }

    return {
      success: true,
      data: MOCK_DASHBOARD_DATA,
      timestamp: new Date().toISOString(),
    };
  },
};
