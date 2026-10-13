import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { ConversationActions } from './ConversationActions';

export interface AdvisorHeaderProps {
  onNewConversation: () => void;
  onClearConversation: () => void;
  hasMessages: boolean;
}

export const AdvisorHeader: React.FC<AdvisorHeaderProps> = ({
  onNewConversation,
  onClearConversation,
  hasMessages,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
      <div className="flex items-center space-x-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            AI Finance Advisor
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200">
              <ShieldCheck className="w-3 h-3 text-indigo-600" />
              Verified Intelligence
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Your personal financial intelligence & expense decision assistant
          </p>
        </div>
      </div>

      <ConversationActions
        onNewConversation={onNewConversation}
        onClearConversation={onClearConversation}
        hasMessages={hasMessages}
      />
    </div>
  );
};
