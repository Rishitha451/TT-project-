import { useAdvisorStore } from '../store/advisor.store';

export const useAdvisor = () => {
  const {
    messages,
    isThinking,
    error,
    sendMessage,
    clearConversation,
    clearError,
  } = useAdvisorStore();

  const handleSend = async (content: string) => {
    await sendMessage(content);
  };

  const handleNewConversation = () => {
    clearConversation();
  };

  return {
    messages,
    isThinking,
    error,
    sendMessage: handleSend,
    clearConversation: handleNewConversation,
    clearError,
    hasMessages: messages.length > 0,
  };
};
