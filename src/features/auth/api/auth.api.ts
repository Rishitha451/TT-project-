import { apiClient } from '../../../lib/api-client';
import { API_ENDPOINTS } from '../../../lib/api-contracts';
import type { LoginCredentials, SignupCredentials, AuthResponse, User } from '../../../types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<any>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    if (!response.success || !response.data) {
      throw response.error || { code: 'AUTH_FAILED', message: 'Authentication failed' };
    }
    const token = response.data.access_token || response.data.token;
    const user = response.data.user || response.data;
    return { user, token };
  },

  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    // Attempt registration
    const regResponse = await apiClient.post<any>(API_ENDPOINTS.AUTH.SIGNUP, credentials);
    if (!regResponse.success) {
      throw regResponse.error || { code: 'SIGNUP_FAILED', message: 'Registration failed' };
    }
    
    // Automatically log in to get access token if not returned directly
    if (credentials.password) {
      return authApi.login({ email: credentials.email, password: credentials.password });
    }

    const token = regResponse.data?.access_token || regResponse.data?.token || '';
    const user = regResponse.data?.user || regResponse.data;
    return { user, token };
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // Ignore network errors during logout
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
    return response.data || null;
  },
};
