import React from 'react';
import { Sparkles, Info, ArrowRight } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import type { AIInsight } from '../../../types';

export interface AIInsightCardProps {
  insights: AIInsight[];
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({ insights }) => {
  const primaryInsight = insights[0] || {
    id: 'default',
    title: 'Your spending insight',
    description: 'Your shopping expenses are slightly higher than your recent average.',
    type: 'info',
  };

  return (
    <Card className="relative overflow-hidden border-indigo-100 bg-gradient-to-br from-indigo-50/60 via-white to-slate-50 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-slate-900">AI Assistant</span>
        </div>
        <Badge variant="info" size="sm">
          Automated Insight
        </Badge>
      </div>

      <div className="mt-4 space-y-2">
        <h4 className="text-base font-semibold text-slate-900 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-indigo-600" />
          {primaryInsight.title}
        </h4>
        <p className="text-sm text-slate-600 leading-relaxed">
          {primaryInsight.description}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between pt-4 border-t border-indigo-100/60">
        <span className="text-xs text-slate-500 font-medium">Updated just now</span>
        <button
          type="button"
          className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
        >
          View Recommendations <ArrowRight className="w-3 h-3 ml-1" />
        </button>
      </div>
    </Card>
  );
};
