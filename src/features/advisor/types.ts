export type MessageRole = 'user' | 'assistant';
export type MessageStatus = 'sending' | 'sent' | 'error';

export interface ResponseActionCard {
  title: string;
  description: string;
  actionLabel: string;
  actionPath: string;
}

export interface AdvisorMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  status?: MessageStatus;
  actionCard?: ResponseActionCard;
}

export interface SuggestedPromptItem {
  id: string;
  title: string;
  prompt: string;
  category: 'spending' | 'savings' | 'budget' | 'planning';
}

export interface SendMessagePayload {
  message: string;
}
