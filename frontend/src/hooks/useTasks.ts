import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../api/task.api';
import type { CreateTaskInput, UpdateTaskInput } from '../types';

export const useTasks = (projectId: string, filters?: Record<string, string>) =>
  useQuery({
    queryKey: ['tasks', projectId, filters],
    queryFn: () => taskApi.list(projectId, filters),
    enabled: !!projectId,
  });

export const useTask = (id: string) =>
  useQuery({
    queryKey: ['task', id],
    queryFn: () => taskApi.getById(id),
    enabled: !!id,
  });

export const useCreateTask = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskInput) => taskApi.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['board'] });
    },
  });
};

export const useUpdateTask = (projectId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskInput }) => taskApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['board'] });
      queryClient.invalidateQueries({ queryKey: ['task'] });
    },
  });
};

export const useMoveTask = (projectId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, columnId, order }: { id: string; columnId: string; order: number }) =>
      taskApi.move(id, { columnId, order }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['board'] });
    },
  });
};

export const useDeleteTask = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taskApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['board'] });
    },
  });
};
