import { Outlet, useParams, Link, useLocation } from 'react-router-dom';
import { useProject } from '../../hooks/useProjects';
import AppLayout from '../../components/layout/AppLayout';
import { PageSpinner } from '../../components/ui/Spinner';
import { clsx } from 'clsx';
import { Kanban, List, FileText, Settings, Users } from 'lucide-react';

const ProjectLayout = () => {
  const { projectId, slug } = useParams<{ projectId: string; slug: string }>();
  const { data: project, isLoading } = useProject(projectId || '');
  const location = useLocation();

  if (isLoading) return <AppLayout><PageSpinner /></AppLayout>;
  if (!project) return <AppLayout><div className="p-6 text-center text-gray-500">Project not found</div></AppLayout>;

  const tabs = [
    { label: 'Board', path: `/w/${slug}/projects/${projectId}/board`, icon: <Kanban className="h-4 w-4" /> },
    { label: 'List', path: `/w/${slug}/projects/${projectId}/list`, icon: <List className="h-4 w-4" /> },
    { label: 'Pages', path: `/w/${slug}/projects/${projectId}/pages`, icon: <FileText className="h-4 w-4" /> },
    { label: 'Members', path: `/w/${slug}/projects/${projectId}/members`, icon: <Users className="h-4 w-4" /> },
    { label: 'Settings', path: `/w/${slug}/projects/${projectId}/settings`, icon: <Settings className="h-4 w-4" /> },
  ];

  const isTabActive = (tabPath: string) => {
    if (tabPath.endsWith('/board')) return location.pathname === tabPath;
    if (tabPath.endsWith('/list')) return location.pathname === tabPath;
    if (tabPath.endsWith('/pages')) return location.pathname === tabPath || location.pathname.includes('/pages/');
    if (tabPath.endsWith('/members')) return location.pathname === tabPath;
    if (tabPath.endsWith('/settings')) return location.pathname === tabPath;
    return location.pathname === tabPath;
  };

  return (
    <AppLayout>
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0" style={{ backgroundColor: project.color + '20' }}>
              <span className="text-lg">{project.icon || '📁'}</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate">{project.name}</h1>
              <p className="text-sm text-gray-500 truncate">{project.description}</p>
            </div>
            <Link
              to={`/w/${slug}/projects/${projectId}/members`}
              className="ml-auto flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-600 shrink-0 transition-colors"
            >
              <Users className="h-3.5 w-3.5" />
              {project._count?.members} member{project._count?.members !== 1 ? 's' : ''}
            </Link>
          </div>

          <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <Link
                key={tab.path}
                to={tab.path}
                className={clsx(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors shrink-0 whitespace-nowrap',
                  isTabActive(tab.path)
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                {tab.icon}
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </AppLayout>
  );
};

export default ProjectLayout;
