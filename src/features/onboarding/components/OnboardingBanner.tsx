import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface OnboardingBannerProps {
  onStartSetup: () => void;
}

export const OnboardingBanner: React.FC<OnboardingBannerProps> = ({ onStartSetup }) => {
  return (
    <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-4 sm:p-5 rounded-2xl shadow-sm border border-indigo-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
      <div className="flex items-start sm:items-center space-x-3.5">
        <div className="h-10 w-10 rounded-xl bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center shrink-0 text-indigo-300">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            Complete Your Financial Profile
            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">
              Setup Pending
            </span>
          </h3>
          <p className="text-xs text-indigo-200 mt-0.5 leading-relaxed">
            Enter your monthly cashflows, assets, and liabilities to unlock customized intelligence and goal forecasts.
          </p>
        </div>
      </div>

      <Button
        type="button"
        size="sm"
        onClick={onStartSetup}
        className="bg-white text-indigo-950 hover:bg-indigo-50 font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer"
      >
        Set Up Finances <ArrowRight className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
};
