import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from './lib/prisma';

interface JwtPayload {
  id: string;
  email: string;
  username: string;
  role: string;
}

interface SocketUser {
  id: string;
  email: string;
  username: string;
  displayName?: string;
}

interface ServerToClientEvents {
  'message-received': (message: any) => void;
  'typing-start': (data: { channelId: string; userId: string; displayName: string }) => void;
  'typing-stop': (data: { channelId: string; userId: string }) => void;
  'task-updated': (data: any) => void;
  'notification': (notification: any) => void;
}

interface ClientToServerEvents {
  'join-workspace': (workspaceId: string) => void;
  'join-channel': (channelId: string) => void;
  'leave-channel': (channelId: string) => void;
  'send-message': (data: { channelId: string; content: string }) => void;
  'task-updated': (data: any) => void;
  'typing-start': (data: { channelId: string }) => void;
  'typing-stop': (data: { channelId: string }) => void;
}

export const setupSocket = (httpServer: HttpServer) => {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  const userSocketMap = new Map<string, string[]>();

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'dev-secret-key-change-in-production-1234567890'
      ) as JwtPayload;
      (socket as any).user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    const user = (socket as any).user as SocketUser;
    console.log(`User connected: ${user.username} (${socket.id})`);

    if (!userSocketMap.has(user.id)) {
      userSocketMap.set(user.id, []);
    }
    userSocketMap.get(user.id)!.push(socket.id);

    socket.on('join-workspace', (workspaceId: string) => {
      socket.join(`workspace:${workspaceId}`);
      console.log(`${user.username} joined workspace:${workspaceId}`);
    });

    socket.on('join-channel', (channelId: string) => {
      socket.join(`channel:${channelId}`);
      console.log(`${user.username} joined channel:${channelId}`);
    });

    socket.on('leave-channel', (channelId: string) => {
      socket.leave(`channel:${channelId}`);
    });

    socket.on('send-message', async (data: { channelId: string; content: string }) => {
      try {
        const message = await prisma.message.create({
          data: {
            channelId: data.channelId,
            userId: user.id,
            content: data.content,
          },
          include: {
            user: { select: { id: true, displayName: true, avatar: true } },
          },
        });
        io.to(`channel:${data.channelId}`).emit('message-received', message);
      } catch (err) {
        console.error('Error saving message:', err);
      }
    });

    socket.on('task-updated', (data: any) => {
      if (data.workspaceId) {
        socket.to(`workspace:${data.workspaceId}`).emit('task-updated', data);
      }
    });

    socket.on('typing-start', (data: { channelId: string }) => {
      socket.to(`channel:${data.channelId}`).emit('typing-start', {
        channelId: data.channelId,
        userId: user.id,
        displayName: user.username,
      });
    });

    socket.on('typing-stop', (data: { channelId: string }) => {
      socket.to(`channel:${data.channelId}`).emit('typing-stop', {
        channelId: data.channelId,
        userId: user.id,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${user.username} (${socket.id})`);
      const sockets = userSocketMap.get(user.id);
      if (sockets) {
        const idx = sockets.indexOf(socket.id);
        if (idx !== -1) sockets.splice(idx, 1);
        if (sockets.length === 0) userSocketMap.delete(user.id);
      }
    });
  });

  return io;
};
