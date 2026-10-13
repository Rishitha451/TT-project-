import React from 'react';
import { Wallet, Plus } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No financial data yet',
  message = 'Connect your financial accounts to start seeing insights.',
  actionText = 'Connect Account',
  onAction,
}) => {
  return (
    <Card className="flex flex-col items-center justify-center p-10 text-center border-dashed border-slate-300">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mb-4">
        <Wallet className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">{message}</p>
      {onAction && (
        <Button
          variant="primary"
          size="md"
          onClick={onAction}
          leftIcon={<Plus className="h-4 w-4" />}
          className="mt-6"
        >
          {actionText}
        </Button>
      )}
    </Card>
  );
};
