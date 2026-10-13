import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { AppLayout } from '../layouts/AppLayout';
import { Login } from '../pages/Login';
import { Signup } from '../pages/Signup';
import { Dashboard } from '../pages/Dashboard';
import InvestmentsOverview from '../pages/investments/InvestmentsOverview';
import Portfolio from '../pages/investments/Portfolio';
import Market from '../pages/investments/Market';
import Risk from '../pages/investments/Risk';
import Insights from '../pages/investments/Insights';

import { Advisor } from '../pages/Advisor';
import Transactions from '../pages/Transactions';
import Analytics from '../pages/Analytics';
import Goals from '../pages/Goals';
import Reports from '../pages/Reports';
import Notifications from '../pages/Notifications';
import Settings from '../pages/Settings';
import ForgotPassword from '../pages/ForgotPassword';

import { useAuthStore } from '../features/auth/store/auth.store';

/**
 * Guard for protected dashboard routes.
 * Redirects unauthenticated users to /login.
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

/**
 * Guard for public authentication routes.
 * Redirects authenticated users to /app/dashboard.
 */
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/app/dashboard" replace />,
  },
  {
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/signup',
        element: <Signup />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPassword />,
      },
    ],
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'investments',
        element: <InvestmentsOverview />,
      },
      {
        path: 'investments/portfolio',
        element: <Portfolio />,
      },
      {
        path: 'investments/market',
        element: <Market />,
      },
      {
        path: 'investments/risk',
        element: <Risk />,
      },
      {
        path: 'investments/insights',
        element: <Insights />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'advisor',
        element: <Advisor />,
      },
      {
        path: 'transactions',
        element: <Transactions />,
      },
      {
        path: 'analytics',
        element: <Analytics />,
      },
      {
        path: 'goals',
        element: <Goals />,
      },
      {
        path: 'reports',
        element: <Reports />,
      },
      {
        path: 'notifications',
        element: <Notifications />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/app/dashboard" replace />,
  },
]);
