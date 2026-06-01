import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useProject, useRemoveProjectMember, useWorkspaceMembers } from '../../hooks/useProjects';
import { userApi } from '../../api/user.api';
import { projectApi } from '../../api/project.api';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import { PageSpinner } from '../../components/ui/Spinner';
import { UserPlus, X, Users, Mail, Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '../../types';

const MembersPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  const { data: project, isLoading } = useProject(projectId || '');
  const removeMember = useRemoveProjectMember(projectId || '');
  const { data: workspaceMembers } = useWorkspaceMembers(projectId || '');

  const [emailQuery, setEmailQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Search users by email with debounce
  useEffect(() => {
    if (emailQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const users = await userApi.searchByEmail(emailQuery);
        setSearchResults(users);
        setShowDropdown(users.length > 0);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [emailQuery]);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const inviteMutation = useMutation({
    mutationFn: (email: string) => projectApi.inviteByEmail(projectId!, email),
    onSuccess: () => {
      toast.success('User invited to project!');
      setEmailQuery('');
      setSearchResults([]);
      setShowDropdown(false);
      setSelectedUserId('');
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['workspace-members', projectId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to invite user');
    },
  });

  const handleAddMember = useMutation({
    mutationFn: (userId: string) => projectApi.addMember(projectId!, userId),
    onSuccess: () => {
      toast.success('Member added to project');
      setSelectedUserId('');
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['workspace-members', projectId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to add member');
    },
  });

  if (isLoading) return <PageSpinner />;
  if (!project) return <div className="p-6 text-center text-gray-500">Project not found</div>;

  const projectMemberIds = new Set(project.members?.map((m) => m.userId) || []);
  const availableWorkspaceMembers = (workspaceMembers || []).filter((wm) => !projectMemberIds.has(wm.userId));
  const currentMembers = project.members || [];

  const handleInviteByEmail = () => {
    if (!emailQuery.trim()) return;
    inviteMutation.mutate(emailQuery.trim());
  };

  const handleSelectSearchUser = (user: User) => {
    inviteMutation.mutate(user.email);
  };

  const handleAddWorkspaceMember = () => {
    if (!selectedUserId) return;
    handleAddMember.mutate(selectedUserId);
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
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
        <p className="text-sm text-gray-500">{currentMembers.length} member{currentMembers.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Invite by Email Search */}
      <div className="card p-4 mb-6" ref={searchRef}>
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Invite by email
        </h3>
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={emailQuery}
                onChange={(e) => setEmailQuery(e.target.value)}
                onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                placeholder="Search by email or type full email to invite..."
                className="input-field pl-9"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
              )}
            </div>
            <Button
              onClick={handleInviteByEmail}
              disabled={!emailQuery.trim() || inviteMutation.isPending}
              loading={inviteMutation.isPending}
            >
              <UserPlus className="h-4 w-4" /> Invite
            </Button>
          </div>

          {/* Search results dropdown */}
          {showDropdown && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectSearchUser(user)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-indigo-50 transition-colors border-b border-gray-50 last:border-b-0"
                >
                  <Avatar name={user.displayName} src={user.avatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.displayName}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <span className="shrink-0 text-xs text-indigo-600 font-medium">Invite</span>
                </button>
              ))}
            </div>
          )}

          {emailQuery.length >= 2 && !searching && searchResults.length === 0 && (
            <p className="mt-1 text-xs text-gray-400">
              No users found with "{emailQuery}". Press "Invite" to send an invite to this email.
            </p>
          )}
        </div>
      </div>

      {/* Add from workspace members */}
      {availableWorkspaceMembers.length > 0 && (
        <div className="card p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Add from workspace members
          </h3>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="input-field"
              >
                <option value="">Select a person...</option>
                {availableWorkspaceMembers.map((wm) => (
                  <option key={wm.userId} value={wm.userId}>
                    {wm.user.displayName} ({wm.user.email})
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleAddWorkspaceMember}
              disabled={!selectedUserId}
              loading={handleAddMember.isPending}
            >
              Add to Project
            </Button>
          </div>
        </div>
      )}

      {/* Members list */}
      <div className="card divide-y divide-gray-100">
        {currentMembers.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Users className="mx-auto mb-2 h-8 w-8" />
            <p className="text-sm">No members yet</p>
            <p className="text-xs">Search by email above to add your first collaborator</p>
          </div>
        ) : (
          currentMembers.map((member) => {
            const isOwner = member.role === 'owner';
            return (
              <div key={member.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={member.user.displayName} src={member.user.avatar} size="md" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{member.user.displayName}</p>
                    <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                      <Mail className="h-3 w-3 shrink-0" />
                      {member.user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    isOwner
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {isOwner ? 'Owner' : 'Member'}
                  </span>
                  {!isOwner && (
                    <button
                      onClick={() => handleRemoveMember(member.userId)}
                      className="btn-ghost p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50"
                      title="Remove from project"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MembersPage;
