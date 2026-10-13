/**
 * TanStack Query hooks for Financial Profile and Onboarding state.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { financialProfileApi } from '../api/financial-profile.api';
import type { FinancialProfile, FinancialProfileInput, FinancialProfileStatus } from '../../../types';
import { toast } from '../../../stores/toast.store';
import { useAuthStore } from '../../auth/store/auth.store';

export const useFinancialProfile = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const profileQuery = useQuery<FinancialProfile | null>({
    queryKey: ['financial-profile'],
    queryFn: financialProfileApi.getProfile,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const statusQuery = useQuery<FinancialProfileStatus>({
    queryKey: ['financial-profile-status'],
    queryFn: financialProfileApi.getStatus,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: FinancialProfileInput) => financialProfileApi.saveProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(['financial-profile'], data);
      queryClient.setQueryData(['financial-profile-status'], { onboardingCompleted: true, hasProfile: true });
      // Invalidate relevant caches so dashboard, analytics, and goals reflect new numbers immediately
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['advisor'] });
      toast.success('Financial profile saved', 'Your dashboard and metrics have been personalized.');
    },
    onError: (err: any) => {
      toast.error('Failed to save financial profile', err?.message || 'Please check your inputs and try again.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<FinancialProfileInput>) => financialProfileApi.updateProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(['financial-profile'], data);
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Financial profile updated', 'Changes have been saved successfully.');
    },
    onError: (err: any) => {
      toast.error('Failed to update financial profile', err?.message || 'Please try again.');
    },
  });

  return {
    profile: profileQuery.data ?? null,
    status: statusQuery.data ?? { onboardingCompleted: false, hasProfile: false },
    isLoading: profileQuery.isLoading || statusQuery.isLoading,
    isError: profileQuery.isError || statusQuery.isError,
    error: profileQuery.error || statusQuery.error,
    refetch: () => {
      profileQuery.refetch();
      statusQuery.refetch();
    },
    saveProfile: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};
