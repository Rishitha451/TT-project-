import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Building2,
  CreditCard,
  ShieldCheck,
  Edit3,
  Sparkles,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useFinancialProfile } from '../../onboarding/hooks/useFinancialProfile';
import { OnboardingModal } from '../../onboarding/components/OnboardingModal';

export const FinancialProfileTab: React.FC = () => {
  const { profile, status, isLoading, saveProfile, isSaving } = useFinancialProfile();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const currencySymbol =
    profile?.currency === 'USD'
      ? '$'
      : profile?.currency === 'EUR'
      ? '€'
      : profile?.currency === 'GBP'
      ? '£'
      : '₹';

  if (!profile || !status.onboardingCompleted) {
    return (
      <div className="text-center py-10 px-4 bg-slate-50/50 rounded-2xl border border-slate-200 space-y-4 animate-fade-in">
        <div className="h-14 w-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
          <Sparkles className="w-7 h-7" />
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h3 className="text-lg font-bold text-slate-900">No Financial Baseline Configured</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            You have not completed your financial setup yet. Set up your baseline to unlock personalized metrics, goals, and guidance.
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 px-5"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Set Up Financial Profile
        </Button>

        <OnboardingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onComplete={async (data) => {
            await saveProfile(data);
            setIsModalOpen(false);
          }}
          isSaving={isSaving}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Edit Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            Manual Financial Profile Baseline
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Active Baseline
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Your foundational cashflows, assets, and liabilities used across dashboard and AI intelligence.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 shrink-0"
        >
          <Edit3 className="w-3.5 h-3.5" /> Edit Financial Baseline
        </Button>
      </div>

      {/* Snapshot Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Income Card */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Monthly Income</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">
              {currencySymbol} {profile.totalMonthlyIncome.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Primary: {currencySymbol} {profile.monthlyIncome.toLocaleString()} | Addl: {currencySymbol}{' '}
              {profile.additionalIncome.toLocaleString()}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span className="font-medium">Employment: </span>
            <span className="text-slate-900 font-semibold">{profile.employmentStatus || 'Not Specified'}</span>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Monthly Expenses</span>
            <div className="h-7 w-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl font-bold text-rose-600">
              {currencySymbol} {profile.monthlyExpenses.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Monthly Budget Baseline Outflow
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span className="font-medium">Estimated Monthly Savings: </span>
            <span className="text-emerald-600 font-bold">
              {currencySymbol} {profile.savings.toLocaleString()} ({profile.savingsRate}%)
            </span>
          </div>
        </div>

        {/* Liquid Reserves Card */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Liquid Reserves</span>
            <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">
              {currencySymbol} {profile.liquidSavings.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Cash: {currencySymbol} {profile.cashBalance.toLocaleString()} | Emergency: {currencySymbol}{' '}
              {profile.emergencyFund.toLocaleString()}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span className="font-medium">Emergency Coverage: </span>
            <span className="text-slate-900 font-semibold">
              {profile.monthlyExpenses > 0
                ? (profile.emergencyFund / profile.monthlyExpenses).toFixed(1)
                : 0}{' '}
              months
            </span>
          </div>
        </div>

        {/* Assets & Investments */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Total Assets</span>
            <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">
              {currencySymbol} {(profile.totalAssets + profile.totalInvestments).toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Physical: {currencySymbol} {profile.totalAssets.toLocaleString()} | Invested: {currencySymbol}{' '}
              {profile.totalInvestments.toLocaleString()}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-400 italic">
            Manually entered current value
          </div>
        </div>

        {/* Total Debt Card */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Total Liabilities</span>
            <div className="h-7 w-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl font-bold text-rose-600">
              {currencySymbol} {profile.totalDebt.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Recorded Loans & Credit Card Debt
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span className="font-medium">Baseline Net Worth: </span>
            <span className="text-indigo-700 font-bold">
              {currencySymbol} {profile.netWorth.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Risk Profile Card */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Risk Profile</span>
            <div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">
              {profile.riskProfile} Tier
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Deterministic Risk Score: {profile.riskScore}/100
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span className="font-medium">Last Updated: </span>
            <span className="text-slate-900 font-medium">
              {new Date(profile.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <OnboardingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onComplete={async (data) => {
          await saveProfile(data);
          setIsModalOpen(false);
        }}
        isSaving={isSaving}
        initialValues={profile}
      />
    </div>
  );
};
