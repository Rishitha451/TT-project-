import { apiClient } from '../../../lib/api-client';
import { API_ENDPOINTS } from '../../../lib/api-contracts';
import type { NotificationItem } from '../../../types';

export const fetchNotifications = async (): Promise<NotificationItem[]> => {
  const response = await apiClient.get<NotificationItem[]>(API_ENDPOINTS.NOTIFICATIONS.LIST);
  if (!response.success || !response.data) {
    throw response.error || { code: 'NOTIFICATIONS_FETCH_FAILED', message: 'Unable to load notifications' };
  }
  return response.data;
};

export const markAllNotificationsReadApi = async (): Promise<{ count: number }> => {
  const response = await apiClient.post<{ count: number }>(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  if (!response.success || !response.data) {
    throw response.error || { code: 'NOTIFICATIONS_UPDATE_FAILED', message: 'Unable to mark notifications as read' };
  }
  return response.data;
};

export const clearAllNotificationsApi = async (): Promise<{ cleared: boolean }> => {
  const response = await apiClient.post<{ cleared: boolean }>(API_ENDPOINTS.NOTIFICATIONS.CLEAR_ALL);
  if (!response.success || !response.data) {
    throw response.error || { code: 'NOTIFICATIONS_CLEAR_FAILED', message: 'Unable to clear notifications' };
  }
  return response.data;
};
