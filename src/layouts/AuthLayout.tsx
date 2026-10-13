import React from 'react';
import { Outlet } from 'react-router-dom';
import { Shield, Sparkles } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo & Name */}
        <div className="inline-flex items-center justify-center space-x-2.5 mb-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            AI Finance Advisor
          </span>
        </div>
        <p className="text-sm font-medium text-slate-500">
          Smart financial intelligence for your modern wealth
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200/80 sm:px-10">
          <Outlet />
        </div>

        <div className="mt-8 flex items-center justify-center text-xs text-slate-400 gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          <span>Encrypted Mock Authentication • MVP Foundation v0.1</span>
        </div>
      </div>
    </div>
  );
};
