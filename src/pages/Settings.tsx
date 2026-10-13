import React, { useState } from 'react';
import { useSettings } from '../features/settings/hooks/useSettings';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/common/ErrorState';
import { User, Sliders, ShieldCheck, Landmark, Bell } from 'lucide-react';
import type { UserProfile, UserPreferences } from '../types';
import { FinancialProfileTab } from '../features/settings/components/FinancialProfileTab';

export default function Settings() {
  const { settings, profile, preferences, isLoading, isError, error, refetch, updateProfile, isUpdatingProfile, updatePreferences, isUpdatingPreferences } = useSettings();
  const [activeTab, setActiveTab] = useState<'profile' | 'financial-profile' | 'preferences' | 'security'>('profile');

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !settings || !profile || !preferences) {
    return (
      <ErrorState
        title="Unable to load settings"
        message={(error as Error)?.message || 'Something went wrong fetching your account settings.'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings & Preferences</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your personal profile, notification frequencies, and financial baseline parameters.
        </p>
      </div>

      {/* Settings Container */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 pt-2 bg-slate-50/50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('financial-profile')}
            className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'financial-profile'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Landmark className="w-4 h-4" />
            Financial Profile
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'preferences'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Display & Currency
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Security & Feeds
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <ProfileForm
              initialProfile={profile}
              onSave={updateProfile}
              isSaving={isUpdatingProfile}
            />
          )}

          {activeTab === 'financial-profile' && (
            <FinancialProfileTab />
          )}

          {activeTab === 'preferences' && (
            <PreferencesForm
              initialPreferences={preferences}
              onSave={updatePreferences}
              isSaving={isUpdatingPreferences}
            />
          )}

          {activeTab === 'security' && <SecurityTab />}
        </div>
      </div>
    </div>
  );
}

function ProfileForm({
  initialProfile,
  onSave,
  isSaving,
}: {
  initialProfile: UserProfile;
  onSave: (p: Partial<UserProfile>) => Promise<any>;
  isSaving: boolean;
}) {
  const [name, setName] = useState(initialProfile.name || '');
  const [email, setEmail] = useState(initialProfile.email || '');
  const [phone, setPhone] = useState(initialProfile.phone || '');
  const [bio, setBio] = useState(initialProfile.bio || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, email, phone, bio });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Full Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Morgan"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Email Address
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex@example.com"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Phone Number
          </label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
          Financial Biography & Objectives
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="Tell your AI advisor about your long term investment targets..."
          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <Button type="submit" variant="primary" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Profile Changes'}
        </Button>
      </div>
    </form>
  );
}

function PreferencesForm({
  initialPreferences,
  onSave,
  isSaving,
}: {
  initialPreferences: UserPreferences;
  onSave: (p: Partial<UserPreferences>) => Promise<any>;
  isSaving: boolean;
}) {
  const [currency, setCurrency] = useState<UserPreferences['currency']>(initialPreferences.currency || 'INR');
  const [emailAlerts, setEmailAlerts] = useState(initialPreferences.emailAlerts ?? true);
  const [pushNotifications, setPushNotifications] = useState(initialPreferences.pushNotifications ?? true);
  const [weeklyDigest, setWeeklyDigest] = useState(initialPreferences.weeklyDigest ?? true);
  const [investmentAlerts, setInvestmentAlerts] = useState(initialPreferences.investmentAlerts ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      currency,
      emailAlerts,
      pushNotifications,
      weeklyDigest,
      investmentAlerts,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="max-w-md">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
          Primary Base Currency
        </label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as any)}
          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="INR">Indian Rupee (INR ₹)</option>
          <option value="USD">US Dollar (USD $)</option>
          <option value="EUR">Euro (EUR €)</option>
          <option value="GBP">British Pound (GBP £)</option>
        </select>
        <p className="text-[11px] text-slate-400 mt-1">
          All metrics, transactions, and net worth calculations will display using this currency.
        </p>
      </div>

      <div className="pt-4 border-t border-slate-100 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Bell className="w-4 h-4 text-indigo-600" />
          Notification Preferences
        </h3>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <div>
              <p className="text-sm font-medium text-slate-800">Email Expense Alerts</p>
              <p className="text-xs text-slate-500">Receive alerts when shopping or dining exceeds monthly average.</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={pushNotifications}
              onChange={(e) => setPushNotifications(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <div>
              <p className="text-sm font-medium text-slate-800">Push Notifications</p>
              <p className="text-xs text-slate-500">Real-time alerts for incoming deposits and milestone completions.</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={weeklyDigest}
              onChange={(e) => setWeeklyDigest(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <div>
              <p className="text-sm font-medium text-slate-800">Weekly Financial Digest</p>
              <p className="text-xs text-slate-500">Summary email of net savings and cashflow trends every Monday.</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={investmentAlerts}
              onChange={(e) => setInvestmentAlerts(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <div>
              <p className="text-sm font-medium text-slate-800">Investment Market Signals</p>
              <p className="text-xs text-slate-500">Notifications on significant macro sentiment and holdings volatility.</p>
            </div>
          </label>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <Button type="submit" variant="primary" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </form>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-emerald-900 text-sm">Bank-Grade 256-bit Encryption</h4>
          <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
            All connected data adapters utilize tokenized API contracts. Raw credentials are never stored in the browser.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Connected Accounts & Institutions</h4>
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">HDFC Priority Banking</p>
              <p className="text-xs text-slate-400">Account Ending in ••4091</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Active Sync</span>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">ICICI Platinum Credit Feed</p>
              <p className="text-xs text-slate-400">Account Ending in ••8821</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Active Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
}
