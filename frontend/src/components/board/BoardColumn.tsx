import { Droppable, Draggable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import type { Column, Task } from '../../types';
import { Plus, MoreHorizontal } from 'lucide-react';

interface BoardColumnProps {
  column: Column;
  onAddTask: () => void;
  onTaskClick: (task: Task) => void;
}

const BoardColumn = ({ column, onAddTask, onTaskClick }: BoardColumnProps) => {
  const taskCount = column.tasks?.length || 0;

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl bg-gray-100">
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: column.color }} />
          <h3 className="text-sm font-semibold text-gray-700">{column.name}</h3>
          <span className="rounded-md bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-500">
            {taskCount}
          </span>
        </div>
        <button className="btn-ghost p-1">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 space-y-2 overflow-y-auto px-3 pb-2 min-h-[100px] ${
              snapshot.isDraggingOver ? 'bg-indigo-50/50' : ''
            }`}
          >
            {column.tasks?.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      ...provided.draggableProps.style,
                      opacity: snapshot.isDragging ? 0.85 : 1,
                    }}
                    onClick={() => onTaskClick(task)}
                  >
                    <TaskCard task={task} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            <button
              onClick={onAddTask}
              className="flex w-full items-center gap-1 rounded-lg border-2 border-dashed border-transparent px-3 py-2 text-sm text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add task
            </button>
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default BoardColumn;
