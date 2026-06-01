import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWorkspaces } from '../../hooks/useWorkspace';
import { useAuthStore } from '../../store/authStore';
import { Plus, FolderKanban, Users, FileText, CheckSquare } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { PageSpinner } from '../../components/ui/Spinner';

const WorkspacePage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: workspaces, isLoading } = useWorkspaces();

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;
  if (isLoading) return <AppLayout hideSidebar><PageSpinner /></AppLayout>;

  if (!workspaces || workspaces.length === 0) {
    return (
      <AppLayout hideSidebar>
        <EmptyState
          icon={<FolderKanban className="h-12 w-12" />}
          title="No workspaces yet"
          description="Create your first workspace to get started."
          action={
            <Button onClick={() => navigate('/workspaces/create')}>
              <Plus className="h-4 w-4" /> Create Workspace
            </Button>
          }
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout hideSidebar>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Workspaces</h1>
          <Button onClick={() => navigate('/workspaces/create')}>
            <Plus className="h-4 w-4" /> New Workspace
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((w) => (
            <Link
              key={w.id}
              to={`/w/${w.slug}`}
              className="card group p-6 transition-all duration-200 hover:shadow-md hover:border-indigo-200"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="text-2xl">{w.icon || '📊'}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600">{w.name}</h3>
                  <p className="text-sm text-gray-500">{w.slug}</p>
                </div>
              </div>
              <p className="mb-4 text-sm text-gray-500 line-clamp-2">{w.description || 'No description'}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><FolderKanban className="h-3.5 w-3.5" /> {w._count?.projects || 0} projects</span>
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {w._count?.members || 0} members</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default WorkspacePage;
