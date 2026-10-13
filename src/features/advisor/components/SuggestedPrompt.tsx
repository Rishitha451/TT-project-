import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { SuggestedPromptItem } from '../types';

export interface SuggestedPromptProps {
  item: SuggestedPromptItem;
  onSelect: (promptText: string) => void;
  disabled?: boolean;
}

export const SuggestedPrompt: React.FC<SuggestedPromptProps> = ({
  item,
  onSelect,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(item.prompt)}
      className="group flex items-center justify-between w-full rounded-xl border border-slate-200 bg-white p-3.5 text-left text-xs font-medium text-slate-700 transition-all hover:border-indigo-300 hover:bg-indigo-50/40 hover:text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
    >
      <span className="truncate pr-2 font-medium text-slate-800 group-hover:text-indigo-900">
        {item.prompt}
      </span>
      <ArrowUpRight className="h-4 w-4 text-slate-400 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-indigo-600" />
    </button>
  );
};
