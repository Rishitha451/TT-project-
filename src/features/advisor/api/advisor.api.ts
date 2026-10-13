import { apiClient } from '../../../lib/api-client';
import { API_ENDPOINTS } from '../../../lib/api-contracts';
import type { AdvisorMessage, SendMessagePayload } from '../types';

export const advisorApi = {
  sendMessage: async (messageText: string): Promise<AdvisorMessage> => {
    const payload: SendMessagePayload = { message: messageText };
    const response = await apiClient.post<AdvisorMessage>(API_ENDPOINTS.ADVISOR.CHAT, payload);

    if (!response.success || !response.data) {
      throw response.error || {
        code: 'ADVISOR_RESPONSE_FAILED',
        message: 'Unable to generate AI response. Please try again.',
      };
    }

    return response.data;
  },
};
