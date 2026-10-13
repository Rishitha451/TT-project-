import { useState, useMemo } from 'react';
import { useMarketNews, useMarketSentiment, useMarketIndices } from '../../features/investments/hooks/useInvestments';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { Globe, TrendingUp, TrendingDown, Activity, Brain, Search } from 'lucide-react';
import { SentimentGauge } from '../../features/investments/components/SentimentGauge';


export default function Market() {
  const { data: news, isLoading: isNewsLoading, isError: isNewsError, refetch: refetchNews } = useMarketNews();
  const { data: sentiment, isLoading: isSentimentLoading, isError: isSentimentError, refetch: refetchSentiment } = useMarketSentiment();
  const { data: indices, isLoading: isIndicesLoading } = useMarketIndices();

  const [newsCategory, setNewsCategory] = useState<string>('All');
  const [newsSearch, setNewsSearch] = useState('');

  const filteredNews = useMemo(() => {
    if (!news) return [];
    return news.filter((item) => {
      if (newsCategory !== 'All' && item.category !== newsCategory) return false;
      if (newsSearch && !item.headline.toLowerCase().includes(newsSearch.toLowerCase()) && !item.ticker?.toLowerCase().includes(newsSearch.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [news, newsCategory, newsSearch]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Market Intelligence</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Macro indices, market sentiment velocity, and curated financial news streams.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time Stream Connected</span>
        </div>
      </div>

      {/* Major Market Indices Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {isIndicesLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))
        ) : indices ? (
          indices.map((idx) => {
            const isPositive = idx.change >= 0;
            return (
              <div key={idx.symbol} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>{idx.symbol}</span>
                  <span className={`flex items-center font-mono ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isPositive ? '+' : ''}{Number(idx.changePct).toFixed(2)}%
                  </span>
                </div>
                <div className="text-base font-bold text-slate-900 font-mono mt-1">
                  {Number(idx.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{idx.name}</div>
              </div>
            );
          })
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment & Trends Column */}
        <div className="space-y-6 lg:col-span-1">
          {/* Sentiment Gauge */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 flex flex-col items-center">
            <div className="flex items-center gap-2 self-start w-full mb-6">
              <Brain className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold text-slate-900">Market Sentiment Index</h2>
            </div>

            {isSentimentLoading ? (
              <Skeleton className="w-48 h-48 rounded-full" />
            ) : isSentimentError ? (
              <ErrorState message="Failed to load sentiment" onRetry={refetchSentiment} />
            ) : !sentiment ? (
              <div className="p-4 text-slate-500 text-sm">No sentiment data available.</div>
            ) : (
              <div className="flex flex-col items-center w-full">
                <SentimentGauge score={sentiment.score} label={sentiment.label} />
                <div className="mt-6 w-full pt-4 border-t border-slate-100 flex justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Volatility Index (VIX)</p>
                    <p className="font-semibold font-mono text-slate-900">{Number(sentiment.volatilityIndex).toFixed(1)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-1">Trend Signal</p>
                    <div className="flex items-center gap-1 justify-end">
                      {sentiment.historicalScores[sentiment.historicalScores.length - 1] >= sentiment.historicalScores[sentiment.historicalScores.length - 2] ? (
                        <>
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                          <span className="font-semibold text-emerald-600">Bullish</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-4 h-4 text-rose-500" />
                          <span className="font-semibold text-rose-600">Bearish</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sentiment Sparkline */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                <h2 className="font-semibold text-slate-900">10-Day Sentiment Trend</h2>
              </div>
              {sentiment && (
                <span className={`font-mono font-bold text-sm ${
                  sentiment.historicalScores[sentiment.historicalScores.length - 1] >= sentiment.historicalScores[sentiment.historicalScores.length - 2] 
                    ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {Number(sentiment.score).toFixed(1)}/100
                </span>
              )}
            </div>

            {isSentimentLoading ? (
              <Skeleton className="w-full h-24" />
            ) : isSentimentError || !sentiment ? (
              <div className="p-4 text-slate-500 text-center text-sm">Trend data unavailable</div>
            ) : (
              <Sparkline data={sentiment.historicalScores} />
            )}
          </div>
        </div>

        {/* News Feed Column */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                <h2 className="font-semibold text-slate-900">Verified Market News Feed</h2>
              </div>

              {/* News Search */}
              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter news..."
                  value={newsSearch}
                  onChange={(e) => setNewsSearch(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            {/* News Category Filters */}
            <div className="flex gap-2 pb-4 border-b border-slate-100 overflow-x-auto mb-4">
              {['All', 'Macro', 'Tech', 'Equities'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setNewsCategory(cat)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    newsCategory === cat ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {isNewsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="w-full h-20 rounded-xl" />)}
              </div>
            ) : isNewsError ? (
              <ErrorState message="Failed to load market news." onRetry={refetchNews} />
            ) : filteredNews.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-sm py-12">
                No recent news updates matching your search.
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto pr-1 flex-1 max-h-[500px]">
                {filteredNews.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100 transition-colors">
                    <div className="flex items-start justify-between gap-4 mb-1.5">
                      <div className="flex items-center gap-2 shrink-0">
                        {item.ticker && (
                          <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {item.ticker}
                          </span>
                        )}
                        {item.change !== undefined && (
                          <span className={`font-mono text-xs font-semibold flex items-center ${Number(item.change) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {Number(item.change) >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                            {Number(item.change) >= 0 ? '+' : ''}{Number(item.change).toFixed(2)}%
                          </span>
                        )}
                        {item.category && (
                          <span className="text-[10px] text-slate-400 font-semibold">{item.category}</span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 shrink-0">{item.time}</span>
                    </div>

                    <p className="text-sm text-slate-800 font-medium leading-relaxed mb-2">
                      {item.headline}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/50">
                      <span className="text-xs text-slate-500 font-medium">{item.source}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        item.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-800' : 
                        item.sentiment === 'negative' ? 'bg-rose-100 text-rose-800' : 
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {item.sentiment}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  if (!data || data.length === 0) return null;
  const width = 300;
  const height = 80;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;
  
  const lastVal = data[data.length - 1];
  const prevVal = data[data.length - 2] || lastVal;
  const isBullish = lastVal >= prevVal;

  const colorStr = isBullish ? '16, 185, 129' : '244, 63, 94';

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full min-h-[80px]" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={`rgba(${colorStr}, 0.2)`} />
          <stop offset="100%" stopColor={`rgba(${colorStr}, 0)`} />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#sparkGrad)" />
      <polyline
        points={points}
        fill="none"
        stroke={`rgb(${colorStr})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
