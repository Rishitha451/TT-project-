import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, PieChart, Target, Compass } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface SetupPromptModalProps {
  isOpen: boolean;
  onStartSetup: () => void;
  onSkip: () => void;
}

export const SetupPromptModal: React.FC<SetupPromptModalProps> = ({
  isOpen,
  onStartSetup,
  onSkip,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-center p-6 sm:p-8 space-y-6">
        {/* Glow Header Icon */}
        <div className="relative mx-auto h-20 w-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 blur-xl animate-pulse" />
          <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="h-8 w-8" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Let's set up your finances
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            Add your financial information so AI Finance Advisor can personalize your dashboard, analytics, goals, and financial guidance.
          </p>
        </div>

        {/* Highlight Feature Badges */}
        <div className="grid grid-cols-3 gap-2.5 pt-2">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center">
            <PieChart className="w-5 h-5 text-indigo-600 mb-1" />
            <span className="text-[11px] font-semibold text-slate-700">Real Baselines</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center">
            <Target className="w-5 h-5 text-emerald-600 mb-1" />
            <span className="text-[11px] font-semibold text-slate-700">Smart Goals</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center">
            <Compass className="w-5 h-5 text-indigo-600 mb-1" />
            <span className="text-[11px] font-semibold text-slate-700">AI Guidance</span>
          </div>
        </div>

        {/* Privacy reassurance */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Private, encrypted, and never asks for bank credentials</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={onStartSetup}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20"
          >
            Set Up My Finances <ArrowRight className="w-4 h-4" />
          </Button>

          <button
            type="button"
            onClick={onSkip}
            className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};
