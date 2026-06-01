import api from '../lib/axios';
import type { Project, ProjectMember, WorkspaceMember } from '../types';

export const projectApi = {
  create: (workspaceId: string, data: { name: string; description?: string; color?: string; icon?: string }) =>
    api.post<Project>(`/workspaces/${workspaceId}/projects`, data).then((r) => r.data),

  list: (workspaceId: string) =>
    api.get<Project[]>(`/workspaces/${workspaceId}/projects`).then((r) => r.data),

  getById: (id: string) => api.get<Project>(`/projects/${id}`).then((r) => r.data),

  update: (id: string, data: Partial<Project>) =>
    api.put<Project>(`/projects/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/projects/${id}`).then((r) => r.data),

  addMember: (id: string, userId: string, role?: string) =>
    api.post<ProjectMember>(`/projects/${id}/members`, { userId, role }).then((r) => r.data),

  removeMember: (id: string, userId: string) =>
    api.delete(`/projects/${id}/members/${userId}`).then((r) => r.data),

  getWorkspaceMembers: (id: string) =>
    api.get<WorkspaceMember[]>(`/projects/${id}/workspace-members`).then((r) => r.data),

  inviteByEmail: (id: string, email: string, role?: string) =>
    api.post<ProjectMember>(`/projects/${id}/invite`, { email, role }).then((r) => r.data),
};
