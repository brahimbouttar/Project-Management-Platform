import { useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard, FolderKanban, MessageSquare, Bell,
  ChevronLeft, ChevronRight, LogOut, Plus, ChevronDown, ChevronRight as ChevronRightIcon, Globe,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useProjects } from '../../hooks/useProjects';
import Avatar from '../ui/Avatar';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { data: workspace } = useWorkspace(slug || '', { enabled: !!slug });
  const { data: projects } = useProjects(workspace?.id || '', { enabled: !!workspace?.id });
  const [projectsOpen, setProjectsOpen] = useState(true);

  const isActive = (path: string) => location.pathname.includes(path);

  const navToWorkspace = (path: string) => slug ? `/w/${slug}${path}` : '#';
  const showWorkspaceNav = !!slug;

  if (collapsed) {
    return (
      <div className="flex flex-col items-center border-r border-gray-200 bg-slate-900 py-4">
        <button onClick={onToggle} className="mb-6 text-gray-400 hover:text-white">
          <ChevronRight className="h-5 w-5" />
        </button>
        <nav className="flex flex-col items-center gap-4">
          {showWorkspaceNav && (
            <>
              <SidebarIcon icon={<LayoutDashboard className="h-5 w-5" />} active={isActive('') && slug !== undefined} to={`/w/${slug}`} />
              <SidebarIcon icon={<FolderKanban className="h-5 w-5" />} active={isActive('projects') || isActive('board')} to={`/w/${slug}`} />
              <SidebarIcon icon={<MessageSquare className="h-5 w-5" />} active={isActive('chat')} to={`/w/${slug}/chat`} />
            </>
          )}
          <SidebarIcon icon={<Globe className="h-5 w-5" />} active={location.pathname === '/workspaces'} to="/workspaces" />
        </nav>
        <div className="mt-auto">
          <button onClick={logout} className="text-gray-400 hover:text-white">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-64 flex-col border-r border-gray-200 bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-700 px-4 py-4">
        <Link to="/workspaces" className="flex items-center gap-3 min-w-0 hover:opacity-80">
          <span className="text-lg shrink-0">{workspace?.icon || (showWorkspaceNav ? '📊' : '🏠')}</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {workspace?.name || (showWorkspaceNav ? 'Workspace' : 'ProjectHub')}
            </p>
            {showWorkspaceNav && (
              <p className="truncate text-xs text-slate-400">{workspace?._count?.members || 0} members</p>
            )}
          </div>
        </Link>
        <button onClick={onToggle} className="text-slate-400 hover:text-white shrink-0">
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {showWorkspaceNav ? (
          <>
            <NavItem
              icon={<LayoutDashboard className="h-4 w-4" />}
              label="Dashboard"
              to={`/w/${slug}`}
              active={location.pathname === `/w/${slug}`}
            />

            <div className="mb-2 mt-4 flex items-center justify-between">
              <button
                onClick={() => setProjectsOpen(!projectsOpen)}
                className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white"
              >
                {projectsOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRightIcon className="h-3 w-3" />}
                Projects
              </button>
              <Link to={`/w/${slug}`} className="text-slate-400 hover:text-white">
                <Plus className="h-3.5 w-3.5" />
              </Link>
            </div>

            {projectsOpen && projects?.map((project) => (
              <NavItem
                key={project.id}
                icon={<span className="h-3 w-3 rounded" style={{ backgroundColor: project.color }} />}
                label={project.name}
                to={`/w/${slug}/projects/${project.id}/board`}
                active={location.pathname.includes(project.id)}
                compact
              />
            ))}

            <div className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Communication</div>
            <NavItem
              icon={<MessageSquare className="h-4 w-4" />}
              label="Chat"
              to={`/w/${slug}/chat`}
              active={isActive('chat')}
            />
          </>
        ) : (
          <div className="space-y-1">
            <NavItem
              icon={<Globe className="h-4 w-4" />}
              label="All Workspaces"
              to="/workspaces"
              active={location.pathname === '/workspaces'}
            />
          </div>
        )}
      </nav>

      <div className="border-t border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar name={user?.displayName || 'U'} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{user?.displayName}</p>
              <p className="truncate text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="text-slate-400 hover:text-white shrink-0" title="Logout">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({
  icon, label, to, active, compact,
}: {
  icon: React.ReactNode; label: string; to: string; active: boolean; compact?: boolean;
}) => (
  <Link
    to={to}
    className={clsx(
      'flex items-center gap-3 rounded-lg transition-colors',
      active
        ? 'bg-indigo-600/20 text-indigo-400'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white',
      compact ? 'px-2 py-1.5 text-sm' : 'px-3 py-2 text-sm'
    )}
  >
    <span className="shrink-0">{icon}</span>
    <span className="truncate">{label}</span>
  </Link>
);

const SidebarIcon = ({ icon, active, to }: { icon: React.ReactNode; active: boolean; to: string }) => (
  <Link
    to={to}
    className={clsx(
      'rounded-lg p-2 transition-colors',
      active ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    )}
  >
    {icon}
  </Link>
);

export default Sidebar;
