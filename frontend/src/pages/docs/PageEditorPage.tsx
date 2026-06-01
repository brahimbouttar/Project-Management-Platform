import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pageApi } from '../../api/page.api';
import PageEditor from '../../components/pages/PageEditor';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { PageSpinner } from '../../components/ui/Spinner';
import { ArrowLeft, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

const PageEditorPage = () => {
  const { pageId, projectId, slug } = useParams<{ pageId: string; projectId: string; slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDelete, setShowDelete] = useState(false);

  const { data: page, isLoading } = useQuery({
    queryKey: ['page', pageId],
    queryFn: () => pageApi.getById(pageId!),
    enabled: !!pageId,
  });

  const deleteMutation = useMutation({
    mutationFn: () => pageApi.delete(pageId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages', projectId] });
      toast.success('Page deleted');
      navigate(`/w/${slug}/projects/${projectId}/pages`);
    },
    onError: () => toast.error('Failed to delete page'),
  });

  if (isLoading) return <div className="flex h-full items-center justify-center"><PageSpinner /></div>;
  if (!page) return <div className="p-6 text-center text-gray-500">Page not found</div>;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to={`/w/${slug}/projects/${projectId}/pages`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to pages
        </Link>
        <button
          onClick={() => setShowDelete(true)}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-4 w-4" /> Delete
        </button>
      </div>
      <PageEditor
        pageId={page.id}
        initialTitle={page.title}
        initialContent={page.content}
      />

      <Modal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        title="Delete Page"
        size="sm"
      >
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to delete "{page.title}"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => deleteMutation.mutate()}
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

export default PageEditorPage;
