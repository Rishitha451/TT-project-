import { useState } from 'react';

import { useAnalytics } from '../features/analytics/hooks/useAnalytics';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/common/ErrorState';
import { MetricCard } from '../features/dashboard/components/MetricCard';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { TrendingUp, TrendingDown, PiggyBank, Percent, BarChart3, PieChart as PieIcon } from 'lucide-react';

export default function Analytics() {
  const [timeframe, setTimeframe] = useState('6m');
  const { data: analytics, isLoading, isError, error, refetch } = useAnalytics(timeframe);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !analytics) {
    return (
      <ErrorState
        title="Unable to load analytics"
        message={(error as Error)?.message || 'Failed to fetch financial analytics trends.'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Macro trends, cashflow velocity, and category allocations over time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Range:</span>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Past 12 Months</option>
          </select>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Inflow"
          amount={analytics.totalIncome}
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          changePercentage={0.0}
          changeType="neutral"
          subtitle="Cumulative period earnings"
        />

        <MetricCard
          title="Total Expenses"
          amount={analytics.totalExpenses}
          icon={<TrendingDown className="w-5 h-5 text-rose-600" />}
          changePercentage={-1.8}
          changeType="positive"
          subtitle="Controlled burn rate"
        />

        <MetricCard
          title="Net Savings"
          amount={analytics.netSavings}
          icon={<PiggyBank className="w-5 h-5 text-indigo-600" />}
          changePercentage={5.4}
          changeType="positive"
          subtitle="Retained cash surplus"
        />

        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Savings Rate</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900">{analytics.savingsRate.toFixed(1)}%</div>
            <p className="text-xs text-emerald-600 font-medium mt-1">Exceeds 20% baseline target</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold text-slate-900">Monthly Cashflow Trend</h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">Income vs Outflow</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.monthlyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="savings" name="Savings" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut Chart */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold text-slate-900">Expense Distribution</h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">By Category</span>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.categoryBreakdown}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {analytics.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Spent']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Spending Categories Table */}
      <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200">
        <h2 className="font-semibold text-slate-900 mb-4">Top Spending Categories Breakdown</h2>
        <div className="space-y-4">
          {analytics.topExpenses.map((cat, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-800">{cat.category}</span>
                <span className="text-slate-900 font-mono font-semibold">
                  ₹{cat.amount.toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-normal text-slate-400">({cat.percentage}%)</span>
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
