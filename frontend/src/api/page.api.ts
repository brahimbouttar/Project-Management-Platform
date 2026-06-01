import api from '../lib/axios';
import type { Page } from '../types';

export const pageApi = {
  create: (projectId: string, data: { title?: string; content?: string; emoji?: string; isPublic?: boolean }) =>
    api.post<Page>(`/projects/${projectId}/pages`, data).then((r) => r.data),

  list: (projectId: string) =>
    api.get<Page[]>(`/projects/${projectId}/pages`).then((r) => r.data),

  getById: (id: string) => api.get<Page>(`/pages/${id}`).then((r) => r.data),

  update: (id: string, data: { title?: string; content?: string; emoji?: string; isPublic?: boolean }) =>
    api.put<Page>(`/pages/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/pages/${id}`).then((r) => r.data),
};
