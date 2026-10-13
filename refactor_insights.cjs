const fs = require('fs');
const path = require('path');
const p = path.resolve(__dirname, 'src/pages/investments/Insights.tsx');

const content = `import { useState, useMemo } from 'react';
import { useInvestmentInsights } from '../../features/investments/hooks/useInvestments';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { Lightbulb, Info, Target, Cpu, ShieldAlert, BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export default function Insights() {
  const { data: insights, isLoading, isError, refetch } = useInvestmentInsights();
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  const selectedInsight = useMemo(() => {
    if (!insights || insights.length === 0) return null;
    if (!selectedTicker) return insights[0];
    return insights.find(i => i.ticker === selectedTicker) || insights[0];
  }, [insights, selectedTicker]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full max-w-sm" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError) {
    return <ErrorState message="Failed to load investment insights." onRetry={refetch} />;
  }

  if (!insights || insights.length === 0 || !selectedInsight) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">
        No investment insights available at this time.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Investment Insights</h1>
        
        {/* Asset Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-500">Asset:</span>
          <select 
            className="bg-white border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 font-semibold"
            value={selectedTicker || selectedInsight.ticker}
            onChange={(e) => setSelectedTicker(e.target.value)}
          >
            {insights.map(i => (
              <option key={i.id} value={i.ticker}>{i.ticker} - {i.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Factors (DecisionMatrix conceptual migration) */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold text-slate-900">Overall Analysis</h2>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div>
                <p className="text-sm text-slate-500 mb-1">Signal</p>
                <Badge variant={selectedInsight.analysis.overallSignal === 'Positive' ? 'success' : selectedInsight.analysis.overallSignal === 'Negative' ? 'error' : 'default'}>
                  {selectedInsight.analysis.overallSignal.toUpperCase()}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 mb-1">Confidence</p>
                <p className="text-2xl font-bold text-slate-900">{selectedInsight.analysis.confidence}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold text-slate-900">Analysis Factors</h2>
            </div>
            
            <div className="space-y-4">
              {selectedInsight.analysis.factors.map((factor, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <span className="text-sm font-medium text-slate-700">{factor.name}</span>
                  <div className="flex items-center gap-4">
                    <span className={\`text-xs font-bold uppercase tracking-wider \${
                      factor.signal === 'Positive' ? 'text-emerald-600' :
                      factor.signal === 'Negative' ? 'text-rose-600' :
                      'text-slate-500'
                    }\`}>
                      {factor.signal}
                    </span>
                    <span className="text-sm font-mono text-slate-400 w-8 text-right">
                      {factor.contribution}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Reasoning (OracleStream conceptual migration) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Cpu className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold text-slate-900">AI Analysis</h2>
            </div>
            
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Why this analysis?</h3>
                <ul className="space-y-3">
                  {selectedInsight.reasoning.map((text, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700 text-sm leading-relaxed">
                      <span className="text-indigo-500 mt-1">•</span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Key Considerations</h3>
                <ul className="space-y-3">
                  {selectedInsight.considerations.map((text, idx) => {
                    const isPositive = text.startsWith('✓');
                    const isWarning = text.startsWith('⚠');
                    return (
                      <li key={idx} className="flex items-start gap-2 text-sm leading-relaxed">
                        <span className={\`mt-0.5 shrink-0 \${isPositive ? 'text-emerald-500' : isWarning ? 'text-amber-500' : 'text-slate-400'}\`}>
                          {isPositive ? '✓' : isWarning ? '⚠' : '•'}
                        </span>
                        <span className={\`\${isPositive ? 'text-emerald-900 font-medium' : isWarning ? 'text-amber-900 font-medium' : 'text-slate-700'}\`}>
                          {text.substring(2)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-start gap-2 text-slate-500 text-xs">
              <Info className="w-4 h-4 shrink-0" />
              <p>
                This analysis is for informational purposes only and does not constitute financial advice or a recommendation to buy or sell securities. 
                Data processed at {new Date(selectedInsight.timestamp).toLocaleTimeString()}.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
`;

fs.writeFileSync(p, content);
console.log('Insights page rewritten');
