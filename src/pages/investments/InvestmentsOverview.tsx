import { Link } from 'react-router-dom';
import { 
  usePortfolioSummary, 
  usePositions,
  useMarketSentiment,
  useRiskMetrics,
  useInvestmentInsights
} from '../../features/investments/hooks/useInvestments';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { ChevronRight, Wallet, TrendingUp, TrendingDown, Globe, Shield, Lightbulb } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export default function InvestmentsOverview() {
  const { data: summary, isLoading: isLoadingSummary, isError: isErrorSummary, refetch: refetchSummary } = usePortfolioSummary();
  const { data: positions, isLoading: isLoadingPositions } = usePositions();
  const { data: sentiment, isLoading: isLoadingSentiment } = useMarketSentiment();
  const { data: risk, isLoading: isLoadingRisk } = useRiskMetrics();
  const { data: insights, isLoading: isLoadingInsights } = useInvestmentInsights();

  const isLoading = isLoadingSummary || isLoadingPositions || isLoadingSentiment || isLoadingRisk || isLoadingInsights;
  const isError = isErrorSummary; // primary error boundary

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !summary) {
    return <ErrorState message="Failed to load investments hub." onRetry={refetchSummary} />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Investment Hub</h1>
      </div>

      {/* Portfolio Top Line */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-2 text-slate-500">
            <Wallet className="w-4 h-4" />
            <h2 className="text-sm font-medium">Total Value</h2>
          </div>
          <p className="text-2xl font-bold text-slate-900">${Number(summary.totalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-2 text-slate-500">
            <TrendingUp className="w-4 h-4" />
            <h2 className="text-sm font-medium">Total Invested</h2>
          </div>
          <p className="text-2xl font-bold text-slate-900">${Number(summary.totalInvested || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-2 text-slate-500">
            {Number(summary.todaysPnl || 0) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <h2 className="text-sm font-medium">Today's P&L</h2>
          </div>
          <p className={`text-2xl font-bold flex items-center gap-2 ${Number(summary.todaysPnl || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {Number(summary.todaysPnl || 0) >= 0 ? '+' : ''}${Number(summary.todaysPnl || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-2 text-slate-500">
            {Number(summary.overallPnl || 0) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <h2 className="text-sm font-medium">Overall Return</h2>
          </div>
          <p className={`text-2xl font-bold flex items-center gap-2 ${Number(summary.overallPnl || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {Number(summary.overallPnl || 0) >= 0 ? '+' : ''}{Number(summary.overallPnlPct || 0).toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Portfolio Snapshot */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-indigo-600" />
              Portfolio Snapshot
            </h3>
            <Link to="/app/investments/portfolio" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center">
              View Portfolio <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="p-5 flex-1">
            {positions && positions.length > 0 ? (
              <div className="space-y-4">
                {positions.slice(0, 3).map(pos => (
                  <div key={pos.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{pos.ticker}</p>
                      <p className="text-xs text-slate-500">{pos.shares} shares</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">${Number(pos.totalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      <p className={`text-xs font-medium ${Number(pos.pnl || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {Number(pos.pnl || 0) >= 0 ? '+' : ''}{Number(pos.pnlPct || 0).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No active positions.</p>
            )}
          </div>
        </div>

        {/* Market Intelligence */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" />
              Market Intelligence
            </h3>
            <Link to="/app/investments/market" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center">
              View Market <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="p-5 flex-1 flex flex-col justify-center gap-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Market Sentiment</span>
              <span className={`font-semibold ${sentiment?.score && sentiment.score >= 65 ? 'text-emerald-600' : sentiment?.score && sentiment.score <= 35 ? 'text-rose-600' : 'text-slate-700'}`}>
                {sentiment?.label || 'Neutral'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Volatility Index</span>
              <span className="font-mono font-medium text-slate-900">{sentiment?.volatilityIndex.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Risk Snapshot */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              Risk Snapshot
            </h3>
            <Link to="/app/investments/risk" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center">
              View Risk <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="p-5 flex-1 flex flex-col justify-center gap-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Risk Level</span>
              <Badge variant={risk?.riskLevel === 'Low' ? 'success' : risk?.riskLevel === 'High' ? 'error' : 'warning'}>
                {risk?.riskLevel || 'Unknown'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Portfolio Beta</span>
              <span className="font-mono font-medium text-slate-900">{risk?.beta.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Risk Score</span>
              <span className="font-mono font-medium text-slate-900">{risk?.riskScore}/100</span>
            </div>
          </div>
        </div>

        {/* Insights Snapshot */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-indigo-600" />
              Investment Insights
            </h3>
            <Link to="/app/investments/insights" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center">
              View Insights <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="p-5 flex-1">
            {insights && insights.length > 0 ? (
              <div className="space-y-4">
                {insights.slice(0, 2).map(insight => (
                  <div key={insight.id} className="flex items-start justify-between">
                    <div>
                      <p className="font-mono font-bold text-slate-900">{insight.ticker}</p>
                      <p className="text-xs text-slate-500 mt-0.5 max-w-[200px] truncate">{insight.name}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${insight.analysis.overallSignal === 'Positive' ? 'text-emerald-600' : insight.analysis.overallSignal === 'Negative' ? 'text-rose-600' : 'text-slate-600'}`}>
                        {insight.analysis.overallSignal}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">{insight.analysis.confidence}% conf</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No active insights.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
