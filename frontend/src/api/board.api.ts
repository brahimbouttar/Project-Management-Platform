import api from '../lib/axios';
import type { Board, Column } from '../types';

export const boardApi = {
  create: (projectId: string, name?: string) =>
    api.post<Board>(`/projects/${projectId}/boards`, { name }).then((r) => r.data),

  list: (projectId: string) =>
    api.get<Board[]>(`/projects/${projectId}/boards`).then((r) => r.data),

  getById: (id: string) => api.get<Board>(`/boards/${id}`).then((r) => r.data),

  reorderColumns: (boardId: string, columnIds: string[]) =>
    api.put(`/boards/${boardId}/columns/reorder`, { columnIds }).then((r) => r.data),

  addColumn: (boardId: string, name: string) =>
    api.post<Column>(`/boards/${boardId}/columns`, { name }).then((r) => r.data),
};
