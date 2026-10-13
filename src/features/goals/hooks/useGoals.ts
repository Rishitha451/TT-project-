import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchGoals, createGoalApi, deleteGoalApi } from '../api/goals.api';
import type { Goal } from '../../../types';
import { toast } from '../../../stores/toast.store';

export const GOALS_QUERY_KEY = ['goals', 'list'];

export const useGoals = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: GOALS_QUERY_KEY,
    queryFn: fetchGoals,
    staleTime: 3 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (goal: Omit<Goal, 'id' | 'createdAt'>) => createGoalApi(goal),
    onSuccess: (newGoal) => {
      queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'data'] });
      toast.success('Goal created', `Target for "${newGoal.name}" set successfully.`);
    },
    onError: (err: any) => {
      toast.error('Failed to create goal', err.message || 'Please try again.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGoalApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'data'] });
      toast.success('Goal removed', 'The goal has been deleted.');
    },
    onError: (err: any) => {
      toast.error('Failed to delete goal', err.message || 'Please try again.');
    },
  });

  return {
    ...query,
    goals: query.data || [],
    createGoal: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteGoal: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
