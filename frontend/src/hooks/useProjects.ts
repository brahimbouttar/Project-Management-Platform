import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '../api/project.api';

export const useProjects = (workspaceId: string, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: () => projectApi.list(workspaceId),
    enabled: options?.enabled !== undefined ? options.enabled : !!workspaceId,
  });

export const useProject = (id: string) =>
  useQuery({
    queryKey: ['project', id],
    queryFn: () => projectApi.getById(id),
    enabled: !!id,
  });

export const useCreateProject = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string; color?: string; icon?: string }) =>
      projectApi.create(workspaceId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] }),
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<any> }) => projectApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
};

export const useDeleteProject = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] }),
  });
};

export const useAddProjectMember = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role?: string }) =>
      projectApi.addMember(projectId, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
};

export const useRemoveProjectMember = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => projectApi.removeMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
};

export const useWorkspaceMembers = (projectId: string) =>
  useQuery({
    queryKey: ['workspace-members', projectId],
    queryFn: () => projectApi.getWorkspaceMembers(projectId),
    enabled: !!projectId,
  });
