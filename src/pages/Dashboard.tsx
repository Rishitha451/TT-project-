import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Sparkles } from 'lucide-react';
import { useDashboard } from '../features/dashboard/hooks/useDashboard';
import { MetricCard } from '../features/dashboard/components/MetricCard';
import { SpendingChart } from '../features/dashboard/components/SpendingChart';
import { TransactionList } from '../features/dashboard/components/TransactionList';
import { AIInsightCard } from '../features/dashboard/components/AIInsightCard';
import { InvestmentSnapshot } from '../features/dashboard/components/InvestmentSnapshot';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { useAuthStore } from '../features/auth/store/auth.store';
import { useFinancialProfile } from '../features/onboarding/hooks/useFinancialProfile';
import { OnboardingBanner } from '../features/onboarding/components/OnboardingBanner';
import { SetupPromptModal } from '../features/onboarding/components/SetupPromptModal';
import { OnboardingModal } from '../features/onboarding/components/OnboardingModal';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboard();
  const { profile, status, saveProfile, isSaving } = useFinancialProfile();

  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  // Check whether to show the "Let's set up your finances" prompt on initial load
  useEffect(() => {
    if (status && !status.onboardingCompleted) {
      const hasSkipped = sessionStorage.getItem('ai_finance_onboarding_skipped');
      if (!hasSkipped) {
        setIsPromptOpen(true);
      }
    }
  }, [status]);

  const handleSkipPrompt = () => {
    sessionStorage.setItem('ai_finance_onboarding_skipped', 'true');
    setIsPromptOpen(false);
  };

  const handleStartOnboarding = () => {
    setIsPromptOpen(false);
    setIsOnboardingModalOpen(true);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load your dashboard"
        message={
          (error as Error)?.message ||
          'Something went wrong while loading your financial data. Please try again.'
        }
        onRetry={refetch}
        isRetrying={isFetching}
      />
    );
  }

  if (!data) {
    return <EmptyState onAction={refetch} actionText="Load Mock Data" />;
  }

  const userName = user?.name ? user.name.split(' ')[0] : 'Alex';
  const hasIncompleteProfile = !status?.onboardingCompleted && data.transactions.length === 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {getGreeting()}, {userName}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Here's a quick overview of your financial status today.
          </p>
        </div>

        {hasIncompleteProfile && (
          <button
            type="button"
            onClick={() => setIsOnboardingModalOpen(true)}
            className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-600/20 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" /> Complete Financial Profile →
          </button>
        )}
      </div>

      {/* Incomplete Baseline Top Banner */}
      {!status?.onboardingCompleted && (
        <OnboardingBanner onStartSetup={() => setIsOnboardingModalOpen(true)} />
      )}

      {/* Summary Cards Grid (4 columns desktop, 2 tablet, 1 mobile) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Net Worth"
          amount={data.netWorth}
          icon={<Wallet className="w-5 h-5 text-indigo-600" />}
          subtitle={
            hasIncompleteProfile
              ? 'No financial data yet'
              : 'Total baseline & transactions'
          }
        />

        <MetricCard
          title="Monthly Income"
          amount={data.monthlyIncome}
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          subtitle={
            hasIncompleteProfile
              ? 'No financial data yet'
              : 'Monthly cashflow baseline'
          }
        />

        <MetricCard
          title="Monthly Expenses"
          amount={data.monthlyExpenses}
          icon={<TrendingDown className="w-5 h-5 text-rose-600" />}
          subtitle={
            hasIncompleteProfile
              ? 'No financial data yet'
              : 'Monthly budget outflow'
          }
        />

        <MetricCard
          title="Savings"
          amount={data.savings}
          icon={<PiggyBank className="w-5 h-5 text-amber-600" />}
          subtitle={
            hasIncompleteProfile
              ? 'No financial data yet'
              : `${data.summary?.savingsRate ?? 0}% savings rate`
          }
        />
      </div>

      {/* Main Insights & Charts Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Spending Chart (2 cols on lg) */}
        <div className="lg:col-span-2">
          <SpendingChart data={data.spending} />
        </div>

        {/* AI Insight Card (1 col on lg) */}
        <div className="space-y-6">
          <AIInsightCard insights={data.insights} />
        </div>
      </div>

      {/* Investment Snapshot */}
      <InvestmentSnapshot />

      {/* Transactions Section */}
      <div>
        <TransactionList transactions={data.transactions} />
      </div>

      {/* Initial Setup Prompt Modal ("Let's set up your finances") */}
      <SetupPromptModal
        isOpen={isPromptOpen}
        onStartSetup={handleStartOnboarding}
        onSkip={handleSkipPrompt}
      />

      {/* Full 9-Step Onboarding Modal Wizard */}
      <OnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        onComplete={async (formData) => {
          await saveProfile(formData);
          refetch();
          setIsOnboardingModalOpen(false);
        }}
        isSaving={isSaving}
        initialValues={profile || undefined}
      />
    </div>
  );
};
