/**
 * Financial Profile API client functions.
 */

import { apiClient } from '../../../lib/api-client';
import { API_ENDPOINTS } from '../../../lib/api-contracts';
import type { FinancialProfile, FinancialProfileInput, FinancialProfileStatus } from '../../../types';

export const financialProfileApi = {
  getProfile: async (): Promise<FinancialProfile | null> => {
    const res = await apiClient.get<FinancialProfile | null>(API_ENDPOINTS.FINANCIAL_PROFILE.GET);
    return res.data ?? null;
  },

  getStatus: async (): Promise<FinancialProfileStatus> => {
    const res = await apiClient.get<FinancialProfileStatus>(API_ENDPOINTS.FINANCIAL_PROFILE.STATUS);
    return res.data || { onboardingCompleted: false, hasProfile: false };
  },

  saveProfile: async (payload: FinancialProfileInput): Promise<FinancialProfile> => {
    const res = await apiClient.post<FinancialProfile>(API_ENDPOINTS.FINANCIAL_PROFILE.SAVE, payload);
    if (!res.data) throw new Error('Failed to save financial profile');
    return res.data;
  },

  updateProfile: async (payload: Partial<FinancialProfileInput>): Promise<FinancialProfile> => {
    const res = await apiClient.patch<FinancialProfile>(API_ENDPOINTS.FINANCIAL_PROFILE.UPDATE, payload);
    if (!res.data) throw new Error('Failed to update financial profile');
    return res.data;
  },
};
