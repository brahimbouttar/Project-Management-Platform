import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pageApi } from '../../api/page.api';
import { format } from 'date-fns';
import { FileText, Plus, Trash2 } from 'lucide-react';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { PageSpinner } from '../ui/Spinner';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface PageListProps {
  projectId: string;
  workspaceSlug: string;
}

const PageList = ({ projectId, workspaceSlug }: PageListProps) => {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: pages, isLoading } = useQuery({
    queryKey: ['pages', projectId],
    queryFn: () => pageApi.list(projectId),
  });

  const createMutation = useMutation({
    mutationFn: () => pageApi.create(projectId, { title: 'Untitled' }),
    onSuccess: (newPage) => {
      queryClient.invalidateQueries({ queryKey: ['pages', projectId] });
      // Navigate to new page
      window.location.href = `/w/${workspaceSlug}/projects/${projectId}/pages/${newPage.id}`;
    },
    onError: () => toast.error('Failed to create page'),
  });

  const deleteMutation = useMutation({
    mutationFn: (pageId: string) => pageApi.delete(pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages', projectId] });
      toast.success('Page deleted');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Failed to delete page'),
  });

  const handleDelete = (e: React.MouseEvent, pageId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteTarget(pageId);
  };

  const confirmDelete = () => {
    if (deleteTarget) deleteMutation.mutate(deleteTarget);
  };

  if (isLoading) return <PageSpinner />;

  if (!pages || pages.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-12 w-12" />}
        title="No pages yet"
        description="Create your first doc to get started."
        action={
          <Button onClick={() => createMutation.mutate()} loading={createMutation.isPending}>
            Create Page
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Pages ({pages.length})</h2>
        <Button size="sm" onClick={() => createMutation.mutate()} loading={createMutation.isPending}>
          <Plus className="h-4 w-4" /> New Page
        </Button>
      </div>
      <div className="space-y-2">
        {pages.map((page) => (
          <Link
            key={page.id}
            to={`/w/${workspaceSlug}/projects/${projectId}/pages/${page.id}`}
            className="card flex items-center justify-between p-4 transition-all duration-200 hover:shadow-md hover:border-indigo-200 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-lg shrink-0">{page.emoji || '📄'}</span>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">{page.title}</p>
                <p className="text-xs text-gray-500">
                  Updated {format(new Date(page.updatedAt), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => handleDelete(e, page.id)}
              className="shrink-0 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              title="Delete page"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </Link>
        ))}
      </div>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Page"
        size="sm"
      >
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to delete this page? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              loading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PageList;
