import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useProjects, useCreateProject } from '../../hooks/useProjects';
import AppLayout from '../../components/layout/AppLayout';
import { PageSpinner } from '../../components/ui/Spinner';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { FolderKanban, Users, FileText, CheckSquare, Plus, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const WorkspaceDashboard = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: workspace, isLoading: wsLoading } = useWorkspace(slug || '');
  const { data: projects } = useProjects(workspace?.id || '');
  const createProject = useCreateProject(workspace?.id || '');
  const [showCreate, setShowCreate] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', icon: '📁' });

  if (wsLoading) return <AppLayout><PageSpinner /></AppLayout>;
  if (!workspace) return <AppLayout><div className="p-6 text-center text-gray-500">Workspace not found</div></AppLayout>;

  const totalTasks = projects?.reduce((acc, p) => acc + (p._count?.tasks || 0), 0) || 0;
  const totalMembers = workspace.members?.length || 0;
  const totalPages = projects?.reduce((acc, p) => acc + (p._count?.pages || 0), 0) || 0;

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return;
    try {
      const project = await createProject.mutateAsync({
        name: newProject.name.trim(),
        description: newProject.description,
        icon: newProject.icon,
      });
      toast.success('Project created!');
      setShowCreate(false);
      setNewProject({ name: '', description: '', icon: '📁' });
      window.location.href = `/w/${slug}/projects/${project.id}/board`;
    } catch {
      toast.error('Failed to create project');
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{workspace.icon || '📊'}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{workspace.name}</h1>
              <p className="text-gray-500">{workspace.description || 'No description'}</p>
            </div>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" /> New Project
          </Button>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<FolderKanban />} label="Projects" value={workspace._count?.projects || 0} />
          <StatCard icon={<CheckSquare />} label="Open Tasks" value={totalTasks} />
          <StatCard icon={<Users />} label="Team Members" value={totalMembers} />
          <StatCard icon={<FileText />} label="Pages" value={totalPages} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
              <Link to={`/w/${slug}`} className="text-sm text-indigo-600 hover:text-indigo-500">
                View all
              </Link>
            </div>
            {!projects || projects.length === 0 ? (
              <div className="card p-8 text-center text-gray-400">
                <FolderKanban className="mx-auto mb-2 h-8 w-8" />
                <p className="text-sm">No projects yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {projects?.map((project) => (
                  <Link
                    key={project.id}
                    to={`/w/${slug}/projects/${project.id}/board`}
                    className="card flex items-center justify-between p-4 transition-all duration-200 hover:shadow-md hover:border-indigo-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0" style={{ backgroundColor: project.color + '20' }}>
                        <span>{project.icon || '📁'}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{project.name}</p>
                        <p className="text-xs text-gray-500">{project._count?.tasks} tasks · {project._count?.members} members</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Team Members</h2>
            <div className="card divide-y divide-gray-100">
              {workspace.members?.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-3">
                  <Avatar name={member.user.displayName} src={member.user.avatar} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{member.user.displayName}</p>
                    <p className="text-xs text-gray-500">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Project">
        <div className="p-6 space-y-4">
          <Input
            label="Project Name"
            value={newProject.name}
            onChange={(e) => setNewProject((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g., Website Redesign"
            autoFocus
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={newProject.description}
              onChange={(e) => setNewProject((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className="input-field resize-none"
              placeholder="What's this project about?"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreateProject} loading={createProject.isPending} disabled={!newProject.name.trim()}>
              Create Project
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) => (
  <div className="card p-4">
    <div className="mb-2 flex items-center gap-2 text-gray-400">{icon}</div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
  </div>
);

export default WorkspaceDashboard;
