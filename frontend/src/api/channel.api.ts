import api from '../lib/axios';
import type { Channel } from '../types';

export const channelApi = {
  create: (workspaceId: string, data: { name: string; description?: string; isPrivate?: boolean }) =>
    api.post<Channel>(`/workspaces/${workspaceId}/channels`, data).then((r) => r.data),

  list: (workspaceId: string) =>
    api.get<Channel[]>(`/workspaces/${workspaceId}/channels`).then((r) => r.data),
};
