import React from 'react';
import { LoginForm } from '../features/auth/components/LoginForm';

export const Login: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Welcome back
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Access your personal financial intelligence
        </p>
      </div>
      <LoginForm />
    </div>
  );
};
