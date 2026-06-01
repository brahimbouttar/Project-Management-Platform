import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject, useUpdateProject, useDeleteProject, useAddProjectMember, useRemoveProjectMember, useWorkspaceMembers } from '../../hooks/useProjects';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { PageSpinner } from '../../components/ui/Spinner';
import { UserPlus, X, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const ProjectSettings = () => {
  const { projectId, slug } = useParams<{ projectId: string; slug: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading } = useProject(projectId || '');
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject(slug || '');
  const addMember = useAddProjectMember(projectId || '');
  const removeMember = useRemoveProjectMember(projectId || '');
  const { data: workspaceMembers } = useWorkspaceMembers(projectId || '');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
    }
  }, [project]);

  if (isLoading) return <PageSpinner />;
  if (!project) return <div className="p-6 text-center text-gray-500">Project not found</div>;

  const projectMemberIds = new Set(project.members?.map((m) => m.userId) || []);
  const availableMembers = (workspaceMembers || []).filter((wm) => !projectMemberIds.has(wm.userId));

  const handleSave = async () => {
    await updateProject.mutateAsync({ id: projectId!, data: { name, description } });
    toast.success('Project updated');
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      await deleteProject.mutateAsync(projectId!);
      toast.success('Project deleted');
      navigate(`/w/${slug}`);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) return;
    try {
      await addMember.mutateAsync({ userId: selectedUserId });
      setSelectedUserId('');
      toast.success('Member added');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMember.mutateAsync(userId);
      toast.success('Member removed');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to remove member');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* General Settings */}
      <div className="card p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">General</h3>
        <div className="space-y-4">
          <Input
            label="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input-field resize-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Color</label>
            <input
              type="color"
              value={project.color}
              onChange={(e) => updateProject.mutate({ id: projectId!, data: { color: e.target.value } })}
              className="h-8 w-8 cursor-pointer rounded border border-gray-300"
            />
          </div>
          <Button onClick={handleSave} loading={updateProject.isPending}>Save Changes</Button>
        </div>
      </div>

      {/* Members Management */}
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
          <span className="text-sm text-gray-500">{project.members?.length || 0} members</span>
        </div>

        {/* Add Member */}
        {availableMembers.length > 0 && (
          <div className="mb-4 flex items-end gap-2">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Add from workspace</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="input-field"
              >
                <option value="">Select a person...</option>
                {availableMembers.map((wm) => (
                  <option key={wm.userId} value={wm.userId}>
                    {wm.user.displayName} ({wm.user.email})
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleAddMember}
              disabled={!selectedUserId}
              loading={addMember.isPending}
            >
              <UserPlus className="h-4 w-4" /> Add
            </Button>
          </div>
        )}

        {(!project.members || project.members.length === 0) && (
          <p className="py-4 text-center text-sm text-gray-400">No members yet</p>
        )}

        {/* Members List */}
        <div className="divide-y divide-gray-100">
          {project.members?.map((member) => {
            const isOwner = member.role === 'owner';
            return (
              <div key={member.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={member.user.displayName} src={member.user.avatar} size="md" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{member.user.displayName}</p>
                    <p className="text-xs text-gray-500 truncate">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                    {member.role}
                  </span>
                  {!isOwner && (
                    <button
                      onClick={() => handleRemoveMember(member.userId)}
                      className="btn-ghost p-1 text-gray-400 hover:text-red-500"
                      title="Remove member"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-200 p-6">
        <h3 className="mb-2 text-lg font-semibold text-red-600">Danger Zone</h3>
        <p className="mb-4 text-sm text-gray-500">
          Once you delete this project, there is no going back. Please be certain.
        </p>
        <Button variant="danger" onClick={handleDelete} loading={deleteProject.isPending}>
          Delete Project
        </Button>
      </div>
    </div>
  );
};

export default ProjectSettings;
