import { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import BoardColumn from './BoardColumn';
import CreateTaskModal from './CreateTaskModal';
import TaskDetailModal from '../task/TaskDetailModal';
import { useBoard } from '../../hooks/useBoard';
import { useMoveTask } from '../../hooks/useTasks';
import { PageSpinner } from '../ui/Spinner';
import type { Task, Column } from '../../types';
import { Plus } from 'lucide-react';

interface KanbanBoardProps {
  boardId: string;
  projectId: string;
}

const KanbanBoard = ({ boardId, projectId }: KanbanBoardProps) => {
  const { data: board, isLoading } = useBoard(boardId);
  const moveTask = useMoveTask(projectId);
  const [createColumnId, setCreateColumnId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  if (isLoading) return <PageSpinner />;
  if (!board) return <div className="p-6 text-center text-gray-500">Board not found</div>;

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const destColumnId = destination.droppableId;

    if (source.droppableId === destColumnId && source.index === destination.index) return;

    const column = board.columns.find((c) => c.id === destColumnId);
    if (!column) return;

    const tasksInColumn = column.tasks || [];
    const newOrder = destination.index >= tasksInColumn.length ? tasksInColumn.length : destination.index;

    moveTask.mutate({ id: draggableId, columnId: destColumnId, order: newOrder });
  };

  return (
    <div className="h-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex h-full gap-4 overflow-x-auto pb-4">
          {board.columns.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              onAddTask={() => setCreateColumnId(column.id)}
              onTaskClick={(task) => setSelectedTask(task)}
            />
          ))}

          <div className="w-72 shrink-0">
            <button className="flex w-full items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-4 text-sm font-medium text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
              <Plus className="h-4 w-4" />
              Add Column
            </button>
          </div>
        </div>
      </DragDropContext>

      {createColumnId && (
        <CreateTaskModal
          projectId={projectId}
          columnId={createColumnId}
          isOpen={!!createColumnId}
          onClose={() => setCreateColumnId(null)}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          taskId={selectedTask.id}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
