/**
 * Frontend API Contracts and Endpoint Definitions.
 * 
 * These contracts map the frontend API abstraction layer to present mock endpoints
 * and FastAPI backend endpoints.
 */

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    SIGNUP: '/api/v1/auth/signup',
    REGISTER: '/api/v1/auth/register',
    LOGOUT: '/api/v1/auth/logout',
    ME: '/api/v1/auth/me',
  },
  DASHBOARD: {
    GET_DATA: '/api/v1/dashboard',
  },
  TRANSACTIONS: {
    LIST: '/api/v1/transactions',
    CREATE: '/api/v1/transactions',
    GET: (id: string) => `/api/v1/transactions/${id}`,
    DELETE: (id: string) => `/api/v1/transactions/${id}`,
  },
  GOALS: {
    LIST: '/api/v1/goals',
    CREATE: '/api/v1/goals',
    UPDATE: (id: string) => `/api/v1/goals/${id}`,
    DELETE: (id: string) => `/api/v1/goals/${id}`,
  },
  ANALYTICS: {
    SUMMARY: '/api/v1/analytics',
  },
  NOTIFICATIONS: {
    LIST: '/api/v1/notifications',
    MARK_READ: (id: string) => `/api/v1/notifications/${id}/read`,
    MARK_ALL_READ: '/api/v1/notifications/read-all',
    CLEAR_ALL: '/api/v1/notifications/clear-all',
  },
  REPORTS: {
    LIST: '/api/v1/reports',
    GENERATE: '/api/v1/reports/generate',
  },
  SETTINGS: {
    GET: '/api/v1/settings',
    UPDATE_PROFILE: '/api/v1/settings/profile',
    UPDATE_PREFERENCES: '/api/v1/settings/preferences',
  },
  INVESTMENTS: {
    SUMMARY: '/api/v1/investments/summary',
    POSITIONS: '/api/v1/investments/positions',
    PORTFOLIOS: '/api/v1/investments/portfolios',
    MARKET: '/api/v1/investments/market',
    INDICES: '/api/v1/investments/indices',
    NEWS: '/api/v1/investments/news',
    SENTIMENT: '/api/v1/investments/sentiment',
    RISK: '/api/v1/investments/risk',
    INSIGHTS: '/api/v1/investments/insights',
  },
  ADVISOR: {
    CHAT: '/api/v1/advisor/chat',
    HISTORY: '/api/v1/advisor/history',
  },
  FINANCIAL_PROFILE: {
    GET: '/api/v1/financial-profile',
    SAVE: '/api/v1/financial-profile',
    UPDATE: '/api/v1/financial-profile',
    STATUS: '/api/v1/financial-profile/status',
  },
} as const;

export type ApiEndpoint = string;
