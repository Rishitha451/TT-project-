import { create } from 'zustand';
import type { AdvisorMessage } from '../types';
import { advisorApi } from '../api/advisor.api';

interface AdvisorState {
  messages: AdvisorMessage[];
  isThinking: boolean;
  error: string | null;

  sendMessage: (content: string) => Promise<void>;
  clearConversation: () => void;
  clearError: () => void;
}

const STORAGE_KEY = 'ai_finance_advisor_messages';

const getInitialMessages = (): AdvisorMessage[] => {
  if (typeof window === 'undefined') return [];
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }
  return [];
};

export const useAdvisorStore = create<AdvisorState>((set, get) => ({
  messages: getInitialMessages(),
  isThinking: false,
  error: null,

  sendMessage: async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const userMessage: AdvisorMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    const currentMessages = get().messages;
    const updatedMessages = [...currentMessages, userMessage];

    // Optimistically add user message and set thinking status
    set({
      messages: updatedMessages,
      isThinking: true,
      error: null,
    });
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMessages));

    try {
      const assistantMessage = await advisorApi.sendMessage(trimmed);
      const finalMessages = [...get().messages, assistantMessage];

      set({
        messages: finalMessages,
        isThinking: false,
        error: null,
      });
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(finalMessages));
    } catch (err: any) {
      set({
        isThinking: false,
        error: err.message || 'Unable to generate a response right now. Please try again.',
      });
    }
  },

  clearConversation: () => {
    sessionStorage.removeItem(STORAGE_KEY);
    set({
      messages: [],
      isThinking: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
