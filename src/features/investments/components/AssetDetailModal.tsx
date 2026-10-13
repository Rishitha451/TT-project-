import { Modal } from '../../../components/ui/Modal';
import { useAssetDetail } from '../hooks/useInvestments';
import { Skeleton } from '../../../components/ui/Skeleton';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';

interface AssetDetailModalProps {
  ticker: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AssetDetailModal({ ticker, isOpen, onClose }: AssetDetailModalProps) {
  const { data: asset, isLoading } = useAssetDetail(ticker);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ticker ? `${ticker} — Asset Intelligence` : 'Asset Details'}
      className="max-w-2xl"
    >
      {isLoading ? (
        <div className="space-y-4 py-2">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      ) : !asset ? (
        <div className="py-8 text-center text-slate-500 text-sm">
          No detailed metrics available for ticker {ticker}.
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in text-slate-800">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl font-bold text-slate-900">{asset.ticker}</span>
                <Badge variant="default">{asset.sector}</Badge>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">{asset.name}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">
                ${asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`text-xs font-semibold flex items-center justify-end gap-1 ${asset.dayChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {asset.dayChange >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>{asset.dayChange >= 0 ? '+' : ''}${asset.dayChange.toFixed(2)} ({asset.dayChangePct >= 0 ? '+' : ''}{asset.dayChangePct.toFixed(2)}%)</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            {asset.description}
          </div>

          {/* Key Fundamentals Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">52W Range</div>
              <div className="text-xs font-semibold font-mono text-slate-900 mt-1">
                ${asset.low52W} - ${asset.high52W}
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Market Cap</div>
              <div className="text-xs font-semibold font-mono text-slate-900 mt-1">
                {asset.marketCap}
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">P/E Ratio</div>
              <div className="text-xs font-semibold font-mono text-slate-900 mt-1">
                {asset.peRatio > 0 ? asset.peRatio.toFixed(1) : 'N/A'}
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Div Yield</div>
              <div className="text-xs font-semibold font-mono text-slate-900 mt-1">
                {asset.dividendYield.toFixed(2)}%
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Beta (1Y)</div>
              <div className="text-xs font-semibold font-mono text-slate-900 mt-1">
                {asset.beta.toFixed(2)}
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Volume</div>
              <div className="text-xs font-semibold font-mono text-slate-900 mt-1">
                {asset.volume}
              </div>
            </div>
          </div>

          {/* Historical Returns Trajectory */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-600" />
              Trailing Period Performance
            </h4>
            <div className="grid grid-cols-5 gap-2">
              {asset.historicalReturns.map((item) => (
                <div
                  key={item.period}
                  className={`p-2.5 rounded-lg border text-center ${
                    item.returnPct >= 0
                      ? 'border-emerald-100 bg-emerald-50/60 text-emerald-900'
                      : 'border-rose-100 bg-rose-50/60 text-rose-900'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold text-slate-500">{item.period}</div>
                  <div className="text-xs font-bold font-mono mt-0.5">
                    {item.returnPct >= 0 ? '+' : ''}{item.returnPct.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
