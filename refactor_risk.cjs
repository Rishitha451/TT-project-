const fs = require('fs');
const path = require('path');
const p = path.resolve(__dirname, 'src/pages/investments/Risk.tsx');

const content = `import { useRiskMetrics, useMarketSentiment } from '../../features/investments/hooks/useInvestments';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { Shield, Brain, Info, PieChart } from 'lucide-react';
import { SentimentGauge } from '../../features/investments/components/SentimentGauge';

export default function Risk() {
  const { data: risk, isLoading: isRiskLoading, isError: isRiskError, refetch: refetchRisk } = useRiskMetrics();
  const { data: sentiment, isLoading: isSentimentLoading, isError: isSentimentError, refetch: refetchSentiment } = useMarketSentiment();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Risk & Sentiment</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Overview & Meter */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold text-slate-900">Portfolio Risk Profile</h2>
            </div>
            
            {isRiskLoading ? (
              <Skeleton className="w-full h-48" />
            ) : isRiskError ? (
              <ErrorState message="Failed to load risk metrics." onRetry={refetchRisk} />
            ) : !risk ? (
              <div className="p-4 text-slate-500">No risk data available.</div>
            ) : (
              <div className="space-y-8">
                <RiskMeter score={risk.riskScore} level={risk.riskLevel} />
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-sm text-slate-500">Volatility (σ)</p>
                    <p className="text-xl font-semibold text-slate-900 mt-1">{risk.volatility.toFixed(4)}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-sm text-slate-500">Beta (β)</p>
                    <p className="text-xl font-semibold text-slate-900 mt-1">{risk.beta.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-sm text-slate-500">Sharpe Ratio</p>
                    <p className="text-xl font-semibold text-slate-900 mt-1">{risk.sharpeRatio.toFixed(2)}</p>
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex gap-3">
                  <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-indigo-900 mb-1">Risk Summary</h3>
                    <p className="text-sm text-indigo-800 leading-relaxed">
                      Your portfolio currently maintains a <strong>{risk.riskLevel.toLowerCase()}</strong> risk profile with a score of {risk.riskScore}/100. 
                      Volatility remains controlled, and the Sharpe ratio indicates a favorable risk-adjusted return. 
                      Market sentiment is currently {sentiment?.label.toLowerCase() || 'unknown'}.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Diversification / Exposure */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold text-slate-900">Sector Exposure</h2>
            </div>
            
            {isRiskLoading ? (
              <Skeleton className="w-full h-32" />
            ) : isRiskError || !risk ? (
              <div className="text-slate-500 text-sm">Exposure data unavailable.</div>
            ) : (
              <div className="space-y-4">
                {risk.exposure.map((exp, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-slate-700 w-1/3">{exp.sector}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: \`\${exp.percentage}%\` }} />
                    </div>
                    <span className="text-sm text-slate-500 w-12 text-right">{exp.percentage}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sentiment Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center h-full">
            <div className="flex items-center gap-2 self-start mb-8">
              <Brain className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold text-slate-900">Market Sentiment</h2>
            </div>
            
            {isSentimentLoading ? (
              <Skeleton className="w-48 h-48 rounded-full" />
            ) : isSentimentError ? (
              <ErrorState message="Failed to load sentiment." onRetry={refetchSentiment} />
            ) : !sentiment ? (
              <div className="p-4 text-slate-500">No sentiment data available.</div>
            ) : (
              <div className="flex-1 flex items-center justify-center w-full">
                <SentimentGauge score={sentiment.score} label={sentiment.label} />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// --- Helper Component ---

function RiskMeter({ score, level }: { score: number, level: string }) {
  // Score is 0 to 100
  
  let colorClass = 'text-slate-600';
  let bgClass = 'bg-slate-100';
  let activeBg = 'bg-slate-500';
  
  if (score < 40) { 
    colorClass = 'text-emerald-600'; 
    bgClass = 'bg-emerald-50'; 
    activeBg = 'bg-emerald-500'; 
  } else if (score < 70) { 
    colorClass = 'text-amber-600'; 
    bgClass = 'bg-amber-50'; 
    activeBg = 'bg-amber-500'; 
  } else { 
    colorClass = 'text-rose-600'; 
    bgClass = 'bg-rose-50'; 
    activeBg = 'bg-rose-500'; 
  }

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Risk Score</div>
          <div className="font-mono text-3xl font-bold text-slate-900">
            {score}
          </div>
        </div>
        <span className={\`font-mono text-xs font-bold px-3 py-1.5 rounded-lg \${bgClass} \${colorClass}\`}>
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
              className={\`flex-1 rounded-sm transition-all duration-300 \${active ? activeBg : 'bg-slate-100'}\`}
              style={{
                height: \`\${20 + i * 4}%\`,
                opacity: active ? 0.6 + (i / 20) * 0.4 : 1,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
`;

fs.writeFileSync(p, content);
console.log('Risk page rewritten');
