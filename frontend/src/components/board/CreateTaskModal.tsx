import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useCreateTask } from '../../hooks/useTasks';
import { taskApi } from '../../api/task.api';
import type { Priority, Status } from '../../types';

interface CreateTaskModalProps {
  projectId: string;
  columnId?: string;
  isOpen: boolean;
  onClose: () => void;
  defaultParentTaskId?: string;
}

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review', label: 'In Review' },
  { value: 'done', label: 'Done' },
];

const CreateTaskModal = ({ projectId, columnId, isOpen, onClose, defaultParentTaskId }: CreateTaskModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<Status>('todo');
  const [type, setType] = useState<'task' | 'epic'>('task');
  const [parentTaskId, setParentTaskId] = useState(defaultParentTaskId || '');
  const createTask = useCreateTask(projectId);

  const { data: tasks } = useQuery({
    queryKey: ['tasks', projectId, { type: 'epic' }],
    queryFn: () => taskApi.list(projectId, { type: 'epic' }),
    enabled: isOpen && type === 'task',
  });

  const epics = (tasks || []).filter((t) => t.type === 'epic');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await createTask.mutateAsync({
      title: title.trim(),
      description,
      priority,
      type,
      status,
      ...(columnId ? { columnId } : {}),
      ...(parentTaskId ? { parentTaskId } : {}),
    });

    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus('todo');
    setType('task');
    setParentTaskId(defaultParentTaskId || '');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Task" size="md">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title..."
          autoFocus
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            rows={3}
            className="input-field resize-none"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Type</label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value as 'task' | 'epic');
                if (e.target.value === 'epic') setParentTaskId('');
              }}
              className="input-field"
            >
              <option value="task">Task</option>
              <option value="epic">Epic</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              className="input-field"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="input-field"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {type === 'task' && epics.length > 0 && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Parent Epic</label>
            <select
              value={parentTaskId}
              onChange={(e) => setParentTaskId(e.target.value)}
              className="input-field"
            >
              <option value="">No parent epic</option>
              {epics.map((epic) => (
                <option key={epic.id} value={epic.id}>{epic.title}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={createTask.isPending} disabled={!title.trim()}>Create</Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;
