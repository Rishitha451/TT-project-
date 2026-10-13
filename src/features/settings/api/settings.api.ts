import { apiClient } from '../../../lib/api-client';
import { API_ENDPOINTS } from '../../../lib/api-contracts';
import type { UserSettings, UserProfile, UserPreferences } from '../../../types';

export const fetchSettings = async (): Promise<UserSettings> => {
  const response = await apiClient.get<UserSettings>(API_ENDPOINTS.SETTINGS.GET);
  if (!response.success || !response.data) {
    throw response.error || { code: 'SETTINGS_FETCH_FAILED', message: 'Unable to load user settings' };
  }
  return response.data;
};

export const updateProfileApi = async (profile: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await apiClient.post<UserProfile>(API_ENDPOINTS.SETTINGS.UPDATE_PROFILE, profile);
  if (!response.success || !response.data) {
    throw response.error || { code: 'PROFILE_UPDATE_FAILED', message: 'Unable to update profile' };
  }
  return response.data;
};

export const updatePreferencesApi = async (preferences: Partial<UserPreferences>): Promise<UserPreferences> => {
  const response = await apiClient.post<UserPreferences>(API_ENDPOINTS.SETTINGS.UPDATE_PREFERENCES, preferences);
  if (!response.success || !response.data) {
    throw response.error || { code: 'PREFERENCES_UPDATE_FAILED', message: 'Unable to update preferences' };
  }
  return response.data;
};
