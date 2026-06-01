import api from '../lib/axios';
import type { Workspace, WorkspaceMember } from '../types';

export const workspaceApi = {
  create: (data: { name: string; slug: string; description?: string; icon?: string }) =>
    api.post<Workspace>('/workspaces', data).then((r) => r.data),

  list: () => api.get<Workspace[]>('/workspaces').then((r) => r.data),

  getBySlug: (slug: string) => api.get<Workspace>(`/workspaces/${slug}`).then((r) => r.data),

  addMember: (id: string, data: { email: string; role?: string }) =>
    api.post<WorkspaceMember>(`/workspaces/${id}/members`, data).then((r) => r.data),

  removeMember: (id: string, userId: string) =>
    api.delete(`/workspaces/${id}/members/${userId}`).then((r) => r.data),
};
