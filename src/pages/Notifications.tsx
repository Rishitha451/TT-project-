import { useState } from 'react';
import { useNotifications } from '../features/notifications/hooks/useNotifications';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { Badge } from '../components/ui/Badge';
import { Check, Trash2, Lightbulb, AlertTriangle, Target, ShieldCheck, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


export default function Notifications() {
  const { notifications, unreadCount, isLoading, isError, error, refetch, markAllAsRead, isMarkingRead, clearAll, isClearing } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'insight' | 'alert'>('all');
  const navigate = useNavigate();

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'insight') return n.type === 'insight';
    if (filter === 'alert') return n.type === 'alert';
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'insight':
        return <Lightbulb className="w-5 h-5 text-indigo-600" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'goal':
        return <Target className="w-5 h-5 text-emerald-600" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-blue-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load notifications"
        message={(error as Error)?.message || 'Something went wrong while fetching alerts.'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <Badge variant="default" size="sm">
                {unreadCount} unread
              </Badge>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            System alerts, risk warnings, and AI advisor milestone updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead()}
            disabled={unreadCount === 0 || isMarkingRead}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Mark all read
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => clearAll()}
            disabled={notifications.length === 0 || isClearing}
            leftIcon={<Trash2 className="w-4 h-4 text-rose-600" />}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          >
            Clear all
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            filter === 'all' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            filter === 'unread' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('insight')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            filter === 'insight' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Insights
        </button>
        <button
          onClick={() => setFilter('alert')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            filter === 'alert' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Alerts
        </button>
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 divide-y divide-slate-100 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <EmptyState
            title="No notifications in this view"
            message="You're all caught up on financial alerts and advisor updates."
          />
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 sm:p-5 flex items-start gap-4 transition-colors hover:bg-slate-50/70 ${
                !notif.read ? 'bg-indigo-50/40' : ''
              }`}
            >
              <div className="p-2 rounded-xl bg-white border border-slate-200 shrink-0 shadow-xs">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`text-sm ${!notif.read ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                    {notif.title}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap shrink-0">
                    {notif.time}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>

                {notif.link && (
                  <button
                    onClick={() => navigate(notif.link!)}
                    className="mt-2.5 inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    <span>View details</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
