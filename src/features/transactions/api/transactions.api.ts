import { apiClient } from '../../../lib/api-client';
import { API_ENDPOINTS } from '../../../lib/api-contracts';
import type { Transaction } from '../../../types';

export const fetchTransactions = async (): Promise<Transaction[]> => {
  const response = await apiClient.get<Transaction[] | { items: Transaction[] }>(API_ENDPOINTS.TRANSACTIONS.LIST);
  if (!response.success || !response.data) {
    throw response.error || { code: 'TRANSACTIONS_FETCH_FAILED', message: 'Unable to load transactions' };
  }
  const data = response.data;
  return Array.isArray(data) ? data : (data as any).items || [];
};

export const createTransactionApi = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
  const response = await apiClient.post<Transaction>(API_ENDPOINTS.TRANSACTIONS.CREATE, transaction);
  if (!response.success || !response.data) {
    throw response.error || { code: 'TRANSACTION_CREATE_FAILED', message: 'Unable to create transaction' };
  }
  return response.data;
};

export const deleteTransactionApi = async (id: string): Promise<{ id: string }> => {
  const response = await apiClient.delete<{ id: string }>(API_ENDPOINTS.TRANSACTIONS.DELETE(id));
  if (!response.success || !response.data) {
    throw response.error || { code: 'TRANSACTION_DELETE_FAILED', message: 'Unable to delete transaction' };
  }
  return response.data;
};
