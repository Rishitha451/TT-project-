import type { UserSettings, UserProfile, UserPreferences, ApiResponse } from '../../types';

let memorySettings: UserSettings = {
  profile: {
    id: 'usr_alex',
    name: 'Alex Morgan',
    email: 'alex@example.com',
    phone: '+91 98765 43210',
    bio: 'Software engineer building diversified wealth and tracking early financial independence.',
  },
  preferences: {
    currency: 'INR',
    theme: 'light',
    emailAlerts: true,
    pushNotifications: true,
    weeklyDigest: true,
    investmentAlerts: true,
  },
};

const MOCK_LATENCY = 500;

export const mockSettingsService = {
  async getSettings(): Promise<ApiResponse<UserSettings>> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY));
    return {
      success: true,
      data: { ...memorySettings },
      timestamp: new Date().toISOString(),
    };
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY));
    memorySettings.profile = {
      ...memorySettings.profile,
      ...profile,
    };
    return {
      success: true,
      data: memorySettings.profile,
      timestamp: new Date().toISOString(),
    };
  },

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY));
    memorySettings.preferences = {
      ...memorySettings.preferences,
      ...preferences,
    };
    return {
      success: true,
      data: memorySettings.preferences,
      timestamp: new Date().toISOString(),
    };
  },
};