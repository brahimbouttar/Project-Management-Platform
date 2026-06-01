import { useState, useRef, useCallback } from 'react';
import { Send } from 'lucide-react';
import { getSocket } from '../../lib/socket';
import api from '../../lib/axios';

interface MessageInputProps {
  channelId: string;
}

const MessageInput = ({ channelId }: MessageInputProps) => {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const emitTyping = useCallback(
    (type: 'start' | 'stop') => {
      const socket = getSocket();
      if (!socket) return;
      socket.emit(type === 'start' ? 'typing-start' : 'typing-stop', { channelId });
    },
    [channelId]
  );

  const handleTyping = useCallback(() => {
    emitTyping('start');
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => emitTyping('stop'), 2000);
  }, [emitTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const text = content.trim();
    setContent('');
    emitTyping('stop');

    // Send via REST
    try {
      await api.post(`/channels/${channelId}/messages`, { content: text });
    } catch {
      // Fallback: emit via socket if REST fails
      const socket = getSocket();
      if (socket) {
        socket.emit('send-message', { channelId, content: text });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white px-4 py-3">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            handleTyping();
          }}
          onBlur={() => {
            clearTimeout(typingTimerRef.current);
            emitTyping('stop');
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Shift+Enter for new line)"
          rows={1}
          className="input-field resize-none min-h-[40px] max-h-[120px]"
        />
        <button
          type="submit"
          disabled={!content.trim()}
          className="btn-primary flex-shrink-0 h-[40px] px-3"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
