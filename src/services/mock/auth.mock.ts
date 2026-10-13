import type {
  User,
  LoginCredentials,
  SignupCredentials,
  AuthResponse,
  ApiResponse,
  ApiError,
} from '../../types';

const MOCK_USER: User = {
  id: 'user_001',
  name: 'Alex Morgan',
  email: 'alex@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const createApiError = (code: string, message: string): ApiError => ({
  code,
  message,
});

export const createApiResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  timestamp: new Date().toISOString(),
});

export const mockAuthService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    await delay(800);

    if (credentials.email.toLowerCase() === 'error@example.com') {
      throw createApiError(
        'AUTH_INVALID_CREDENTIALS',
        'Invalid email or password. Please check your credentials and try again.'
      );
    }

    return createApiResponse({
      user: {
        ...MOCK_USER,
        email: credentials.email || MOCK_USER.email,
      },
      token: 'mock_jwt_token_alex_morgan_123',
    });
  },

  async signup(credentials: SignupCredentials): Promise<ApiResponse<AuthResponse>> {
    await delay(800);

    if (credentials.email.toLowerCase() === 'exists@example.com') {
      throw createApiError(
        'AUTH_USER_EXISTS',
        'An account with this email address already exists.'
      );
    }

    return createApiResponse({
      user: {
        id: `user_${Date.now()}`,
        name: credentials.name,
        email: credentials.email,
      },
      token: `mock_jwt_token_${Date.now()}`,
    });
  },

  async logout(): Promise<ApiResponse<{ message: string }>> {
    await delay(200);
    return createApiResponse({ message: 'Successfully logged out.' });
  },

  async getCurrentUser(): Promise<ApiResponse<User | null>> {
    await delay(300);
    return createApiResponse(MOCK_USER);
  },
};
