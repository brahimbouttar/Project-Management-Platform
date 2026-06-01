import api from '../lib/axios';
import type { Comment } from '../types';

export const commentApi = {
  create: (taskId: string, content: string) =>
    api.post<Comment>(`/tasks/${taskId}/comments`, { content }).then((r) => r.data),

  list: (taskId: string) =>
    api.get<Comment[]>(`/tasks/${taskId}/comments`).then((r) => r.data),

  delete: (id: string) => api.delete(`/comments/${id}`).then((r) => r.data),
};
