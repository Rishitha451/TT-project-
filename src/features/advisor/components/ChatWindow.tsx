import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import type { AdvisorMessage, SuggestedPromptItem } from '../types';
import { ChatMessage } from './ChatMessage';
import { ThinkingIndicator } from './ThinkingIndicator';
import { SuggestedPrompt } from './SuggestedPrompt';
import { Button } from '../../../components/ui/Button';


export interface ChatWindowProps {
  messages: AdvisorMessage[];
  isThinking: boolean;
  error: string | null;
  onSendPrompt: (promptText: string) => void;
  onRetry?: () => void;
}

const ALL_SUGGESTED_PROMPTS: (SuggestedPromptItem & { icon?: React.ReactNode })[] = [
  {
    id: 'sp_1',
    title: 'Spending Breakdown',
    prompt: 'Analyze my spending trends and top expenses this month',
    category: 'spending',
  },
  {
    id: 'sp_2',
    title: 'Investment Portfolio',
    prompt: 'What is my current portfolio return and asset allocation breakdown?',
    category: 'planning',
  },
  {
    id: 'sp_3',
    title: 'Portfolio Risk & Beta',
    prompt: 'Assess my portfolio risk level and volatility metrics',
    category: 'budget',
  },
  {
    id: 'sp_4',
    title: 'Savings Milestones',
    prompt: 'How much can I save this month toward my emergency fund?',
    category: 'savings',
  },
  {
    id: 'sp_5',
    title: '50/30/20 Budgeting',
    prompt: 'Help me optimize my budget using the 50/30/20 rule',
    category: 'budget',
  },
  {
    id: 'sp_6',
    title: 'Expense Audit',
    prompt: 'What are my biggest expenses and where can I cut costs?',
    category: 'spending',
  },
];

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isThinking,
  error,
  onSendPrompt,
  onRetry,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, error]);

  const isEmpty = messages.length === 0;

  const filteredPrompts = ALL_SUGGESTED_PROMPTS.filter((p) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'spending') return p.category === 'spending';
    if (activeCategory === 'savings') return p.category === 'savings';
    if (activeCategory === 'budget') return p.category === 'budget';
    if (activeCategory === 'investments') return p.category === 'planning';
    return true;
  });

  return (
    <div
      aria-live="polite"
      className="flex-1 overflow-y-auto pr-1 space-y-4 min-h-[400px] max-h-[calc(100vh-280px)]"
    >
      {isEmpty ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-6 animate-fade-in my-auto">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <Sparkles className="h-7 w-7" />
          </div>

          <div className="space-y-1.5 max-w-lg">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              AI Financial Intelligence Advisor
            </h3>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              Autonomous Financial Analysis & Portfolio Copilot
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              Ask about your monthly expenses, portfolio allocation, risk scores, or savings goals. Responses are cross-referenced with your synced financial accounts.
            </p>
          </div>

          {/* Prompt Domain Category Filters */}
          <div className="flex flex-wrap gap-1.5 justify-center max-w-lg">
            {[
              { id: 'all', label: 'All Topics' },
              { id: 'spending', label: 'Spending & Outflows' },
              { id: 'investments', label: 'Investments & Returns' },
              { id: 'savings', label: 'Savings Goals' },
              { id: 'budget', label: 'Budget Optimization' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Suggested Questions Grid */}
          <div className="w-full max-w-xl space-y-2 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredPrompts.map((item) => (
                <SuggestedPrompt
                  key={item.id}
                  item={item}
                  onSelect={onSendPrompt}
                  disabled={isThinking}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Message Stream */
        <div className="space-y-4 py-2">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isThinking && <ThinkingIndicator />}

          {error && (
            <div className="flex items-center justify-between rounded-xl bg-rose-50 p-4 border border-rose-200 text-xs text-rose-700 animate-fade-in">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
              {onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  leftIcon={<RefreshCw className="w-3 h-3 text-rose-600" />}
                  className="border-rose-300 text-rose-700 hover:bg-rose-100"
                >
                  Retry
                </Button>
              )}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
};
