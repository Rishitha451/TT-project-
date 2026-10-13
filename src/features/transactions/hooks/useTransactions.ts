import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTransactions, createTransactionApi, deleteTransactionApi } from '../api/transactions.api';
import type { Transaction } from '../../../types';
import { toast } from '../../../stores/toast.store';

export const TRANSACTIONS_QUERY_KEY = ['transactions', 'list'];

export const useTransactions = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: TRANSACTIONS_QUERY_KEY,
    queryFn: fetchTransactions,
    staleTime: 2 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (tx: Omit<Transaction, 'id'>) => createTransactionApi(tx),
    onSuccess: (newTx) => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'data'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'summary'] });
      toast.success('Transaction added', `${newTx.title} has been recorded.`);
    },
    onError: (err: any) => {
      toast.error('Failed to add transaction', err.message || 'Please try again.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTransactionApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'data'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'summary'] });
      toast.success('Transaction deleted', 'The record has been removed.');
    },
    onError: (err: any) => {
      toast.error('Failed to delete transaction', err.message || 'Please try again.');
    },
  });

  return {
    ...query,
    transactions: query.data || [],
    createTransaction: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteTransaction: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
