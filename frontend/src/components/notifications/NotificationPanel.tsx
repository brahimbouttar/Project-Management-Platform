import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../../api/notification.api';
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCheck } from 'lucide-react';
import Button from '../ui/Button';

const NotificationPanel = () => {
  const queryClient = useQueryClient();
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApi.list,
  });

  const markAllRead = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  if (!notifications || notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
        <Bell className="mb-2 h-8 w-8" />
        <p className="text-sm">No notifications</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
        <Button variant="ghost" size="sm" onClick={() => markAllRead.mutate()}>
          <CheckCheck className="h-4 w-4" />
          Mark all read
        </Button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`border-b border-gray-100 px-4 py-3 transition-colors ${
              !n.read ? 'bg-indigo-50' : ''
            }`}
          >
            <p className="text-sm font-medium text-gray-900">{n.title}</p>
            <p className="text-xs text-gray-500">{n.message}</p>
            <p className="mt-1 text-[10px] text-gray-400">
              {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPanel;
