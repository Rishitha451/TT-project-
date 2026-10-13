/**
 * Mock Financial Profile Service for frontend mock mode & offline development.
 */

import type { ApiResponse, FinancialProfile, FinancialProfileInput, FinancialProfileStatus } from '../../types';

let mockProfileState: FinancialProfile | null = {
  id: 'profile-mock-001',
  userId: 'usr_default_01',
  currency: 'INR',
  employmentStatus: 'Employed',
  monthlyIncome: 80000,
  additionalIncome: 10000,
  totalMonthlyIncome: 90000,
  incomeSources: {
    Salary: 80000,
    Freelance: 10000,
  },
  monthlyExpenses: 45000,
  expenseCategories: {
    'Housing / Rent': 20000,
    'Food & Groceries': 10000,
    'Transportation': 5000,
    'Utilities': 5000,
    'Entertainment': 5000,
  },
  savings: 45000,
  savingsRate: 50.0,
  cashBalance: 100000,
  emergencyFund: 100000,
  liquidSavings: 245000,
  totalAssets: 500000,
  assetBreakdown: {
    'Property': 400000,
    'Gold': 100000,
  },
  totalInvestments: 350000,
  investmentBreakdown: {
    'Mutual Funds': { value: 200000, cost_basis: 180000 },
    'Stocks': { value: 150000, cost_basis: 130000 },
  },
  totalDebt: 100000,
  debtBreakdown: {
    'Car Loan': { balance: 100000, monthly_payment: 8000, interest_rate: 8.5 },
  },
  netWorth: 895000,
  riskProfile: 'Moderate',
  riskScore: 55,
  onboardingCompleted: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockFinancialProfileService = {
  getProfile: async (): Promise<ApiResponse<FinancialProfile | null>> => {
    await new Promise((res) => setTimeout(res, 100));
    return {
      success: true,
      data: mockProfileState,
      timestamp: new Date().toISOString(),
    };
  },

  getStatus: async (): Promise<ApiResponse<FinancialProfileStatus>> => {
    await new Promise((res) => setTimeout(res, 50));
    return {
      success: true,
      data: {
        onboardingCompleted: mockProfileState?.onboardingCompleted ?? false,
        hasProfile: mockProfileState !== null,
      },
      timestamp: new Date().toISOString(),
    };
  },

  saveProfile: async (input: FinancialProfileInput): Promise<ApiResponse<FinancialProfile>> => {
    await new Promise((res) => setTimeout(res, 200));
    const totalIncome = (input.monthlyIncome || 0) + (input.additionalIncome || 0);
    const savings = input.savings ?? Math.max(0, totalIncome - (input.monthlyExpenses || 0));
    const savingsRate = totalIncome > 0 ? Number(((savings / totalIncome) * 100).toFixed(1)) : 0;
    const liquidSavings = (input.cashBalance || 0) + (input.emergencyFund || 0) + savings;
    const netWorth = (input.totalAssets || 0) + (input.totalInvestments || 0) + (input.cashBalance || 0) + savings - (input.totalDebt || 0);

    mockProfileState = {
      id: mockProfileState?.id || `profile-${Date.now()}`,
      userId: 'usr_default_01',
      currency: input.currency || 'INR',
      employmentStatus: input.employmentStatus || 'Employed',
      monthlyIncome: input.monthlyIncome || 0,
      additionalIncome: input.additionalIncome || 0,
      totalMonthlyIncome: totalIncome,
      incomeSources: input.incomeSources,
      monthlyExpenses: input.monthlyExpenses || 0,
      expenseCategories: input.expenseCategories,
      savings: savings,
      savingsRate: savingsRate,
      cashBalance: input.cashBalance || 0,
      emergencyFund: input.emergencyFund || 0,
      liquidSavings: liquidSavings,
      totalAssets: input.totalAssets || 0,
      assetBreakdown: input.assetBreakdown,
      totalInvestments: input.totalInvestments || 0,
      investmentBreakdown: input.investmentBreakdown,
      totalDebt: input.totalDebt || 0,
      debtBreakdown: input.debtBreakdown,
      netWorth: netWorth,
      riskProfile: input.riskProfile || 'Moderate',
      riskScore: input.riskScore || 50,
      onboardingCompleted: input.onboardingCompleted ?? true,
      createdAt: mockProfileState?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: mockProfileState,
      timestamp: new Date().toISOString(),
    };
  },

  updateProfile: async (partial: Partial<FinancialProfileInput>): Promise<ApiResponse<FinancialProfile>> => {
    await new Promise((res) => setTimeout(res, 150));
    if (!mockProfileState) {
      throw { code: 'PROFILE_NOT_FOUND', message: 'Financial profile not found.' };
    }
    return mockFinancialProfileService.saveProfile({
      ...mockProfileState,
      ...partial,
    });
  },
};
