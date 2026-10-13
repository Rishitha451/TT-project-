import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSettings, updateProfileApi, updatePreferencesApi } from '../api/settings.api';
import type { UserProfile, UserPreferences } from '../../../types';
import { toast } from '../../../stores/toast.store';

export const SETTINGS_QUERY_KEY = ['settings', 'user'];

export const useSettings = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (profile: Partial<UserProfile>) => updateProfileApi(profile),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
      toast.success('Profile saved', `Changes saved for ${updated.name}.`);
    },
    onError: (err: any) => {
      toast.error('Failed to update profile', err.message || 'Please try again.');
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (prefs: Partial<UserPreferences>) => updatePreferencesApi(prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
      toast.success('Preferences updated', 'Your settings preferences have been saved.');
    },
    onError: (err: any) => {
      toast.error('Failed to save preferences', err.message || 'Please try again.');
    },
  });

  return {
    ...query,
    settings: query.data,
    profile: query.data?.profile,
    preferences: query.data?.preferences,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    updatePreferences: updatePreferencesMutation.mutateAsync,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
  };
};
