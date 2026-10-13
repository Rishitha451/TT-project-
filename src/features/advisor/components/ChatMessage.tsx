import React, { useState } from 'react';
import { Sparkles, User as UserIcon, Copy, Check, ThumbsUp, ThumbsDown, ShieldCheck } from 'lucide-react';
import type { AdvisorMessage } from '../types';
import { AIResponseCard } from './AIResponseCard';
import { useAuthStore } from '../../auth/store/auth.store';
import { toast } from '../../../stores/toast.store';

export interface ChatMessageProps {
  message: AdvisorMessage;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { user } = useAuthStore();
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'helpful' | 'unhelpful' | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type: 'helpful' | 'unhelpful') => {
    setFeedback(type);
    toast.info('Thank you for your feedback!');
  };

  return (
    <div
      className={`flex items-start space-x-3 my-4 animate-fade-in ${
        isUser ? 'flex-row-reverse space-x-reverse' : ''
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-xl font-bold text-xs shrink-0 ${
          isUser
            ? 'bg-slate-900 text-white shadow-xs'
            : 'bg-indigo-600 text-white shadow-xs'
        }`}
      >
        {isUser ? (
          user?.name ? (
            user.name.charAt(0).toUpperCase()
          ) : (
            <UserIcon className="w-4 h-4" />
          )
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
      </div>

      {/* Bubble Container */}
      <div className={`flex flex-col max-w-[88%] sm:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-semibold text-slate-400">
            <span className="text-slate-800 font-bold">AI Financial Advisor</span>
            <span>•</span>
            <span className="inline-flex items-center gap-0.5 text-indigo-600 font-medium">
              <ShieldCheck className="w-3 h-3" /> Ledger Synced
            </span>
          </div>
        )}

        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed transition-shadow ${
            isUser
              ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
              : 'bg-white border border-slate-200 text-slate-900 rounded-tl-xs shadow-xs'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>

          {/* Action Card inside Assistant Response */}
          {!isUser && message.actionCard && (
            <AIResponseCard card={message.actionCard} />
          )}
        </div>

        {/* Footer info & interactive message actions */}
        <div className="flex items-center gap-3 mt-1 px-1 text-[11px] text-slate-400 font-medium">
          <span>{message.timestamp}</span>

          {!isUser && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                className="p-1 hover:text-slate-700 rounded transition-colors cursor-pointer"
                title="Copy message"
                aria-label="Copy message"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>

              <button
                onClick={() => handleFeedback('helpful')}
                className={`p-1 hover:text-indigo-600 rounded transition-colors cursor-pointer ${
                  feedback === 'helpful' ? 'text-indigo-600 font-bold' : ''
                }`}
                title="Helpful insight"
                aria-label="Helpful"
              >
                <ThumbsUp className="w-3 h-3" />
              </button>

              <button
                onClick={() => handleFeedback('unhelpful')}
                className={`p-1 hover:text-rose-600 rounded transition-colors cursor-pointer ${
                  feedback === 'unhelpful' ? 'text-rose-600 font-bold' : ''
                }`}
                title="Not helpful"
                aria-label="Not helpful"
              >
                <ThumbsDown className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
