const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, 'src');

const mkdir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

mkdir(path.join(srcDir, 'pages/investments'));

const overviewContent = `import { Link } from 'react-router-dom';
import { usePortfolioSummary } from '../features/investments/hooks/useInvestments';
import { Skeleton } from '../components/ui/Skeleton';
import ErrorState from '../components/common/ErrorState';

export default function InvestmentsOverview() {
  const { data: summary, isLoading, isError, refetch } = usePortfolioSummary();

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-40 w-full" /><Skeleton className="h-64 w-full" /></div>;
  if (isError) return <ErrorState message="Failed to load investments overview." onRetry={refetch} />;
  if (!summary) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Investments</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">Total Portfolio Value</p>
          <p className="text-2xl font-bold text-slate-900">\${summary.totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">Today's P&L</p>
          <p className={\`text-2xl font-bold \${summary.todaysPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}\`}>
            {summary.todaysPnl >= 0 ? '+' : ''}\${summary.todaysPnl.toLocaleString()} ({summary.todaysPnlPct}%)
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">Risk Level</p>
          <p className="text-2xl font-bold text-slate-900">{summary.riskLevel}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">Market Sentiment</p>
          <p className="text-2xl font-bold text-slate-900">{summary.marketSentiment}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <Link to="/app/investments/portfolio" className="block p-5 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-100">
          <h3 className="font-semibold text-indigo-900">Portfolio</h3>
          <p className="text-sm text-indigo-700 mt-1">View positions and performance</p>
        </Link>
        <Link to="/app/investments/market" className="block p-5 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-100">
          <h3 className="font-semibold text-indigo-900">Market</h3>
          <p className="text-sm text-indigo-700 mt-1">News, sentiment, and trends</p>
        </Link>
        <Link to="/app/investments/risk" className="block p-5 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-100">
          <h3 className="font-semibold text-indigo-900">Risk</h3>
          <p className="text-sm text-indigo-700 mt-1">Analyze portfolio volatility</p>
        </Link>
        <Link to="/app/investments/insights" className="block p-5 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-100">
          <h3 className="font-semibold text-indigo-900">Insights</h3>
          <p className="text-sm text-indigo-700 mt-1">AI-driven investment signals</p>
        </Link>
      </div>
    </div>
  );
}
`;
fs.writeFileSync(path.join(srcDir, 'pages/investments/InvestmentsOverview.tsx'), overviewContent);

const portfolioContent = `import { usePositions } from '../../features/investments/hooks/useInvestments';
import { Skeleton } from '../../components/ui/Skeleton';
import ErrorState from '../../components/common/ErrorState';

export default function Portfolio() {
  const { data: positions, isLoading, isError, refetch } = usePositions();

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-64 w-full" /></div>;
  if (isError) return <ErrorState message="Failed to load portfolio." onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Portfolio</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Your Positions</h2>
        </div>
        <div className="p-6">
          <p className="text-slate-500 italic text-sm">PortfolioLedger integration planned for Phase 2.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-4 py-3">Asset</th>
                  <th className="px-4 py-3 text-right">Shares</th>
                  <th className="px-4 py-3 text-right">Current Price</th>
                  <th className="px-4 py-3 text-right">Total Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {positions?.map(pos => (
                  <tr key={pos.id}>
                    <td className="px-4 py-3 font-medium">{pos.ticker}</td>
                    <td className="px-4 py-3 text-right">{pos.shares}</td>
                    <td className="px-4 py-3 text-right">\${pos.currentPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">\${pos.totalValue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync(path.join(srcDir, 'pages/investments/Portfolio.tsx'), portfolioContent);

const marketContent = `import { useMarketNews } from '../../features/investments/hooks/useInvestments';
import { Skeleton } from '../../components/ui/Skeleton';
import ErrorState from '../../components/common/ErrorState';

export default function Market() {
  const { data: news, isLoading, isError, refetch } = useMarketNews();

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-64 w-full" /></div>;
  if (isError) return <ErrorState message="Failed to load market data." onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Market Intelligence</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Latest News</h2>
            <p className="text-slate-500 italic text-sm mb-4">IngestionFeed integration planned for Phase 3.</p>
            <div className="space-y-4">
              {news?.map(item => (
                <div key={item.id} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <h3 className="font-medium text-slate-900">{item.headline}</h3>
                  <div className="flex gap-2 text-xs text-slate-500 mt-1">
                    <span>{item.source}</span>
                    <span>•</span>
                    <span>{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-2">Market Sentiment</h2>
            <p className="text-slate-500 italic text-sm">SentimentGauge & Sparkline integration planned for Phase 3.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync(path.join(srcDir, 'pages/investments/Market.tsx'), marketContent);

const riskContent = `import { useRiskMetrics } from '../../features/investments/hooks/useInvestments';
import { Skeleton } from '../../components/ui/Skeleton';
import ErrorState from '../../components/common/ErrorState';

export default function Risk() {
  const { data: risk, isLoading, isError, refetch } = useRiskMetrics();

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-64 w-full" /></div>;
  if (isError) return <ErrorState message="Failed to load risk metrics." onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Risk & Sentiment</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Portfolio Risk Overview</h2>
        <p className="text-slate-500 italic text-sm mb-6">RiskMeter integration planned for Phase 4.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-sm text-slate-500">Volatility</p>
            <p className="text-xl font-semibold text-slate-900 mt-1">{risk?.volatility.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-sm text-slate-500">Beta</p>
            <p className="text-xl font-semibold text-slate-900 mt-1">{risk?.beta.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-sm text-slate-500">Sharpe Ratio</p>
            <p className="text-xl font-semibold text-slate-900 mt-1">{risk?.sharpeRatio.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync(path.join(srcDir, 'pages/investments/Risk.tsx'), riskContent);

const insightsContent = `import { useInvestmentInsights } from '../../features/investments/hooks/useInvestments';
import { Skeleton } from '../../components/ui/Skeleton';
import ErrorState from '../../components/common/ErrorState';
import { Badge } from '../../components/ui/Badge';

export default function Insights() {
  const { data: insights, isLoading, isError, refetch } = useInvestmentInsights();

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-64 w-full" /></div>;
  if (isError) return <ErrorState message="Failed to load investment insights." onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Investment Insights</h1>
          <p className="text-slate-500 mt-1 text-sm">AI-driven analysis and trading signals</p>
        </div>
        <p className="text-slate-400 italic text-xs max-w-xs text-right">OracleStream and DecisionMatrix integrations planned for Phase 5.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {insights?.map(insight => (
          <div key={insight.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-slate-900">{insight.asset}</h2>
              <Badge variant={insight.signal === 'BUY' ? 'success' : insight.signal === 'SELL' ? 'destructive' : 'secondary'}>
                {insight.signal}
              </Badge>
            </div>
            <div className="mb-4">
              <p className="text-sm text-slate-500 mb-1">Confidence Score</p>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={\`h-full rounded-full \${insight.signal === 'BUY' ? 'bg-emerald-500' : insight.signal === 'SELL' ? 'bg-rose-500' : 'bg-slate-400'}\`} 
                  style={{ width: \`\${insight.confidence}%\` }} 
                />
              </div>
              <p className="text-xs text-slate-500 text-right mt-1">{insight.confidence}%</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Key Reasoning:</p>
              <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                {insight.reasoning.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
`;
fs.writeFileSync(path.join(srcDir, 'pages/investments/Insights.tsx'), insightsContent);

console.log('Investment pages generated.');
