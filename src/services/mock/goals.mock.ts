import type { Goal, ApiResponse, ApiError } from '../../types';

const INITIAL_GOALS: Goal[] = [
  {
    id: 'g_1',
    name: 'Emergency Fund',
    target: 100000,
    current: 45000,
    color: 'bg-emerald-500',
    category: 'Safety Net',
    targetDate: '2026-12-31',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'g_2',
    name: 'Europe Vacation 2027',
    target: 150000,
    current: 65000,
    color: 'bg-indigo-500',
    category: 'Travel',
    targetDate: '2027-06-30',
    createdAt: '2026-03-15T00:00:00Z',
  },
  {
    id: 'g_3',
    name: 'MacBook Pro & Tech Upgrade',
    target: 120000,
    current: 95000,
    color: 'bg-purple-500',
    category: 'Gadgets',
    targetDate: '2026-11-15',
    createdAt: '2026-04-10T00:00:00Z',
  },
  {
    id: 'g_4',
    name: 'Home Down Payment Reserve',
    target: 500000,
    current: 180000,
    color: 'bg-amber-500',
    category: 'Real Estate',
    targetDate: '2028-12-31',
    createdAt: '2025-06-01T00:00:00Z',
  },
];

const MOCK_LATENCY = 600;
let memoryGoals: Goal[] = [...INITIAL_GOALS];

export const mockGoalsService = {
  async getGoals(): Promise<ApiResponse<Goal[]>> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY));
    return {
      success: true,
      data: [...memoryGoals],
      timestamp: new Date().toISOString(),
    };
  },

  async createGoal(goal: Omit<Goal, 'id' | 'createdAt'>): Promise<ApiResponse<Goal>> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY));
    const newGoal: Goal = {
      ...goal,
      id: `g_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    memoryGoals = [...memoryGoals, newGoal];
    return {
      success: true,
      data: newGoal,
      timestamp: new Date().toISOString(),
    };
  },

  async updateGoal(id: string, updates: Partial<Goal>): Promise<ApiResponse<Goal>> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY));
    const index = memoryGoals.findIndex((g) => g.id === id);
    if (index === -1) {
      const error: ApiError = {
        code: 'NOT_FOUND',
        message: 'Goal not found',
      };
      throw error;
    }
    const updated = { ...memoryGoals[index], ...updates };
    memoryGoals[index] = updated;
    return {
      success: true,
      data: updated,
      timestamp: new Date().toISOString(),
    };
  },

  async deleteGoal(id: string): Promise<ApiResponse<{ id: string }>> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY));
    memoryGoals = memoryGoals.filter((g) => g.id !== id);
    return {
      success: true,
      data: { id },
      timestamp: new Date().toISOString(),
    };
  },
};