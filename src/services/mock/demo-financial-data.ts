export const DEMO_DATA = {
  user: {
    name: 'Alex Morgan',
    email: 'alex@example.com',
  },
  summary: {
    monthlyIncome: 85000,
    monthlyExpenses: 56200,
    savings: 28800,
    netWorth: 485000,
  },
  transactions: [
    { id: 't1', date: 'Sep 24, 2026', desc: 'Groceries at SuperMart', category: 'Food', amount: -2450, type: 'expense', status: 'completed' },
    { id: 't2', date: 'Sep 23, 2026', desc: 'TechCorp Salary', category: 'Income', amount: 85000, type: 'income', status: 'completed' },
    { id: 't3', date: 'Sep 22, 2026', desc: 'Internet Bill', category: 'Utilities', amount: -1500, type: 'expense', status: 'completed' },
    { id: 't4', date: 'Sep 20, 2026', desc: 'Dining Out', category: 'Food', amount: -3200, type: 'expense', status: 'completed' },
    { id: 't5', date: 'Sep 18, 2026', desc: 'Rent', category: 'Housing', amount: -25000, type: 'expense', status: 'completed' },
    { id: 't6', date: 'Sep 15, 2026', desc: 'Amazon Purchase', category: 'Shopping', amount: -4500, type: 'expense', status: 'completed' },
    { id: 't7', date: 'Sep 12, 2026', desc: 'Uber', category: 'Transport', amount: -800, type: 'expense', status: 'completed' },
    { id: 't8', date: 'Sep 10, 2026', desc: 'Movie Tickets', category: 'Entertainment', amount: -1200, type: 'expense', status: 'completed' },
  ],
  goals: [
    { id: 'g1', name: 'Emergency Fund', target: 100000, current: 45000, color: 'bg-emerald-500' },
    { id: 'g2', name: 'Vacation', target: 75000, current: 15000, color: 'bg-blue-500' },
    { id: 'g3', name: 'New Laptop', target: 120000, current: 90000, color: 'bg-purple-500' }
  ],
  notifications: [
    { id: 'n1', title: 'Your monthly spending report is ready', time: '2 hours ago', read: false },
    { id: 'n2', title: 'Your savings goal is 42% complete', time: 'Yesterday', read: true },
    { id: 'n3', title: 'New AI insight available on your dashboard', time: 'Sep 24', read: true }
  ],
  reports: [
    { id: 'r1', name: 'Monthly Financial Summary', date: 'September 2026', status: 'Ready' },
    { id: 'r2', name: 'Spending Report', date: 'Q3 2026', status: 'Ready' },
    { id: 'r3', name: 'Tax Year Overview', date: '2025-2026', status: 'Processing' }
  ]
};