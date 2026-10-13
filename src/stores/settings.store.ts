import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  profile: { name: string; email: string };
  preferences: { currency: string; dateFormat: string; theme: string };
  updateProfile: (profile: Partial<SettingsState['profile']>) => void;
  updatePreferences: (prefs: Partial<SettingsState['preferences']>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      profile: { name: 'Alex Morgan', email: 'alex@example.com' },
      preferences: { currency: 'INR', dateFormat: 'DD/MM/YYYY', theme: 'light' },
      updateProfile: (newProfile) => set((state) => ({ profile: { ...state.profile, ...newProfile } })),
      updatePreferences: (newPrefs) => set((state) => ({ preferences: { ...state.preferences, ...newPrefs } })),
    }),
    { name: 'ai-finance-settings' }
  )
);