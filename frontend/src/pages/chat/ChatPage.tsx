import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { channelApi } from '../../api/channel.api';
import { workspaceApi } from '../../api/workspace.api';
import AppLayout from '../../components/layout/AppLayout';
import ChannelList from '../../components/chat/ChannelList';
import MessageList from '../../components/chat/MessageList';
import MessageInput from '../../components/chat/MessageInput';
import TypingIndicator from '../../components/chat/TypingIndicator';
import { getSocket } from '../../lib/socket';
import { Hash } from 'lucide-react';
import type { Channel } from '../../types';

const ChatPage = () => {
  const { slug, channelId } = useParams<{ slug: string; channelId: string }>();
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);

  const { data: workspace } = useQuery({
    queryKey: ['workspace', slug],
    queryFn: () => workspaceApi.getBySlug(slug!),
    enabled: !!slug,
  });

  const { data: channels, isLoading: channelsLoading } = useQuery({
    queryKey: ['channels', workspace?.id],
    queryFn: () => channelApi.list(workspace!.id),
    enabled: !!workspace?.id,
  });

  useEffect(() => {
    if (channels && channelId) {
      const found = channels.find((c) => c.id === channelId);
      if (found) setCurrentChannel(found);
    }
  }, [channels, channelId]);

  useEffect(() => {
    const socket = getSocket();
    if (socket && workspace?.id) {
      socket.emit('join-workspace', workspace.id);
    }
  }, [workspace?.id]);

  useEffect(() => {
    const socket = getSocket();
    if (socket && channelId) {
      socket.emit('join-channel', channelId);
      setCurrentChannel(null);
      return () => {
        socket.emit('leave-channel', channelId);
      };
    }
  }, [channelId]);

  const chatContent = !channelId ? (
    <div className="flex flex-1 items-center justify-center text-gray-400">
      <div className="text-center">
        <Hash className="mx-auto mb-2 h-12 w-12" />
        <p className="text-lg font-medium">Select a channel</p>
        <p className="text-sm">Choose a channel from the left to start chatting</p>
      </div>
    </div>
  ) : (
    <div className="flex flex-1 flex-col min-w-0">
      <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3 bg-white shrink-0">
        <Hash className="h-5 w-5 text-gray-400 shrink-0" />
        <h2 className="font-semibold text-gray-900 truncate">
          {currentChannel ? currentChannel.name : channelId}
        </h2>
        {currentChannel?.description && (
          <span className="hidden sm:block text-xs text-gray-400 truncate ml-2 border-l border-gray-200 pl-2">
            {currentChannel.description}
          </span>
        )}
      </div>
      <MessageList channelId={channelId} />
      <TypingIndicator channelId={channelId} />
      <MessageInput channelId={channelId} />
    </div>
  );

  return (
    <AppLayout>
      <div className="flex h-full -m-6">
        <div className="w-60 shrink-0 border-r border-gray-200 bg-white">
          <ChannelList channels={channels} loading={channelsLoading} />
        </div>
        {chatContent}
      </div>
    </AppLayout>
  );
};

export default ChatPage;
