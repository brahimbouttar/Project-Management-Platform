import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceApi } from '../api/workspace.api';

export const useWorkspaces = () =>
  useQuery({ queryKey: ['workspaces'], queryFn: workspaceApi.list });

export const useWorkspace = (slug: string, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ['workspace', slug],
    queryFn: () => workspaceApi.getBySlug(slug),
    enabled: options?.enabled !== undefined ? options.enabled : !!slug,
  });

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; slug: string; description?: string; icon?: string }) =>
      workspaceApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workspaces'] }),
  });
};

export const useAddMember = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; role?: string }) =>
      workspaceApi.addMember(workspaceId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workspace'] }),
  });
};

export const useRemoveMember = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => workspaceApi.removeMember(workspaceId, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workspace'] }),
  });
};
