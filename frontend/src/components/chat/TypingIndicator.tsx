import { useState, useEffect, useRef } from 'react';
import { getSocket } from '../../lib/socket';

interface TypingUser {
  userId: string;
  displayName: string;
}

const TypingIndicator = ({ channelId }: { channelId: string }) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    setTypingUsers([]);
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current.clear();
  }, [channelId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleTypingStart = (data: TypingUser & { channelId: string }) => {
      if (data.channelId !== channelId) return;

      setTypingUsers((prev) => {
        if (prev.find((u) => u.userId === data.userId)) return prev;
        return [...prev, { userId: data.userId, displayName: data.displayName }];
      });

      // Auto-remove after 5s if no typing-stop received
      clearTimeout(timersRef.current.get(data.userId));
      const timer = setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
        timersRef.current.delete(data.userId);
      }, 5000);
      timersRef.current.set(data.userId, timer);
    };

    const handleTypingStop = (data: { channelId: string; userId: string }) => {
      if (data.channelId !== channelId) return;
      clearTimeout(timersRef.current.get(data.userId));
      timersRef.current.delete(data.userId);
      setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    };

    socket.on('typing-start', handleTypingStart);
    socket.on('typing-stop', handleTypingStop);

    return () => {
      socket.off('typing-start', handleTypingStart);
      socket.off('typing-stop', handleTypingStop);
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
    };
  }, [channelId]);

  if (typingUsers.length === 0) return null;

  const names = typingUsers.map((u) => u.displayName);
  const text =
    names.length === 1
      ? `${names[0]} is typing...`
      : names.length === 2
        ? `${names[0]} and ${names[1]} are typing...`
        : `${names[0]} and ${names.length - 1} others are typing...`;

  return (
    <div className="px-4 py-1 text-xs text-gray-400 italic bg-white border-t border-gray-100">
      {text}
    </div>
  );
};

export default TypingIndicator;
