import { create } from 'zustand';
import type { User, LoginCredentials, SignupCredentials } from '../../../types';
import { authApi } from '../api/auth.api';
import { queryClient } from '../../../app/providers';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

const STORAGE_KEY = 'ai_finance_auth_session';

const getInitialState = () => {
  if (typeof window === 'undefined') {
    return { user: null, isAuthenticated: false };
  }
  const storedSession = sessionStorage.getItem(STORAGE_KEY);
  if (storedSession) {
    try {
      const parsed = JSON.parse(storedSession);
      if (parsed?.token) {
        return { user: parsed.user || null, isAuthenticated: true };
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }
  return { user: null, isAuthenticated: false };
};

const initialState = getInitialState();

export const useAuthStore = create<AuthState>((set) => ({
  user: initialState.user,
  isAuthenticated: initialState.isAuthenticated,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(credentials);
      const sessionData = { user: response.user, token: response.token };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
      // Clear previous cached queries to avoid cross-user pollution
      queryClient.clear();
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Login failed. Please try again.',
      });
      throw err;
    }
  },

  signup: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.signup(credentials);
      const sessionData = { user: response.user, token: response.token };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
      queryClient.clear();
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Signup failed. Please try again.',
      });
      throw err;
    }
  },

  logout: () => {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem('ai_finance_advisor_messages');
    queryClient.clear();
    authApi.logout().catch(() => {});
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  checkAuth: async () => {
    try {
      const user = await authApi.getCurrentUser();
      if (user) {
        set({ user, isAuthenticated: true });
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem('ai_finance_advisor_messages');
        queryClient.clear();
        set({ user: null, isAuthenticated: false });
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem('ai_finance_advisor_messages');
      queryClient.clear();
      set({ user: null, isAuthenticated: false });
    }
  },

  clearError: () => set({ error: null }),
}));

// Global listener for 401 Unauthorized responses
if (typeof window !== 'undefined') {
  window.addEventListener('auth:unauthorized', () => {
    useAuthStore.getState().logout();
  });
}
