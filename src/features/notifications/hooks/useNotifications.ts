import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotifications, markAllNotificationsReadApi, clearAllNotificationsApi } from '../api/notifications.api';
import { toast } from '../../../stores/toast.store';

export const NOTIFICATIONS_QUERY_KEY = ['notifications', 'list'];

export const useNotifications = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: fetchNotifications,
    staleTime: 60 * 1000,
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsReadApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      toast.success('Marked all as read', 'All notifications are now marked as read.');
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: clearAllNotificationsApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      toast.info('Notifications cleared', 'All notification history was cleared.');
    },
  });

  return {
    ...query,
    notifications: query.data || [],
    unreadCount: (query.data || []).filter((n) => !n.read).length,
    markAllAsRead: markAllReadMutation.mutateAsync,
    isMarkingRead: markAllReadMutation.isPending,
    clearAll: clearAllMutation.mutateAsync,
    isClearing: clearAllMutation.isPending,
  };
};
