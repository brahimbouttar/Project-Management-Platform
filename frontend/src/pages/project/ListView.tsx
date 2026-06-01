import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTasks, useDeleteTask } from '../../hooks/useTasks';
import { PageSpinner } from '../../components/ui/Spinner';
import PriorityBadge from '../../components/task/PriorityBadge';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import CreateTaskModal from '../../components/board/CreateTaskModal';
import TaskDetailModal from '../../components/task/TaskDetailModal';
import { Plus, ListTodo, Bookmark, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Task } from '../../types';
import toast from 'react-hot-toast';

const ListView = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: tasks, isLoading } = useTasks(projectId || '');
  const deleteTask = useDeleteTask(projectId || '');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTask.mutateAsync(deleteTarget.id);
      toast.success(`${deleteTarget.type === 'epic' ? 'Epic' : 'Task'} deleted`);
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete task');
    }
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">All Tasks</h2>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> Add Task
        </Button>
      </div>

      {!tasks || tasks.length === 0 ? (
        <EmptyState
          icon={<ListTodo className="h-12 w-12" />}
          title="No tasks yet"
          description="Create your first task or epic to get started."
          action={<Button size="sm" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" /> Create Task</Button>}
        />
      ) : (
        <div className="card divide-y divide-gray-100">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold uppercase text-gray-500 bg-gray-50 rounded-t-lg">
            <div className="col-span-4">Title</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Priority</div>
            <div className="col-span-2">Assignee</div>
            <div className="col-span-1">Due</div>
          </div>
          {tasks.map((task) => (
            <div
              key={task.id}
              className="grid grid-cols-12 gap-4 px-6 py-3 text-sm hover:bg-gray-50 cursor-pointer transition-colors items-center group"
            >
              <div
                className="col-span-4 font-medium text-gray-900 truncate flex items-center gap-1.5"
                onClick={() => setSelectedTask(task)}
              >
                {task.type === 'epic' && <Bookmark className="h-3.5 w-3.5 text-purple-500 shrink-0" />}
                {task.parentTask && (
                  <span className="text-xs text-gray-400 mr-1 shrink-0">↳</span>
                )}
                <span className="truncate">{task.title}</span>
              </div>
              <div
                className="col-span-2"
                onClick={() => setSelectedTask(task)}
              >
                {task.type === 'epic' ? (
                  <span className="rounded-md bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">Epic</span>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">Task</span>
                    {task.parentTask && (
                      <span className="text-[10px] text-gray-400 truncate max-w-[100px]">
                        ({task.parentTask.title})
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div
                className="col-span-2"
                onClick={() => setSelectedTask(task)}
              >
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  task.status === 'backlog'
                    ? 'bg-gray-200 text-gray-600'
                    : task.status === 'done'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
              <div
                className="col-span-1"
                onClick={() => setSelectedTask(task)}
              >
                <PriorityBadge priority={task.priority as any} />
              </div>
              <div
                className="col-span-2"
                onClick={() => setSelectedTask(task)}
              >
                {task.assignee ? (
                  <div className="flex items-center gap-2">
                    <Avatar name={task.assignee.displayName} src={task.assignee.avatar} size="sm" />
                    <span className="text-xs text-gray-600 truncate">{task.assignee.displayName}</span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">Unassigned</span>
                )}
              </div>
              <div className="col-span-1 flex items-center gap-1">
                <span
                  className="text-xs text-gray-500 flex-1"
                  onClick={() => setSelectedTask(task)}
                >
                  {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : '-'}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(task);
                  }}
                  className="shrink-0 p-1.5 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                  title={`Delete ${task.type === 'epic' ? 'epic' : 'task'}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && projectId && (
        <CreateTaskModal
          projectId={projectId}
          isOpen={showCreate}
          onClose={() => setShowCreate(false)}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          taskId={selectedTask.id}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.type === 'epic' ? 'Epic' : 'Task'}`}
        size="sm"
      >
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to delete "{deleteTarget?.title}"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleteTask.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ListView;
