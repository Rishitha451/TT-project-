import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to load your dashboard',
  message = 'Something went wrong while loading your financial data.',
  onRetry,
  isRetrying = false,
}) => {
  return (
    <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed border-rose-200 bg-rose-50/30">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600 max-w-md">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="md"
          onClick={onRetry}
          isLoading={isRetrying}
          leftIcon={<RefreshCw className="h-4 w-4" />}
          className="mt-6 border-rose-200 text-rose-700 hover:bg-rose-50 focus:ring-rose-500"
        >
          Try Again
        </Button>
      )}
    </Card>
  );
};
