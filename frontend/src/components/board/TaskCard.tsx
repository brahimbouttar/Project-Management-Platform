import type { Task } from '../../types';
import Avatar from '../ui/Avatar';
import PriorityBadge from '../task/PriorityBadge';
import { MessageSquare, Clock, AlignLeft, Bookmark } from 'lucide-react';
import { format, isPast } from 'date-fns';

interface TaskCardProps {
  task: Task;
}

const TaskCard = ({ task }: TaskCardProps) => {
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate));
  const isEpic = task.type === 'epic';

  return (
    <div className={`card cursor-pointer p-3 transition-all duration-200 hover:shadow-md ${
      isEpic ? 'border-l-4 border-l-purple-500 hover:border-l-purple-600' : 'hover:border-indigo-200'
    }`}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {isEpic && <Bookmark className="h-3.5 w-3.5 text-purple-500 shrink-0" />}
          <h4 className="text-sm font-medium text-gray-900 leading-snug truncate">{task.title}</h4>
        </div>
        <PriorityBadge priority={task.priority} />
      </div>

      {isEpic && (
        <span className="mb-2 inline-flex items-center rounded-md bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">
          Epic
        </span>
      )}

      {task.labels && task.labels.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {task.labels.slice(0, 3).map((label) => (
            <span
              key={label}
              className="rounded-md bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700"
            >
              {label}
            </span>
          ))}
          {task.labels.length > 3 && (
            <span className="text-[10px] text-gray-400">+{task.labels.length - 3}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 min-w-0">
          {task.assignee && (
            <Avatar name={task.assignee.displayName} src={task.assignee.avatar} size="sm" />
          )}
          {task.dueDate && (
            <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
              <Clock className="h-3 w-3" />
              {format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {task._count && task._count.subtasks > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <AlignLeft className="h-3 w-3" />
              {task._count.subtasks}
            </span>
          )}
          {task._count && task._count.comments > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <MessageSquare className="h-3 w-3" />
              {task._count.comments}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
