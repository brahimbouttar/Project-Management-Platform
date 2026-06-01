import api from '../lib/axios';
import type { Task, CreateTaskInput, UpdateTaskInput, MoveTaskInput } from '../types';

export const taskApi = {
  create: (projectId: string, data: CreateTaskInput) =>
    api.post<Task>(`/projects/${projectId}/tasks`, data).then((r) => r.data),

  list: (projectId: string, filters?: { status?: string; assigneeId?: string; priority?: string; label?: string; type?: string }) =>
    api.get<Task[]>(`/projects/${projectId}/tasks`, { params: filters }).then((r) => r.data),

  getById: (id: string) => api.get<Task>(`/tasks/${id}`).then((r) => r.data),

  update: (id: string, data: UpdateTaskInput) =>
    api.put<Task>(`/tasks/${id}`, data).then((r) => r.data),

  move: (id: string, data: MoveTaskInput) =>
    api.patch<Task>(`/tasks/${id}/move`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/tasks/${id}`).then((r) => r.data),
};
