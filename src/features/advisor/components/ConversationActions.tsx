import React from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export interface ConversationActionsProps {
  onNewConversation: () => void;
  onClearConversation: () => void;
  hasMessages: boolean;
}

export const ConversationActions: React.FC<ConversationActionsProps> = ({
  onNewConversation,
  onClearConversation,
  hasMessages,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onNewConversation}
        leftIcon={<PlusCircle className="w-4 h-4 text-indigo-600" />}
      >
        New Chat
      </Button>

      {hasMessages && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearConversation}
          leftIcon={<Trash2 className="w-4 h-4 text-slate-400 hover:text-rose-600" />}
          className="text-slate-600 hover:text-rose-600"
        >
          Clear
        </Button>
      )}
    </div>
  );
};
