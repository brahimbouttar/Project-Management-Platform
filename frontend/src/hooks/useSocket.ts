import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useSocketStore } from '../store/socketStore';
import { connectSocket, disconnectSocket } from '../lib/socket';

export const useSocket = () => {
  const token = useAuthStore((s) => s.token);
  const setSocket = useSocketStore((s) => s.setSocket);
  const setConnected = useSocketStore((s) => s.setConnected);

  useEffect(() => {
    if (!token) return;

    const socket = connectSocket(token);
    setSocket(socket);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    if (socket.connected) setConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      disconnectSocket();
      setSocket(null);
      setConnected(false);
    };
  }, [token, setSocket, setConnected]);
};
