import React from 'react';
import { Shield } from 'lucide-react';
import { useAdvisor } from '../features/advisor/hooks/useAdvisor';
import { AdvisorHeader } from '../features/advisor/components/AdvisorHeader';
import { ChatWindow } from '../features/advisor/components/ChatWindow';
import { MessageInput } from '../features/advisor/components/MessageInput';
import { Card } from '../components/ui/Card';

export const Advisor: React.FC = () => {
  const {
    messages,
    isThinking,
    error,
    sendMessage,
    clearConversation,
    hasMessages,
  } = useAdvisor();

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-5xl mx-auto space-y-4 animate-fade-in">
      {/* Header Card */}
      <Card className="flex-1 flex flex-col justify-between p-4 sm:p-6 bg-white border border-slate-200 shadow-sm overflow-hidden">
        <AdvisorHeader
          onNewConversation={clearConversation}
          onClearConversation={clearConversation}
          hasMessages={hasMessages}
        />

        {/* Chat Trajectory View */}
        <ChatWindow
          messages={messages}
          isThinking={isThinking}
          error={error}
          onSendPrompt={sendMessage}
        />

        {/* Input Area & Financial Safety Disclaimer */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <MessageInput onSend={sendMessage} disabled={isThinking} />

          <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-400 font-medium pt-1">
            <Shield className="w-3 h-3 text-slate-400 shrink-0" />
            <span>
              AI-generated insights are for informational purposes only. Please review financial data before making decisions.
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
