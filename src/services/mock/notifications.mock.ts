import type { NotificationItem, ApiResponse } from '../../types';

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'Monthly Cashflow Report Ready',
    message: 'Your September 2026 financial and cashflow analysis report has been compiled and is ready for export.',
    time: '2 hours ago',
    read: false,
    type: 'insight',
    link: '/app/reports',
  },
  {
    id: 'notif_2',
    title: 'Portfolio Return Milestone',
    message: 'Your overall investment returns crossed +21.0% today, led by AAPL and VOO gains.',
    time: '5 hours ago',
    read: false,
    type: 'insight',
    link: '/app/investments',
  },
  {
    id: 'notif_3',
    title: 'Emergency Fund Progress (45%)',
    message: 'You have contributed ₹45,000 toward your ₹1,00,000 Emergency Fund milestone.',
    time: 'Yesterday',
    read: true,
    type: 'goal',
    link: '/app/goals',
  },
  {
    id: 'notif_4',
    title: 'Shopping Expense Notice',
    message: 'Shopping expenses for this month are 18% higher than your past 3-month average.',
    time: '3 days ago',
    read: true,
    type: 'alert',
    link: '/app/analytics',
  },
  {
    id: 'notif_5',
    title: 'System Security Sync Complete',
    message: 'All external financial institution feeds have been refreshed with verified end-to-end encryption.',
    time: '5 days ago',
    read: true,
    type: 'system',
    link: '/app/settings',
  },
];

const MOCK_LATENCY = 400;
let memoryNotifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];

export const mockNotificationsService = {
  async getNotifications(): Promise<ApiResponse<NotificationItem[]>> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY));
    return {
      success: true,
      data: [...memoryNotifications],
      timestamp: new Date().toISOString(),
    };
  },

  async markAsRead(id: string): Promise<ApiResponse<{ id: string }>> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY));
    memoryNotifications = memoryNotifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    return {
      success: true,
      data: { id },
      timestamp: new Date().toISOString(),
    };
  },

  async markAllAsRead(): Promise<ApiResponse<{ count: number }>> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY));
    const count = memoryNotifications.filter((n) => !n.read).length;
    memoryNotifications = memoryNotifications.map((n) => ({ ...n, read: true }));
    return {
      success: true,
      data: { count },
      timestamp: new Date().toISOString(),
    };
  },

  async clearAll(): Promise<ApiResponse<{ cleared: boolean }>> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY));
    memoryNotifications = [];
    return {
      success: true,
      data: { cleared: true },
      timestamp: new Date().toISOString(),
    };
  },
};