import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Building2,
  CreditCard,
  Target,
  ShieldAlert,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Edit3,
  Lock,
  Sparkles,
  Info,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import type { FinancialProfileInput, OnboardingGoalInput } from '../../../types';

interface FinancialOnboardingFlowProps {
  initialValues?: Partial<FinancialProfileInput>;
  onComplete: (data: FinancialProfileInput) => Promise<void>;
  onSkip?: () => void;
  isSaving?: boolean;
}

const STEPS = [
  { id: 1, title: 'Basic Info', short: 'Basic' },
  { id: 2, title: 'Monthly Income', short: 'Income' },
  { id: 3, title: 'Monthly Expenses', short: 'Expenses' },
  { id: 4, title: 'Savings & Cash', short: 'Savings' },
  { id: 5, title: 'Assets & Investments', short: 'Assets' },
  { id: 6, title: 'Debts & Loans', short: 'Debts' },
  { id: 7, title: 'Financial Goals', short: 'Goals' },
  { id: 8, title: 'Risk Profile', short: 'Risk' },
  { id: 9, title: 'Review & Save', short: 'Review' },
];

const EXPENSE_CATEGORIES = [
  'Housing / Rent',
  'Food & Groceries',
  'Transportation',
  'Utilities',
  'Healthcare',
  'Insurance',
  'Education',
  'Entertainment',
  'Shopping',
  'Subscriptions',
  'EMIs / Loan Payments',
  'Other',
];

const ASSET_CATEGORIES = [
  'Property / Real Estate',
  'Gold & Precious Metals',
  'Fixed Deposits',
  'Vehicle',
  'Cash Holdings',
  'Other Tangible Assets',
];

const INVESTMENT_CATEGORIES = [
  'Mutual Funds',
  'Stocks / Equities',
  'ETFs',
  'Bonds & Govt Securities',
  'Retirement (PF / NPS / 401k)',
  'Crypto / Alternative',
];

const DEBT_CATEGORIES = [
  'Home Loan / Mortgage',
  'Car Loan',
  'Personal Loan',
  'Education Loan',
  'Credit Card Outstanding',
  'Other Liabilities',
];

export const FinancialOnboardingFlow: React.FC<FinancialOnboardingFlowProps> = ({
  initialValues,
  onComplete,
  onSkip,
  isSaving = false,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [currency, setCurrency] = useState<string>(initialValues?.currency || 'INR');
  const [employmentStatus, setEmploymentStatus] = useState<string>(
    initialValues?.employmentStatus || 'Employed'
  );

  // Step 2: Income
  const [monthlyIncome, setMonthlyIncome] = useState<number>(initialValues?.monthlyIncome || 0);
  const [additionalIncome, setAdditionalIncome] = useState<number>(
    initialValues?.additionalIncome || 0
  );
  const [incomeSources, setIncomeSources] = useState<Record<string, number>>(
    initialValues?.incomeSources || { Salary: initialValues?.monthlyIncome || 0 }
  );

  // Step 3: Expenses
  const [expenseCategories, setExpenseCategories] = useState<Record<string, number>>(
    initialValues?.expenseCategories || {}
  );

  // Step 4: Savings & Cash
  const [savings, setSavings] = useState<number>(initialValues?.savings || 0);
  const [cashBalance, setCashBalance] = useState<number>(initialValues?.cashBalance || 0);
  const [emergencyFund, setEmergencyFund] = useState<number>(initialValues?.emergencyFund || 0);

  // Step 5: Assets & Investments
  const [assetBreakdown, setAssetBreakdown] = useState<Record<string, number>>(
    (initialValues?.assetBreakdown as Record<string, number>) || {}
  );
  const [investmentBreakdown, setInvestmentBreakdown] = useState<
    Record<string, { value: number; cost_basis?: number }>
  >(
    (initialValues?.investmentBreakdown as Record<
      string,
      { value: number; cost_basis?: number }
    >) || {}
  );

  // Step 6: Debts
  const [debtBreakdown, setDebtBreakdown] = useState<
    Record<string, { balance: number; monthly_payment?: number; interest_rate?: number }>
  >(
    (initialValues?.debtBreakdown as Record<
      string,
      { balance: number; monthly_payment?: number; interest_rate?: number }
    >) || {}
  );

  // Step 7: Goals
  const [goals, setGoals] = useState<OnboardingGoalInput[]>(
    initialValues?.goals || [
      {
        name: 'Emergency Fund',
        targetAmount: 300000,
        currentAmount: initialValues?.emergencyFund || 0,
        color: '#3B82F6',
        category: 'Emergency',
      },
    ]
  );
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState<number>(0);
  const [newGoalCurrent, setNewGoalCurrent] = useState<number>(0);
  const [newGoalCategory, setNewGoalCategory] = useState('Savings');

  // Step 8: Risk Profile
  const [riskTolerance, setRiskTolerance] = useState<string>(
    initialValues?.riskProfile || 'Moderate'
  );
  const [timeHorizon, setTimeHorizon] = useState<string>('5-10 years');
  const [marketReaction, setMarketReaction] = useState<string>('Hold steady');

  // Calculations
  const totalMonthlyIncome = Math.max(0, monthlyIncome) + Math.max(0, additionalIncome);

  const totalMonthlyExpenses = Object.values(expenseCategories).reduce(
    (acc, val) => acc + (Number(val) || 0),
    0
  );

  const calculatedSavings =
    savings > 0 ? savings : Math.max(0, totalMonthlyIncome - totalMonthlyExpenses);

  const totalLiquidSavings =
    Math.max(0, cashBalance) + Math.max(0, emergencyFund) + calculatedSavings;

  const totalAssets = Object.values(assetBreakdown).reduce(
    (acc, val) => acc + (Number(val) || 0),
    0
  );

  const totalInvestments = Object.values(investmentBreakdown).reduce(
    (acc, item) => acc + (Number(item?.value) || 0),
    0
  );

  const totalDebt = Object.values(debtBreakdown).reduce(
    (acc, item) => acc + (Number(item?.balance) || 0),
    0
  );

  const calculatedNetWorth =
    totalAssets + totalInvestments + Math.max(0, cashBalance) + calculatedSavings - totalDebt;

  // Compute deterministic risk score
  const computeRiskScore = (): { score: number; tier: string } => {
    let score = 50;
    if (riskTolerance === 'Conservative') score -= 20;
    if (riskTolerance === 'Aggressive') score += 25;

    if (timeHorizon === '<1 year') score -= 10;
    if (timeHorizon === '10+ years') score += 10;

    if (marketReaction === 'Panic sell') score -= 15;
    if (marketReaction === 'Buy the dip') score += 15;

    const clampedScore = Math.max(10, Math.min(95, score));
    let tier = 'Moderate';
    if (clampedScore <= 35) tier = 'Conservative';
    else if (clampedScore >= 70) tier = 'Aggressive';

    return { score: clampedScore, tier };
  };

  const handleNext = () => {
    if (currentStep < 9) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleAddGoal = () => {
    if (!newGoalName.trim() || newGoalTarget <= 0) return;
    setGoals((prev) => [
      ...prev,
      {
        name: newGoalName.trim(),
        targetAmount: newGoalTarget,
        currentAmount: newGoalCurrent,
        color: '#6366F1',
        category: newGoalCategory,
      },
    ]);
    setNewGoalName('');
    setNewGoalTarget(0);
    setNewGoalCurrent(0);
  };

  const handleRemoveGoal = (index: number) => {
    setGoals((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFinalSubmit = async () => {
    const riskResult = computeRiskScore();
    const payload: FinancialProfileInput = {
      currency,
      employmentStatus,
      monthlyIncome,
      additionalIncome,
      incomeSources,
      monthlyExpenses: totalMonthlyExpenses,
      expenseCategories,
      savings: calculatedSavings,
      cashBalance,
      emergencyFund,
      totalAssets,
      assetBreakdown,
      totalInvestments,
      investmentBreakdown,
      totalDebt,
      debtBreakdown,
      riskProfile: riskResult.tier,
      riskScore: riskResult.score,
      goals,
      onboardingCompleted: true,
    };

    await onComplete(payload);
  };

  const currencySymbol =
    currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-w-4xl mx-auto flex flex-col min-h-[620px]">
      {/* Top Header & Progress Bar */}
      <div className="bg-slate-900 text-white px-6 py-5 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Set Up Your Financial Profile</h2>
              <p className="text-xs text-slate-400">
                Step {currentStep} of 9 — {STEPS[currentStep - 1].title}
              </p>
            </div>
          </div>
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-slate-800"
            >
              Skip for now
            </button>
          )}
        </div>

        {/* Multi-step progress track: 1 ─ 2 ─ 3 ─ 4 ─ 5 ─ 6 ─ 7 ─ 8 ─ 9 */}
        <div className="flex items-center justify-between max-w-2xl mx-auto pt-2 overflow-x-auto pb-1">
          {STEPS.map((step, idx) => {
            const isDone = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/30'
                        : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                  </div>
                  <span
                    className={`text-[10px] mt-1 font-medium hidden sm:block ${
                      isCurrent ? 'text-indigo-400 font-bold' : isDone ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {step.short}
                  </span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-1.5 rounded transition-all ${
                      currentStep > step.id ? 'bg-emerald-500' : 'bg-slate-800'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Step Body */}
      <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
        {/* STEP 1: Basic Financial Information */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in max-w-xl mx-auto">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900">Basic Financial Information</h3>
              <p className="text-sm text-slate-500 mt-1">
                Configure your preferred currency and employment baseline.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Primary Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="INR">Indian Rupee (INR ₹)</option>
                  <option value="USD">US Dollar (USD $)</option>
                  <option value="EUR">Euro (EUR €)</option>
                  <option value="GBP">British Pound (GBP £)</option>
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  All baseline figures, charts, and metrics will render with this currency symbol.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Employment Status
                </label>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {[
                    'Employed',
                    'Self-employed',
                    'Business owner',
                    'Freelancer',
                    'Student',
                    'Retired',
                    'Other',
                  ].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setEmploymentStatus(status)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all text-left cursor-pointer ${
                        employmentStatus === status
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Monthly Income */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in max-w-xl mx-auto">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900">Monthly Income</h3>
              <p className="text-sm text-slate-500 mt-1">
                Enter your average monthly take-home earnings from all sources.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Primary Monthly Income ({currencySymbol})
                </label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="e.g. 80000"
                  value={monthlyIncome || ''}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value) || 0);
                    setMonthlyIncome(val);
                    setIncomeSources((prev) => ({ ...prev, Salary: val }));
                  }}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Additional Monthly Income ({currencySymbol}) (Optional)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="500"
                  placeholder="e.g. 10000"
                  value={additionalIncome || ''}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value) || 0);
                    setAdditionalIncome(val);
                    setIncomeSources((prev) => ({ ...prev, Additional: val }));
                  }}
                />
              </div>

              {/* Total Computed Card */}
              <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-indigo-900">Total Monthly Income</p>
                  <p className="text-lg font-bold text-indigo-700">
                    {currencySymbol} {totalMonthlyIncome.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Monthly Expenses */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900">Monthly Expenses</h3>
              <p className="text-sm text-slate-500 mt-1">
                Enter your approximate monthly expenses across categories. Leave zero if not applicable.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {EXPENSE_CATEGORIES.map((category) => (
                <div key={category} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <label className="block text-xs font-semibold text-slate-700 mb-1 truncate">
                    {category}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 text-xs font-semibold">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      placeholder="0"
                      value={expenseCategories[category] || ''}
                      onChange={(e) => {
                        const val = Math.max(0, Number(e.target.value) || 0);
                        setExpenseCategories((prev) => ({
                          ...prev,
                          [category]: val,
                        }));
                      }}
                      className="w-full pl-7 pr-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Total Expenses Banner */}
            <div className="p-4 bg-rose-50/60 border border-rose-100 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-rose-900">Total Estimated Monthly Expenses</p>
                <p className="text-lg font-bold text-rose-700">
                  {currencySymbol} {totalMonthlyExpenses.toLocaleString()}
                </p>
              </div>
              <TrendingDown className="w-6 h-6 text-rose-600" />
            </div>
          </div>
        )}

        {/* STEP 4: Savings & Cash */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in max-w-xl mx-auto">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900">Savings & Cash Balances</h3>
              <p className="text-sm text-slate-500 mt-1">
                Provide your current liquid cash reserves and emergency fund balances.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Bank & Liquid Cash Balance ({currencySymbol})
                </label>
                <Input
                  type="number"
                  min="0"
                  step="5000"
                  placeholder="e.g. 100000"
                  value={cashBalance || ''}
                  onChange={(e) => setCashBalance(Math.max(0, Number(e.target.value) || 0))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Dedicated Emergency Fund ({currencySymbol}) (Optional)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="5000"
                  placeholder="e.g. 150000"
                  value={emergencyFund || ''}
                  onChange={(e) => setEmergencyFund(Math.max(0, Number(e.target.value) || 0))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Estimated Monthly Savings ({currencySymbol})
                </label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder={`Auto-computed: ${currencySymbol} ${Math.max(
                    0,
                    totalMonthlyIncome - totalMonthlyExpenses
                  ).toLocaleString()}`}
                  value={savings || ''}
                  onChange={(e) => setSavings(Math.max(0, Number(e.target.value) || 0))}
                />
              </div>

              {/* Total Liquid Savings */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-emerald-900">Total Liquid Reserves</p>
                  <p className="text-lg font-bold text-emerald-700">
                    {currencySymbol} {totalLiquidSavings.toLocaleString()}
                  </p>
                </div>
                <PiggyBank className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Assets & Investments */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900">Assets & Investments</h3>
              <p className="text-sm text-slate-500 mt-1">
                Enter your physical assets and investment portfolio values.
              </p>
            </div>

            {/* Note badge */}
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-amber-900 text-xs">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Manually entered values serve as your baseline starting point.</span>
            </div>

            {/* Assets Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Physical & Non-Liquid Assets
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ASSET_CATEGORIES.map((cat) => (
                  <div key={cat} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <label className="block text-xs font-medium text-slate-700 mb-1">{cat}</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 text-xs font-semibold">
                        {currencySymbol}
                      </span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={assetBreakdown[cat] || ''}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value) || 0);
                          setAssetBreakdown((prev) => ({ ...prev, [cat]: val }));
                        }}
                        className="w-full pl-7 pr-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Investments Section */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Investment Holdings
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {INVESTMENT_CATEGORIES.map((cat) => (
                  <div key={cat} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <label className="block text-xs font-medium text-slate-700 mb-1">{cat}</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 text-xs font-semibold">
                        {currencySymbol}
                      </span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Current Value"
                        value={investmentBreakdown[cat]?.value || ''}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value) || 0);
                          setInvestmentBreakdown((prev) => ({
                            ...prev,
                            [cat]: { value: val, cost_basis: val },
                          }));
                        }}
                        className="w-full pl-7 pr-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-indigo-900">Total Assets + Investments</p>
                <p className="text-lg font-bold text-indigo-700">
                  {currencySymbol} {(totalAssets + totalInvestments).toLocaleString()}
                </p>
              </div>
              <Building2 className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        )}

        {/* STEP 6: Debts & Loans */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900">Debts & Liabilities</h3>
              <p className="text-sm text-slate-500 mt-1">
                Enter your outstanding loans or credit obligations to ensure net worth calculations are accurate.
              </p>
            </div>

            {/* Security note */}
            <div className="flex items-start gap-2.5 p-3.5 bg-slate-900 text-white rounded-xl text-xs">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-400">Bank-Grade Privacy</p>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  Never enter bank account numbers, passwords, PINs, or CVV. We only record aggregate liability balances.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {DEBT_CATEGORIES.map((cat) => (
                <div key={cat} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2">
                  <label className="block text-xs font-semibold text-slate-800">{cat}</label>
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium">Outstanding Balance</span>
                    <div className="relative mt-0.5">
                      <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 text-xs font-semibold">
                        {currencySymbol}
                      </span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={debtBreakdown[cat]?.balance || ''}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value) || 0);
                          setDebtBreakdown((prev) => ({
                            ...prev,
                            [cat]: {
                              ...(prev[cat] || {}),
                              balance: val,
                            },
                          }));
                        }}
                        className="w-full pl-7 pr-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-rose-50/60 border border-rose-100 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-rose-900">Total Recorded Debt</p>
                <p className="text-lg font-bold text-rose-700">
                  {currencySymbol} {totalDebt.toLocaleString()}
                </p>
              </div>
              <CreditCard className="w-6 h-6 text-rose-600" />
            </div>
          </div>
        )}

        {/* STEP 7: Financial Goals */}
        {currentStep === 7 && (
          <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900">Financial Goals</h3>
              <p className="text-sm text-slate-500 mt-1">
                Establish initial savings targets. These will integrate directly into your Goals module.
              </p>
            </div>

            {/* Existing Goals List */}
            <div className="space-y-3">
              {goals.map((g, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{g.name}</h4>
                      <p className="text-xs text-slate-500">
                        Target: {currencySymbol} {g.targetAmount.toLocaleString()} | Current: {currencySymbol}{' '}
                        {(g.currentAmount || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveGoal(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Goal Form */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                Add Another Financial Goal
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <Input
                    placeholder="Goal Name (e.g. Vacation Fund, House Deposit)"
                    value={newGoalName}
                    onChange={(e) => setNewGoalName(e.target.value)}
                  />
                </div>
                <div>
                  <select
                    value={newGoalCategory}
                    onChange={(e) => setNewGoalCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Emergency">Emergency</option>
                    <option value="House">House</option>
                    <option value="Car">Car</option>
                    <option value="Vacation">Vacation</option>
                    <option value="Retirement">Retirement</option>
                    <option value="Debt Repayment">Debt Repayment</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Target Amount ({currencySymbol})
                  </label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Target Amount"
                    value={newGoalTarget || ''}
                    onChange={(e) => setNewGoalTarget(Math.max(0, Number(e.target.value) || 0))}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Current Funded Amount ({currencySymbol})
                  </label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Current Amount"
                    value={newGoalCurrent || ''}
                    onChange={(e) => setNewGoalCurrent(Math.max(0, Number(e.target.value) || 0))}
                  />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddGoal}
                  disabled={!newGoalName.trim() || newGoalTarget <= 0}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Goal
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: Risk Profile */}
        {currentStep === 8 && (
          <div className="space-y-6 animate-fade-in max-w-xl mx-auto">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900">Risk Profile Assessment</h3>
              <p className="text-sm text-slate-500 mt-1">
                Determine your deterministic risk score to customize advisor portfolio recommendations.
              </p>
            </div>

            <div className="space-y-5">
              {/* Question 1 */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                  1. How would you describe your overall investment risk tolerance?
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {['Conservative', 'Moderate', 'Aggressive'].map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setRiskTolerance(tier)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                        riskTolerance === tier
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2 */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                  2. What is your primary investment time horizon?
                </label>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {['<1 year', '1-5 years', '5-10 years', '10+ years'].map((horizon) => (
                    <button
                      key={horizon}
                      type="button"
                      onClick={() => setTimeHorizon(horizon)}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                        timeHorizon === horizon
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {horizon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3 */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                  3. If your portfolio dropped 20% in a market correction, how would you react?
                </label>
                <div className="space-y-2">
                  {[
                    { label: 'Panic sell to prevent further loss', val: 'Panic sell' },
                    { label: 'Hold steady and wait for market recovery', val: 'Hold steady' },
                    { label: 'Buy more assets at discounted valuations', val: 'Buy the dip' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setMarketReaction(opt.val)}
                      className={`w-full p-3 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                        marketReaction === opt.val
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-800 font-semibold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculated Result Card */}
              <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Computed Deterministic Profile</p>
                  <p className="text-base font-bold text-emerald-400">
                    {computeRiskScore().tier} Tier (Score: {computeRiskScore().score}/100)
                  </p>
                </div>
                <ShieldAlert className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>
        )}

        {/* STEP 9: Review & Save */}
        {currentStep === 9 && (
          <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900">Review & Save Financial Profile</h3>
              <p className="text-sm text-slate-500 mt-1">
                Verify your financial baseline details before saving them to your authenticated account.
              </p>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cashflow Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Monthly Cashflow
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <div className="text-sm space-y-1 pt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monthly Income:</span>
                    <span className="font-semibold text-slate-900">
                      {currencySymbol} {totalMonthlyIncome.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monthly Expenses:</span>
                    <span className="font-semibold text-rose-600">
                      {currencySymbol} {totalMonthlyExpenses.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1">
                    <span className="text-slate-700 font-medium">Monthly Savings:</span>
                    <span className="font-bold text-emerald-600">
                      {currencySymbol} {calculatedSavings.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Balance Sheet Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Balance Sheet
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <div className="text-sm space-y-1 pt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Liquid Cash & Bank:</span>
                    <span className="font-semibold text-slate-900">
                      {currencySymbol} {cashBalance.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assets & Investments:</span>
                    <span className="font-semibold text-slate-900">
                      {currencySymbol} {(totalAssets + totalInvestments).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Liabilities:</span>
                    <span className="font-semibold text-rose-600">
                      {currencySymbol} {totalDebt.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1">
                    <span className="text-slate-700 font-medium">Est. Net Worth:</span>
                    <span className="font-bold text-indigo-700">
                      {currencySymbol} {calculatedNetWorth.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Strategy & Risk */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Risk & Status
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(8)}
                    className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <div className="text-sm space-y-1 pt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Employment:</span>
                    <span className="font-semibold text-slate-900">{employmentStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Risk Profile:</span>
                    <span className="font-semibold text-emerald-600">
                      {computeRiskScore().tier} ({computeRiskScore().score}/100)
                    </span>
                  </div>
                </div>
              </div>

              {/* Goals Summary */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Configured Goals
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(7)}
                    className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <div className="text-sm space-y-1 pt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Active Goals Created:</span>
                    <span className="font-bold text-indigo-700">{goals.length}</span>
                  </div>
                  {goals.slice(0, 2).map((g, i) => (
                    <div key={i} className="text-xs text-slate-600 truncate">
                      • {g.name} ({currencySymbol} {g.targetAmount.toLocaleString()})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
        <div>
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isSaving}
              className="flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {currentStep < 9 ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleNext}
              className="flex items-center gap-1.5"
            >
              Save & Continue <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              onClick={handleFinalSubmit}
              disabled={isSaving}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6"
            >
              {isSaving ? 'Saving Profile...' : 'Save Financial Profile'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
