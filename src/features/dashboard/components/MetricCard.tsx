import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { formatCurrency } from '../../../lib/utils';

export interface MetricCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  changePercentage?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  amount,
  icon,
  changePercentage,
  changeType = 'positive',
  subtitle,
}) => {
  return (
    <Card hoverable className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>
      </div>

      <div className="mt-3">
        <p className="text-2xl font-bold tracking-tight text-slate-900">
          {formatCurrency(amount)}
        </p>
      </div>

      <div className="mt-3 flex items-center text-xs">
        {changePercentage !== undefined && (
          <span
            className={`inline-flex items-center font-medium mr-2 px-1.5 py-0.5 rounded ${
              changeType === 'positive'
                ? 'bg-emerald-50 text-emerald-700'
                : changeType === 'negative'
                ? 'bg-rose-50 text-rose-700'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {changeType === 'positive' && <TrendingUp className="w-3 h-3 mr-1" />}
            {changeType === 'negative' && <TrendingDown className="w-3 h-3 mr-1" />}
            {changeType === 'neutral' && <Minus className="w-3 h-3 mr-1" />}
            {changePercentage > 0 ? `+${changePercentage}%` : `${changePercentage}%`}
          </span>
        )}
        <span className="text-slate-500">{subtitle || 'vs last month'}</span>
      </div>
    </Card>
  );
};
