import { useEffect, useRef, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { getSocket } from '../../lib/socket';
import type { PaginatedMessages, Message } from '../../types';
import Avatar from '../ui/Avatar';
import { format, isSameDay } from 'date-fns';
import Spinner from '../ui/Spinner';

interface MessageListProps {
  channelId: string;
}

const MessageList = ({ channelId }: MessageListProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const prevChannelRef = useRef(channelId);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['messages', channelId],
    queryFn: async ({ pageParam }) => {
      const params: any = { limit: 50 };
      if (pageParam) params.cursor = pageParam;
      const res = await api.get<PaginatedMessages>(`/channels/${channelId}/messages`, { params });
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null as string | null,
    enabled: !!channelId,
  });

  // Reset live messages when channel changes
  useEffect(() => {
    if (prevChannelRef.current !== channelId) {
      setLiveMessages([]);
      prevChannelRef.current = channelId;
    }
  }, [channelId]);

  // Listen for real-time messages
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleMessage = (message: Message) => {
      if (message.channelId === channelId) {
        setLiveMessages((prev) => [...prev, message]);
      }
    };

    socket.on('message-received', handleMessage);
    return () => {
      socket.off('message-received', handleMessage);
    };
  }, [channelId]);

  const allMessages = [
    ...(data?.pages.flatMap((p) => p.messages) || []),
    ...liveMessages,
  ];

  useEffect(() => {
    if (!isFetchingNextPage && allMessages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [allMessages.length, isFetchingNextPage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' });
  }, [channelId]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (container && container.scrollTop === 0 && hasNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) return <div className="flex flex-1 items-center justify-center"><Spinner /></div>;

  if (allMessages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-400" ref={containerRef}>
        <div className="text-center">
          <p className="text-sm">No messages yet</p>
          <p className="text-xs">Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto"
    >
      {isFetchingNextPage && (
        <div className="flex justify-center py-2">
          <Spinner size={20} />
        </div>
      )}

      <div className="space-y-0.5 py-2">
        {allMessages.map((msg, i) => {
          const showDate = i === 0 || !isSameDay(new Date(msg.createdAt), new Date(allMessages[i - 1].createdAt));
          const showSender = i === 0 || msg.userId !== allMessages[i - 1].userId || showDate;

          return (
            <div key={`${msg.id}-${i}`}>
              {showDate && (
                <div className="relative my-4 px-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-xs text-gray-500">
                      {format(new Date(msg.createdAt), 'MMMM d, yyyy')}
                    </span>
                  </div>
                </div>
              )}

              {showSender ? (
                <div className="flex gap-3 px-4 py-1 hover:bg-gray-50">
                  <Avatar name={msg.user.displayName} src={msg.user.avatar} size="sm" className="mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold text-gray-900">{msg.user.displayName}</span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(msg.createdAt), 'h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 break-words">{msg.content}</p>
                  </div>
                </div>
              ) : (
                <div className="ml-[4.25rem] px-4 py-0.5">
                  <p className="text-sm text-gray-700 break-words">{msg.content}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
