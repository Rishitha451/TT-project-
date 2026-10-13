import React from 'react';
import { SignupForm } from '../features/auth/components/SignupForm';

export const Signup: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Create your account
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Start managing your finances with AI intelligence
        </p>
      </div>
      <SignupForm />
    </div>
  );
};
