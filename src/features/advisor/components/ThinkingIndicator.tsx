import React from 'react';
import { Sparkles } from 'lucide-react';

export const ThinkingIndicator: React.FC = () => {
  return (
    <div className="flex items-start space-x-3 py-2 animate-fade-in">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shrink-0 shadow-xs">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="rounded-2xl rounded-tl-xs bg-slate-100 px-4 py-3 text-slate-700 max-w-sm sm:max-w-md border border-slate-200/60">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-slate-600">
            AI is analyzing your financial data
          </span>
          <div className="flex space-x-1 items-center">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse [animation-delay:0.2s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse [animation-delay:0.4s]" />
          </div>
        </div>
      </div>
    </div>
  );
};
