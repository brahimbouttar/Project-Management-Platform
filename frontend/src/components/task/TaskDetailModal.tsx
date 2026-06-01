import { useState, useEffect, useCallback } from 'react';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import PriorityBadge from './PriorityBadge';
import TaskComments from './TaskComments';
import { useTask, useUpdateTask, useDeleteTask, useCreateTask } from '../../hooks/useTasks';
import { format } from 'date-fns';
import { Calendar, User, Type, Clock, Trash2, Plus, Bookmark } from 'lucide-react';
import { PageSpinner } from '../ui/Spinner';
import type { Priority } from '../../types';

interface TaskDetailModalProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
}

const TaskDetailModal = ({ taskId, isOpen, onClose }: TaskDetailModalProps) => {
  const { data: task, isLoading } = useTask(taskId);
  const updateTask = useUpdateTask(task?.projectId);
  const deleteTask = useDeleteTask(task?.projectId || '');
  const createSubtask = useCreateTask(task?.projectId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [showDelete, setShowDelete] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority as Priority);
    }
  }, [task]);

  const debouncedUpdate = useCallback(
    (() => {
      let timer: ReturnType<typeof setTimeout>;
      return (data: Record<string, any>) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          updateTask.mutate({ id: taskId, data });
        }, 800);
      };
    })(),
    [taskId, updateTask]
  );

  const handleDelete = async () => {
    await deleteTask.mutateAsync(taskId);
    onClose();
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim() || !task) return;
    await createSubtask.mutateAsync({
      title: newSubtask.trim(),
      type: 'task',
      parentTaskId: task.id,
    });
    setNewSubtask('');
  };

  const handleSubtaskToggle = (sub: { id: string; status: string }) => {
    updateTask.mutate({
      id: sub.id,
      data: { status: sub.status === 'done' ? 'todo' : 'done' },
    });
  };

  if (isLoading) return <Modal isOpen={isOpen} onClose={onClose} title="Loading..." size="full"><PageSpinner /></Modal>;
  if (!task) return null;

  const isEpic = task.type === 'epic';
  const epicSlug = new URLSearchParams(window.location.search).get('slug');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <div className="flex h-[85vh] flex-col lg:flex-row">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto border-r border-gray-200 p-6">
          {/* Parent epic link */}
          {task.parentTask && (
            <div className="mb-3 flex items-center gap-1.5 text-sm text-purple-600">
              <Bookmark className="h-3.5 w-3.5" />
              <span className="font-medium">Epic:</span>
              <span>{task.parentTask.title}</span>
            </div>
          )}

          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              debouncedUpdate({ title: e.target.value });
            }}
            className="mb-4 w-full text-2xl font-bold text-gray-900 outline-none border-none focus:ring-0 bg-transparent"
          />

          <div className="mb-4">
            <label className="text-xs font-semibold uppercase text-gray-500">Description</label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                debouncedUpdate({ description: e.target.value });
              }}
              rows={6}
              className="mt-1 w-full resize-none rounded-lg border border-gray-200 p-3 text-sm text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              placeholder="Add a description..."
            />
          </div>

          {/* Subtasks section */}
          <div className="mb-6">
            <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">
              {isEpic ? 'Child Tasks' : 'Subtasks'}
            </h4>

            <form onSubmit={handleAddSubtask} className="mb-3 flex gap-2">
              <input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder={`Add ${isEpic ? 'child task' : 'subtask'}...`}
                className="input-field flex-1 text-sm"
              />
              <Button
                type="submit"
                size="sm"
                loading={createSubtask.isPending}
                disabled={!newSubtask.trim()}
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </form>

            {task.subtasks && task.subtasks.length > 0 ? (
              <div className="space-y-1">
                {task.subtasks.map((sub) => (
                  <div key={sub.id} className="group flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={sub.status === 'done'}
                      onChange={() => handleSubtaskToggle(sub)}
                      className="rounded border-gray-300"
                    />
                    <span className={`flex-1 ${sub.status === 'done' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {sub.title}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubtaskToggle({ id: sub.id, status: 'done' });
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                {isEpic ? 'No child tasks yet' : 'No subtasks yet'}
              </p>
            )}
          </div>

          <TaskComments taskId={taskId} />
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-72 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-gray-500">Details</span>
            <button
              onClick={() => setShowDelete(true)}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-500">
              <Type className="h-3 w-3" /> Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                debouncedUpdate({ status: e.target.value });
              }}
              className="input-field"
            >
              <option value="backlog">Backlog</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-500">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value as Priority);
                debouncedUpdate({ priority: e.target.value });
              }}
              className="input-field"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-500">
              <Type className="h-3 w-3" /> Type
            </label>
            <div className="flex items-center gap-2">
              {isEpic ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                  <Bookmark className="h-3 w-3" /> Epic
                </span>
              ) : (
                <span className="text-sm text-gray-700">Task</span>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-500">
              <User className="h-3 w-3" /> Assignee
            </label>
            <div className="flex items-center gap-2">
              {task.assignee ? (
                <>
                  <Avatar name={task.assignee.displayName} src={task.assignee.avatar} size="sm" />
                  <span className="text-sm text-gray-700">{task.assignee.displayName}</span>
                </>
              ) : (
                <span className="text-sm text-gray-400">Unassigned</span>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-500">
              <Calendar className="h-3 w-3" /> Due Date
            </label>
            <input
              type="date"
              value={task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : ''}
              onChange={(e) => debouncedUpdate({ dueDate: e.target.value || null })}
              className="input-field"
            />
          </div>

          {task.labels && task.labels.length > 0 && (
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-500">
                Labels
              </label>
              <div className="flex flex-wrap gap-1">
                {task.labels.map((label) => (
                  <span key={label} className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-4 text-xs text-gray-400">
            <p className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Created {format(new Date(task.createdAt), 'MMM d, yyyy')}
            </p>
            {task.creator && (
              <p className="mt-1 flex items-center gap-1">
                <User className="h-3 w-3" />
                by {task.creator.displayName}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      <Modal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        title={`Delete ${isEpic ? 'Epic' : 'Task'}`}
        size="sm"
      >
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to delete "{task.title}"? This action cannot be undone.
            {isEpic && task.subtasks && task.subtasks.length > 0 && (
              <span className="block mt-2 text-amber-600 font-medium">
                This epic has {task.subtasks.length} child task{task.subtasks.length !== 1 ? 's' : ''} that will also be deleted.
              </span>
            )}
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowDelete(false)}>Cancel</Button>
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
    </Modal>
  );
};

export default TaskDetailModal;
