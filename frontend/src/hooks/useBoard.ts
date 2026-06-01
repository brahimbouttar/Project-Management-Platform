import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardApi } from '../api/board.api';

export const useBoard = (id: string) =>
  useQuery({
    queryKey: ['board', id],
    queryFn: () => boardApi.getById(id),
    enabled: !!id,
  });

export const useCreateBoard = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name?: string) => boardApi.create(projectId, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boards', projectId] }),
  });
};

export const useAddColumn = (boardId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => boardApi.addColumn(boardId, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
  });
};
