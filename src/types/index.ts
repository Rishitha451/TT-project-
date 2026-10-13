export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  currency?: string;
  createdAt?: string;
}

export interface FinancialSummary {
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savings: number;
  savingsRate?: number;
}

export interface MetricData {
  title: string;
  amount: number;
  changePercentage: number;
  changeType: 'positive' | 'negative' | 'neutral';
  timeframe: string;
}

export interface Transaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
  status?: 'completed' | 'pending' | 'failed';
  accountName?: string;
}


export interface SpendingCategory {
  category: string;
  amount: number;
  color: string;
  percentage?: number;
}

export interface FinancialInsight {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'info' | 'success';
  date: string;
  actionUrl?: string;
  category?: string;
}

export type AIInsight = FinancialInsight;

export interface DashboardData {
  summary: FinancialSummary;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savings: number;
  spending: SpendingCategory[];
  transactions: Transaction[];
  insights: FinancialInsight[];
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  color: string;
  category?: string;
  targetDate?: string;
  createdAt?: string;
}

export interface AnalyticsTrendPoint {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface AnalyticsSummary {
  timeframe: string;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  monthlyTrends: AnalyticsTrendPoint[];
  categoryBreakdown: SpendingCategory[];
  topExpenses: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}

export interface FinancialReport {
  id: string;
  name: string;
  period: string;
  date: string;
  status: 'Ready' | 'Processing' | 'Failed';
  type: 'summary' | 'tax' | 'spending' | 'portfolio';
  fileSize?: string;
  downloadUrl?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'alert' | 'insight' | 'goal' | 'system';
  link?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
}

export interface UserPreferences {
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  theme: 'light' | 'dark' | 'system';
  emailAlerts: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  investmentAlerts: boolean;
}

export interface UserSettings {
  profile: UserProfile;
  preferences: UserPreferences;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface OnboardingGoalInput {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  color?: string;
  category?: string;
  targetDate?: string;
}

export interface InvestmentBreakdownItem {
  value: number;
  cost_basis?: number;
}

export interface DebtBreakdownItem {
  balance: number;
  monthly_payment?: number;
  interest_rate?: number;
}

export interface FinancialProfile {
  id: string;
  userId: string;
  currency: string;
  employmentStatus?: string;
  monthlyIncome: number;
  additionalIncome: number;
  totalMonthlyIncome: number;
  incomeSources?: Record<string, number>;
  monthlyExpenses: number;
  expenseCategories?: Record<string, number>;
  savings: number;
  savingsRate: number;
  cashBalance: number;
  emergencyFund: number;
  liquidSavings: number;
  totalAssets: number;
  assetBreakdown?: Record<string, number>;
  totalInvestments: number;
  investmentBreakdown?: Record<string, InvestmentBreakdownItem | number>;
  totalDebt: number;
  debtBreakdown?: Record<string, DebtBreakdownItem | number>;
  netWorth: number;
  riskProfile: string;
  riskScore: number;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialProfileInput {
  currency?: string;
  employmentStatus?: string;
  monthlyIncome: number;
  additionalIncome?: number;
  incomeSources?: Record<string, number>;
  monthlyExpenses: number;
  expenseCategories?: Record<string, number>;
  savings?: number;
  cashBalance?: number;
  emergencyFund?: number;
  totalAssets?: number;
  assetBreakdown?: Record<string, number>;
  totalInvestments?: number;
  investmentBreakdown?: Record<string, InvestmentBreakdownItem | number>;
  totalDebt?: number;
  debtBreakdown?: Record<string, DebtBreakdownItem | number>;
  riskProfile?: string;
  riskScore?: number;
  goals?: OnboardingGoalInput[];
  onboardingCompleted?: boolean;
}

export interface FinancialProfileStatus {
  onboardingCompleted: boolean;
  hasProfile: boolean;
}

