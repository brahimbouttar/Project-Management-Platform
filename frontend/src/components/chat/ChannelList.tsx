import { useParams, Link } from 'react-router-dom';
import { Hash, Plus, Lock } from 'lucide-react';
import { clsx } from 'clsx';
import type { Channel } from '../../types';

interface ChannelListProps {
  channels?: Channel[];
  loading?: boolean;
}

const ChannelList = ({ channels, loading }: ChannelListProps) => {
  const { slug, channelId } = useParams<{ slug: string; channelId: string }>();
  const workspaceSlug = slug || '';

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">Channels</h2>
        <button className="btn-ghost p-1">
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : !channels || channels.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm text-gray-400">No channels yet</p>
        ) : (
          channels.map((ch) => (
            <Link
              key={ch.id}
              to={`/w/${workspaceSlug}/chat/${ch.id}`}
              className={clsx(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                ch.id === channelId
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {ch.isPrivate ? <Lock className="h-3.5 w-3.5 shrink-0" /> : <Hash className="h-3.5 w-3.5 shrink-0" />}
              <span className="truncate">{ch.name}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default ChannelList;
