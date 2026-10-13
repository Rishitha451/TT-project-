import { useRiskMetrics, useMarketSentiment } from '../../features/investments/hooks/useInvestments';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { Shield, Brain, Info, PieChart, TrendingUp, TrendingDown, Layers } from 'lucide-react';
import { SentimentGauge } from '../../features/investments/components/SentimentGauge';
import { Badge } from '../../components/ui/Badge';


export default function Risk() {
  const { data: risk, isLoading: isRiskLoading, isError: isRiskError, refetch: refetchRisk } = useRiskMetrics();
  const { data: sentiment, isLoading: isSentimentLoading, isError: isSentimentError, refetch: refetchSentiment } = useMarketSentiment();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Risk & Sentiment Intelligence</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Portfolio volatility analysis, sector concentration, and macro stress-test simulations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Overview & Meter */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold text-slate-900">Portfolio Risk Profile</h2>
            </div>

            {isRiskLoading ? (
              <Skeleton className="w-full h-48 rounded-xl" />
            ) : isRiskError ? (
              <ErrorState message="Failed to load risk metrics." onRetry={refetchRisk} />
            ) : !risk ? (
              <div className="p-4 text-slate-500 text-sm">No risk data available.</div>
            ) : (
              <div className="space-y-8">
                <RiskMeter score={risk.riskScore} level={risk.riskLevel} />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Volatility (σ)</p>
                    <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{Number(risk.volatility).toFixed(3)}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Annualized Std Dev</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Beta (β)</p>
                    <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{Number(risk.beta).toFixed(2)}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">vs. S&P 500 Index</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sharpe Ratio</p>
                    <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{Number(risk.sharpeRatio).toFixed(2)}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Risk-adjusted return</p>
                  </div>
                </div>

                <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 flex gap-3">
                  <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-indigo-900 text-sm mb-0.5">Risk Summary & Advisory Signal</h3>
                    <p className="text-xs text-indigo-800 leading-relaxed">
                      Your portfolio currently maintains a <strong>{risk.riskLevel.toLowerCase()}</strong> risk profile with an aggregate score of {risk.riskScore}/100. 
                      Volatility remains stable, and the Sharpe ratio of {Number(risk.sharpeRatio).toFixed(2)} reflects favorable excess returns relative to the benchmark. 
                      Market sentiment is currently {sentiment?.label.toLowerCase() || 'bullish'}.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Macro Stress-Test Scenarios */}
          {risk?.scenarios && (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <h2 className="font-semibold text-slate-900">Deterministic Stress-Test Scenarios</h2>
                </div>
                <span className="text-xs text-slate-400">Simulated portfolio impact</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {risk.scenarios.map((scenario) => {
                  const isPositive = scenario.estimatedImpactPct >= 0;
                  return (
                    <div
                      key={scenario.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold text-slate-900">{scenario.name}</h4>
                          <Badge
                            variant={
                              scenario.severity === 'high'
                                ? 'error'
                                : scenario.severity === 'medium'
                                ? 'warning'
                                : 'success'
                            }
                            size="sm"
                          >
                            {scenario.likelihood}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed mb-3">
                          {scenario.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500">Estimated Impact</span>
                        <span
                          className={`font-mono font-bold text-sm flex items-center gap-0.5 ${
                            isPositive ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {isPositive ? '+' : ''}{Number(scenario.estimatedImpactPct).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Diversification / Exposure */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold text-slate-900">Sector Concentration Exposure</h2>
            </div>

            {isRiskLoading ? (
              <Skeleton className="w-full h-32 rounded-xl" />
            ) : isRiskError || !risk ? (
              <div className="text-slate-500 text-sm">Exposure data unavailable.</div>
            ) : (
              <div className="space-y-4">
                {risk.exposure.map((exp, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-slate-800">{exp.sector}</span>
                      <span className="text-slate-900 font-mono font-semibold">{exp.percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${exp.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sentiment Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 flex flex-col items-center">
            <div className="flex items-center gap-2 self-start mb-6">
              <Brain className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold text-slate-900">Market Sentiment</h2>
            </div>

            {isSentimentLoading ? (
              <Skeleton className="w-48 h-48 rounded-full" />
            ) : isSentimentError ? (
              <ErrorState message="Failed to load sentiment." onRetry={refetchSentiment} />
            ) : !sentiment ? (
              <div className="p-4 text-slate-500 text-sm">No sentiment data available.</div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <SentimentGauge score={sentiment.score} label={sentiment.label} />
                <div className="mt-6 w-full pt-4 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Index Score</span>
                    <span className="font-mono font-bold text-slate-900">{sentiment.score}/100</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Sentiment Tier</span>
                    <span className="font-bold text-emerald-600">{sentiment.label}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskMeter({ score, level }: { score: number; level: string }) {
  let colorClass = 'text-slate-600';
  let bgClass = 'bg-slate-100';
  let activeBg = 'bg-slate-500';

  if (score < 40) {
    colorClass = 'text-emerald-700';
    bgClass = 'bg-emerald-50';
    activeBg = 'bg-emerald-500';
  } else if (score < 70) {
    colorClass = 'text-amber-700';
    bgClass = 'bg-amber-50';
    activeBg = 'bg-amber-500';
  } else {
    colorClass = 'text-rose-700';
    bgClass = 'bg-rose-50';
    activeBg = 'bg-rose-500';
  }

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">
            Overall Risk Score
          </div>
          <div className="font-mono text-4xl font-bold text-slate-900">{score}</div>
        </div>
        <span className={`font-mono text-xs font-bold px-3 py-1.5 rounded-lg border ${bgClass} ${colorClass}`}>
          {level.toUpperCase()} RISK
        </span>
      </div>

      <div className="flex gap-1 items-end h-12">
        {Array.from({ length: 20 }, (_, i) => {
          const threshold = (i / 20) * 100;
          const active = score >= threshold;
          return (
            <div
              key={i}
              className={`flex-1 rounded-xs transition-all duration-300 ${active ? activeBg : 'bg-slate-100'}`}
              style={{
                height: `${20 + i * 4}%`,
                opacity: active ? 0.6 + (i / 20) * 0.4 : 1,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
