import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardApi } from '../../api/board.api';
import KanbanBoard from '../../components/board/KanbanBoard';
import { PageSpinner } from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { LayoutDashboard, Plus } from 'lucide-react';

const BoardView = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();

  const { data: boards, isLoading } = useQuery({
    queryKey: ['boards', projectId],
    queryFn: () => boardApi.list(projectId!),
    enabled: !!projectId,
  });

  const createBoard = useMutation({
    mutationFn: () => boardApi.create(projectId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', projectId] });
    },
  });

  if (isLoading) return <PageSpinner />;

  if (!boards || boards.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <EmptyState
          icon={<LayoutDashboard className="h-12 w-12" />}
          title="No board yet"
          description="Create a board to start organizing your tasks."
          action={
            <Button onClick={() => createBoard.mutate()} loading={createBoard.isPending}>
              <Plus className="h-4 w-4" /> Create Board
            </Button>
          }
        />
      </div>
    );
  }

  return <KanbanBoard boardId={boards[0].id} projectId={projectId!} />;
};

export default BoardView;
