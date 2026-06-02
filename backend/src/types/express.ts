import 'express';

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      email: string;
      username: string;
      role: string;
    };
    workspaceMember?: {
      id: string;
      workspaceId: string;
      userId: string;
      role: string;
      joinedAt: Date;
    };
  }
}
