import { useState, useMemo } from 'react';
import { usePositions, usePortfolioSummary } from '../../features/investments/hooks/useInvestments';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { TrendingUp, TrendingDown, PieChart, Wallet, Search, ChevronRight } from 'lucide-react';
import { AssetDetailModal } from '../../features/investments/components/AssetDetailModal';
import { Badge } from '../../components/ui/Badge';


export default function Portfolio() {
  const { data: positions, isLoading: isPositionsLoading, isError: isPositionsError, refetch: refetchPositions } = usePositions();
  const { data: summary, isLoading: isSummaryLoading, isError: isSummaryError, refetch: refetchSummary } = usePortfolioSummary();

  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [sortBy, setSortBy] = useState<'value' | 'pnl' | 'allocation' | 'name'>('value');
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  const isLoading = isPositionsLoading || isSummaryLoading;
  const isError = isPositionsError || isSummaryError;

  const handleRetry = () => {
    refetchPositions();
    refetchSummary();
  };

  const sectors = useMemo(() => {
    if (!positions) return ['All'];
    const unique = Array.from(new Set(positions.map((p) => p.sector || 'Other')));
    return ['All', ...unique];
  }, [positions]);

  const filteredPositions = useMemo(() => {
    if (!positions) return [];
    return positions
      .filter((p) => {
        if (search && !p.ticker.toLowerCase().includes(search.toLowerCase()) && !p.name.toLowerCase().includes(search.toLowerCase())) {
          return false;
        }
        if (selectedSector !== 'All' && (p.sector || 'Other') !== selectedSector) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'value') return b.totalValue - a.totalValue;
        if (sortBy === 'pnl') return b.pnl - a.pnl;
        if (sortBy === 'allocation') return b.allocation - a.allocation;
        if (sortBy === 'name') return a.ticker.localeCompare(b.ticker);
        return 0;
      });
  }, [positions, search, selectedSector, sortBy]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return <ErrorState message="Failed to load portfolio." onRetry={handleRetry} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Investment Portfolio</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time positions ledger, allocation weights, and asset intelligence drill-down.
          </p>
        </div>
      </div>

      {/* Portfolio Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200">
          <div className="flex items-center gap-2 mb-2 text-slate-500">
            <Wallet className="w-4 h-4" />
            <h2 className="text-xs font-semibold uppercase tracking-wider">Total Value</h2>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">
            ${Number(summary?.totalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200">
          <div className="flex items-center gap-2 mb-2 text-slate-500">
            <TrendingUp className="w-4 h-4" />
            <h2 className="text-xs font-semibold uppercase tracking-wider">Total Invested</h2>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">
            ${Number(summary?.totalInvested || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200">
          <div className="flex items-center gap-2 mb-2 text-slate-500">
            {summary && Number(summary.todaysPnl) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <h2 className="text-xs font-semibold uppercase tracking-wider">Today's P&L</h2>
          </div>
          <p className={`text-2xl font-bold flex items-center gap-2 font-mono ${summary && Number(summary.todaysPnl) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {summary && Number(summary.todaysPnl) >= 0 ? '+' : ''}${Number(summary?.todaysPnl || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {summary && Number(summary.todaysPnlPct) > 0 ? '+' : ''}{Number(summary?.todaysPnlPct || 0).toFixed(2)}%
            </span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200">
          <div className="flex items-center gap-2 mb-2 text-slate-500">
            {summary && Number(summary.overallPnl) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <h2 className="text-xs font-semibold uppercase tracking-wider">Overall Return</h2>
          </div>
          <p className={`text-2xl font-bold flex items-center gap-2 font-mono ${summary && Number(summary.overallPnl) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {summary && Number(summary.overallPnl) >= 0 ? '+' : ''}${Number(summary?.overallPnl || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
              {summary && Number(summary.overallPnlPct) > 0 ? '+' : ''}{Number(summary?.overallPnlPct || 0).toFixed(2)}%
            </span>
          </p>
        </div>
      </div>

      {/* Allocation Distribution Bar */}
      {positions && positions.length > 0 && (
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-indigo-600" />
              Asset Allocation Composition
            </h3>
            <span className="text-xs text-slate-500">{positions.length} Active Positions</span>
          </div>

          <div className="w-full h-3 rounded-full overflow-hidden flex gap-0.5 bg-slate-100">
            {positions.map((pos, idx) => {
              const colors = ['bg-indigo-600', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500'];
              return (
                <div
                  key={pos.id}
                  className={`${colors[idx % colors.length]} transition-all`}
                  style={{ width: `${pos.allocation}%` }}
                  title={`${pos.ticker}: ${pos.allocation}%`}
                />
              );
            })}
          </div>

          <div className="flex flex-wrap gap-4 mt-3 text-xs">
            {positions.map((pos, idx) => {
              const dotColors = ['bg-indigo-600', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500'];
              return (
                <div key={pos.id} className="flex items-center gap-1.5 cursor-pointer" onClick={() => setSelectedTicker(pos.ticker)}>
                  <div className={`w-2.5 h-2.5 rounded-full ${dotColors[idx % dotColors.length]}`} />
                  <span className="font-semibold text-slate-900">{pos.ticker}</span>
                  <span className="text-slate-400">({pos.allocation}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ticker or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              {sectors.map((sec) => (
                <option key={sec} value={sec}>
                  {sec === 'All' ? 'All Sectors' : sec}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="value">Sort by Market Value</option>
              <option value="pnl">Sort by Unrealized P&L</option>
              <option value="allocation">Sort by Allocation %</option>
              <option value="name">Sort by Ticker Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Positions Ledger */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold text-slate-900">Active Positions ({filteredPositions.length})</h2>
          </div>
          <span className="text-xs text-slate-400">Click any row to open Asset Intelligence</span>
        </div>

        {filteredPositions.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No active positions found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Asset / Ticker</th>
                  <th className="px-6 py-4 text-right">Shares</th>
                  <th className="px-6 py-4 text-right">Avg Cost</th>
                  <th className="px-6 py-4 text-right">Current Price</th>
                  <th className="px-6 py-4 text-right">Market Value</th>
                  <th className="px-6 py-4 text-right">Total P&L</th>
                  <th className="px-6 py-4 text-right">Allocation</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPositions.map((pos) => {
                  const isPositive = Number(pos.pnl) >= 0;
                  return (
                    <tr
                      key={pos.id}
                      onClick={() => setSelectedTicker(pos.ticker)}
                      className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {pos.ticker}
                          </span>
                          {pos.sector && (
                            <Badge variant="default" size="sm">
                              {pos.sector}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">{pos.name}</div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-medium text-slate-700">{pos.shares}</td>
                      <td className="px-6 py-4 text-right font-mono text-slate-500">${Number(pos.avgPrice).toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-mono font-medium text-slate-900">
                        ${Number(pos.currentPrice).toFixed(2)}
                        {pos.dayChangePct !== undefined && (
                          <span className={`block text-[11px] ${Number(pos.dayChangePct) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {Number(pos.dayChangePct) >= 0 ? '+' : ''}{Number(pos.dayChangePct).toFixed(2)}%
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-semibold text-slate-900">
                        ${Number(pos.totalValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right font-mono">
                        <div className={`font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isPositive ? '+' : ''}${Number(pos.pnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className={`text-xs font-medium ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {isPositive ? '+' : ''}{Number(pos.pnlPct).toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500">
                        <div className="flex items-center justify-end gap-2">
                          <span className="w-12 font-mono">{Number(pos.allocation).toFixed(1)}%</span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${Number(pos.allocation)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center text-xs font-semibold text-indigo-600 group-hover:text-indigo-800">
                          Inspect <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Asset Detail Drill-Down Modal */}
      <AssetDetailModal
        ticker={selectedTicker}
        isOpen={Boolean(selectedTicker)}
        onClose={() => setSelectedTicker(null)}
      />
    </div>
  );
}
