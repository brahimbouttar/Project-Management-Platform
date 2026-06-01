import api from '../lib/axios';
import type { Notification } from '../types';

export const notificationApi = {
  list: () => api.get<Notification[]>('/notifications').then((r) => r.data),

  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`).then((r) => r.data),

  markAllAsRead: () => api.patch('/notifications/read-all').then((r) => r.data),
};
