import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToastStore, type ToastMessage } from '../../stores/toast.store';
import { cn } from '../../lib/utils';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: ToastMessage;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-600 shrink-0" />,
  };

  const borderStyles = {
    success: 'border-emerald-200 bg-emerald-50/90 text-emerald-950',
    error: 'border-rose-200 bg-rose-50/90 text-rose-950',
    warning: 'border-amber-200 bg-amber-50/90 text-amber-950',
    info: 'border-indigo-200 bg-indigo-50/90 text-indigo-950',
  };

  const type = toast.type || 'info';

  return (
    <div
      role="alert"
      className={cn(
        'pointer-events-auto flex items-start justify-between p-4 rounded-xl border shadow-lg backdrop-blur-xs transition-all animate-fade-in',
        borderStyles[type]
      )}
    >
      <div className="flex items-start gap-3">
        {icons[type]}
        <div>
          <h4 className="text-sm font-semibold">{toast.title}</h4>
          {toast.description && (
            <p className="text-xs opacity-90 mt-0.5">{toast.description}</p>
          )}
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
