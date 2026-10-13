import { apiClient } from '../../../lib/api-client';
import { API_ENDPOINTS } from '../../../lib/api-contracts';
import type { Goal } from '../../../types';

export const fetchGoals = async (): Promise<Goal[]> => {
  const response = await apiClient.get<Goal[]>(API_ENDPOINTS.GOALS.LIST);
  if (!response.success || !response.data) {
    throw response.error || { code: 'GOALS_FETCH_FAILED', message: 'Unable to load financial goals' };
  }
  return response.data;
};

export const createGoalApi = async (goal: Omit<Goal, 'id' | 'createdAt'>): Promise<Goal> => {
  const response = await apiClient.post<Goal>(API_ENDPOINTS.GOALS.CREATE, goal);
  if (!response.success || !response.data) {
    throw response.error || { code: 'GOAL_CREATE_FAILED', message: 'Unable to create goal' };
  }
  return response.data;
};

export const deleteGoalApi = async (id: string): Promise<{ id: string }> => {
  const response = await apiClient.delete<{ id: string }>(API_ENDPOINTS.GOALS.DELETE(id));
  if (!response.success || !response.data) {
    throw response.error || { code: 'GOAL_DELETE_FAILED', message: 'Unable to delete goal' };
  }
  return response.data;
};
