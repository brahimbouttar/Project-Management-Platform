import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useWorkspaces } from '../../hooks/useWorkspace';
import Dropdown from '../ui/Dropdown';

const WorkspaceSwitcher = () => {
  const { data: workspaces } = useWorkspaces();
  const navigate = useNavigate();

  return (
    <Dropdown
      trigger={
        <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
          <span>Switch Workspace</span>
        </button>
      }
    >
      <div className="border-b border-gray-100 px-4 py-2">
        <p className="text-xs font-semibold uppercase text-gray-500">Workspaces</p>
      </div>
      {workspaces?.map((w) => (
        <button
          key={w.id}
          onClick={() => navigate(`/w/${w.slug}`)}
          className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
        >
          <span>{w.icon || '📊'}</span>
          <div>
            <p className="font-medium">{w.name}</p>
            <p className="text-xs text-gray-500">{w._count?.members} members</p>
          </div>
        </button>
      ))}
      <div className="border-t border-gray-100">
        <button
          onClick={() => navigate('/workspaces/create')}
          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50"
        >
          <Plus className="h-4 w-4" />
          Create Workspace
        </button>
      </div>
    </Dropdown>
  );
};

export default WorkspaceSwitcher;
