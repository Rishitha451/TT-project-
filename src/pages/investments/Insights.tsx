import { useState, useMemo } from 'react';
import { useInvestmentInsights } from '../../features/investments/hooks/useInvestments';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { Target, Cpu, BarChart3, Info, Sparkles, ChevronRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { AssetDetailModal } from '../../features/investments/components/AssetDetailModal';
import { Button } from '../../components/ui/Button';


export default function Insights() {
  const { data: insights, isLoading, isError, refetch } = useInvestmentInsights();
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const activeInsight = useMemo(() => {
    if (!insights || insights.length === 0) return null;
    if (!selectedTicker) return insights[0];
    return insights.find((i) => i.ticker === selectedTicker) || insights[0];
  }, [insights, selectedTicker]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full max-w-md" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (isError) {
    return <ErrorState message="Failed to load investment insights." onRetry={refetch} />;
  }

  if (!insights || insights.length === 0 || !activeInsight) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-xl shadow-xs border border-slate-200">
        No investment insights available at this time.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Investment Insights & Signals</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Algorithmic thesis, multi-factor decision matrices, and risk-weighted recommendations.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDetailModalOpen(true)}
          leftIcon={<Sparkles className="w-4 h-4 text-indigo-600" />}
        >
          Inspect {activeInsight.ticker} Fundamentals
        </Button>
      </div>

      {/* Asset Selection Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {insights.map((item) => {
          const isSelected = item.ticker === activeInsight.ticker;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedTicker(item.ticker)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-900 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="font-mono font-bold">{item.ticker}</span>
              <span className="text-xs text-slate-400 font-normal truncate max-w-[120px]">{item.name}</span>
              <span
                className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                  item.analysis.overallSignal === 'Positive'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {item.analysis.overallSignal}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Analysis View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Factor Matrix */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                <h2 className="font-semibold text-slate-900">Thesis Signal</h2>
              </div>
              {activeInsight.actionRecommendation && (
                <Badge
                  variant={
                    activeInsight.actionRecommendation === 'BUY'
                      ? 'success'
                      : activeInsight.actionRecommendation === 'TRIM'
                      ? 'error'
                      : 'warning'
                  }
                  size="sm"
                >
                  ACTION: {activeInsight.actionRecommendation}
                </Badge>
              )}
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Signal Rating</p>
                <span className="text-lg font-bold text-emerald-600">
                  {activeInsight.analysis.overallSignal}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Model Confidence</p>
                <p className="text-2xl font-bold font-mono text-slate-900">{activeInsight.analysis.confidence}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold text-slate-900">Factor Decomposition</h2>
            </div>

            <div className="space-y-4">
              {activeInsight.analysis.factors.map((factor, idx) => (
                <div key={idx} className="space-y-1.5 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{factor.name}</span>
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-bold uppercase tracking-wider text-[10px] ${
                          factor.signal === 'Positive'
                            ? 'text-emerald-600'
                            : factor.signal === 'Negative'
                            ? 'text-rose-600'
                            : 'text-slate-500'
                        }`}
                      >
                        {factor.signal}
                      </span>
                      <span className="font-mono text-slate-400 font-semibold">{factor.contribution}%</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${factor.contribution}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Reasoning & Considerations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 flex flex-col justify-between h-full">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-600" />
                  <h2 className="font-semibold text-slate-900">
                    {activeInsight.ticker} — Qualitative Thesis & Rationale
                  </h2>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Why this algorithmic rating?
                </h3>
                <ul className="space-y-2.5">
                  {activeInsight.reasoning.map((text, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-slate-700 text-sm leading-relaxed">
                      <span className="text-indigo-500 mt-1 font-bold">•</span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Key Risk Factors & Considerations
                </h3>
                <div className="space-y-2">
                  {activeInsight.considerations.map((text, idx) => {
                    const isPositive = text.startsWith('✓');
                    const isWarning = text.startsWith('⚠');
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                          isPositive
                            ? 'bg-emerald-50/60 border-emerald-100 text-emerald-950'
                            : isWarning
                            ? 'bg-amber-50/60 border-amber-100 text-amber-950'
                            : 'bg-slate-50 border-slate-100 text-slate-800'
                        }`}
                      >
                        {isPositive ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : isWarning ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        ) : (
                          <span className="w-4 h-4 text-slate-400 shrink-0 text-center font-bold">•</span>
                        )}
                        <span className="font-medium leading-relaxed">
                          {text.startsWith('✓') || text.startsWith('⚠') ? text.substring(2) : text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-slate-400 text-xs">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Computed {new Date(activeInsight.timestamp).toLocaleDateString()} with verified market data.</span>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(true)}
                className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                View Asset Metrics <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Detail Modal */}
      <AssetDetailModal
        ticker={activeInsight.ticker}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  );
}
