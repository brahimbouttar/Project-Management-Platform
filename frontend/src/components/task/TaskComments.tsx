import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentApi } from '../../api/comment.api';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { Trash2 } from 'lucide-react';

interface TaskCommentsProps {
  taskId: string;
}

const TaskComments = ({ taskId }: TaskCommentsProps) => {
  const [newComment, setNewComment] = useState('');
  const queryClient = useQueryClient();

  const { data: comments } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => commentApi.list(taskId),
  });

  const addComment = useMutation({
    mutationFn: () => commentApi.create(taskId, newComment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      setNewComment('');
    },
  });

  const deleteComment = useMutation({
    mutationFn: (id: string) => commentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment.mutate();
  };

  return (
    <div>
      <h4 className="mb-4 text-xs font-semibold uppercase text-gray-500">Comments ({comments?.length || 0})</h4>

      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          rows={2}
          className="input-field mb-2 resize-none"
        />
        <Button type="submit" size="sm" loading={addComment.isPending} disabled={!newComment.trim()}>
          Comment
        </Button>
      </form>

      <div className="space-y-3">
        {comments?.map((comment) => (
          <div key={comment.id} className="flex gap-3 rounded-lg border border-gray-100 p-3">
            <Avatar name={comment.user.displayName} src={comment.user.avatar} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{comment.user.displayName}</span>
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <button
                  onClick={() => deleteComment.mutate(comment.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-600">{comment.content}</p>
            </div>
          </div>
        ))}
        {(!comments || comments.length === 0) && (
          <p className="text-sm text-gray-400">No comments yet.</p>
        )}
      </div>
    </div>
  );
};

export default TaskComments;
