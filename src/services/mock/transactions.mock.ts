import type { Transaction, ApiResponse, ApiError } from '../../types';

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_1',
    title: 'Salary Deposit - TechCorp',
    category: 'Income',
    amount: 85000,
    type: 'credit',
    date: '2026-09-24T09:00:00Z',
    status: 'completed',
    accountName: 'HDFC Priority Checking',
  },
  {
    id: 'tx_2',
    title: 'Monthly Rent Payment',
    category: 'Housing',
    amount: 25000,
    type: 'debit',
    date: '2026-09-20T10:30:00Z',
    status: 'completed',
    accountName: 'HDFC Priority Checking',
  },
  {
    id: 'tx_3',
    title: 'SuperMart Groceries',
    category: 'Food',
    amount: 4200,
    type: 'debit',
    date: '2026-09-18T18:15:00Z',
    status: 'completed',
    accountName: 'ICICI Platinum Credit',
  },
  {
    id: 'tx_4',
    title: 'Amazon Online Order - Electronics',
    category: 'Shopping',
    amount: 4500,
    type: 'debit',
    date: '2026-09-15T14:20:00Z',
    status: 'completed',
    accountName: 'ICICI Platinum Credit',
  },
  {
    id: 'tx_5',
    title: 'Gourmet Dining Out',
    category: 'Food',
    amount: 3200,
    type: 'debit',
    date: '2026-09-14T21:00:00Z',
    status: 'completed',
    accountName: 'ICICI Platinum Credit',
  },
  {
    id: 'tx_6',
    title: 'Airtel Fiber Broadband Bill',
    category: 'Utilities',
    amount: 1500,
    type: 'debit',
    date: '2026-09-12T11:00:00Z',
    status: 'completed',
    accountName: 'HDFC Priority Checking',
  },
  {
    id: 'tx_7',
    title: 'Uber City Commute Rides',
    category: 'Transport',
    amount: 1200,
    type: 'debit',
    date: '2026-09-10T08:45:00Z',
    status: 'completed',
    accountName: 'Paytm UPI',
  },
  {
    id: 'tx_8',
    title: 'Cinema & Concessions',
    category: 'Entertainment',
    amount: 1200,
    type: 'debit',
    date: '2026-09-08T19:30:00Z',
    status: 'completed',
    accountName: 'Paytm UPI',
  },
  {
    id: 'tx_9',
    title: 'Gym & Fitness Subscription',
    category: 'Health',
    amount: 2500,
    type: 'debit',
    date: '2026-09-05T07:15:00Z',
    status: 'completed',
    accountName: 'HDFC Priority Checking',
  },
  {
    id: 'tx_10',
    title: 'Freelance Advisory Payout',
    category: 'Income',
    amount: 15000,
    type: 'credit',
    date: '2026-09-02T16:00:00Z',
    status: 'completed',
    accountName: 'HDFC Priority Checking',
  },
];

const MOCK_LATENCY = 600;
let memoryTransactions: Transaction[] = [...INITIAL_TRANSACTIONS];

export const mockTransactionsService = {
  async getTransactions(): Promise<ApiResponse<Transaction[]>> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY));
    return {
      success: true,
      data: [...memoryTransactions],
      timestamp: new Date().toISOString(),
    };
  },

  async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<ApiResponse<Transaction>> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY));
    const newTx: Transaction = {
      ...transaction,
      id: `tx_${Date.now()}`,
    };
    memoryTransactions = [newTx, ...memoryTransactions];
    return {
      success: true,
      data: newTx,
      timestamp: new Date().toISOString(),
    };
  },

  async deleteTransaction(id: string): Promise<ApiResponse<{ id: string }>> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY));
    const exists = memoryTransactions.some((t) => t.id === id);
    if (!exists) {
      const error: ApiError = {
        code: 'NOT_FOUND',
        message: 'Transaction not found',
      };
      throw error;
    }
    memoryTransactions = memoryTransactions.filter((t) => t.id !== id);
    return {
      success: true,
      data: { id },
      timestamp: new Date().toISOString(),
    };
  },
};