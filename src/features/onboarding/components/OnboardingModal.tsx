import React from 'react';
import { X } from 'lucide-react';
import { FinancialOnboardingFlow } from './FinancialOnboardingFlow';
import type { FinancialProfileInput } from '../../../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: FinancialProfileInput) => Promise<void>;
  isSaving?: boolean;
  initialValues?: Partial<FinancialProfileInput>;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  isSaving = false,
  initialValues,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[95vh] flex flex-col">
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 p-2 bg-white text-slate-500 hover:text-slate-900 rounded-full shadow-md border border-slate-200 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
        <FinancialOnboardingFlow
          initialValues={initialValues}
          onComplete={async (data) => {
            await onComplete(data);
            onClose();
          }}
          onSkip={onClose}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
};
