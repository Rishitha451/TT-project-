import React from 'react';
import { ArrowRight, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ResponseActionCard } from '../types';

export interface AIResponseCardProps {
  card: ResponseActionCard;
}

export const AIResponseCard: React.FC<AIResponseCardProps> = ({ card }) => {
  const navigate = useNavigate();

  return (
    <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 transition-all hover:border-indigo-200">
      <div className="flex items-start space-x-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shrink-0">
          <BarChart2 className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-900">
            {card.title}
          </h4>
          <p className="mt-1 text-xs text-slate-700 leading-relaxed">
            {card.description}
          </p>
          <button
            type="button"
            onClick={() => navigate(card.actionPath)}
            className="mt-3 inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer group"
          >
            <span>{card.actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
