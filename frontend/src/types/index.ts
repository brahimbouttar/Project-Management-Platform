export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string | null;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { members: number; projects: number; channels?: number };
  members?: WorkspaceMember[];
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: string;
  joinedAt: string;
  user: Pick<User, 'id' | 'email' | 'username' | 'displayName' | 'avatar'>;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description?: string | null;
  color: string;
  icon?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count?: { tasks: number; members: number; pages: number; boards?: number };
  members?: ProjectMember[];
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  user: Pick<User, 'id' | 'email' | 'displayName' | 'avatar'>;
}

export interface Board {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
  columns: Column[];
}

export interface Column {
  id: string;
  boardId: string;
  name: string;
  order: number;
  color: string;
  tasks?: Task[];
  _count?: { tasks: number };
}

export interface Task {
  id: string;
  projectId: string;
  columnId?: string | null;
  title: string;
  description?: string | null;
  status: string;
  priority: Priority;
  type: string;
  order: number;
  dueDate?: string | null;
  assigneeId?: string | null;
  creatorId: string;
  labels: string[];
  createdAt: string;
  updatedAt: string;
  assignee?: Pick<User, 'id' | 'displayName' | 'avatar'> | null;
  creator?: Pick<User, 'id' | 'displayName' | 'avatar'> | null;
  column?: Pick<Column, 'id' | 'name'> | null;
  comments?: Comment[];
  subtasks?: Task[];
  parentTaskId?: string | null;
  parentTask?: Pick<Task, 'id' | 'title' | 'type'> | null;
  _count?: { comments: number; subtasks: number };
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  status?: Status;
  type?: string;
  assigneeId?: string;
  columnId?: string;
  dueDate?: string;
  labels?: string[];
  parentTaskId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: string;
  priority?: Priority;
  assigneeId?: string | null;
  columnId?: string | null;
  order?: number;
  dueDate?: string | null;
  labels?: string[];
  parentTaskId?: string | null;
}

export interface MoveTaskInput {
  columnId: string;
  order: number;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: Pick<User, 'id' | 'displayName' | 'avatar'>;
}

export interface Page {
  id: string;
  projectId: string;
  authorId: string;
  title: string;
  content: string;
  emoji?: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  author?: Pick<User, 'id' | 'displayName' | 'avatar'>;
  project?: Pick<Project, 'id' | 'name'>;
}

export interface Channel {
  id: string;
  workspaceId: string;
  name: string;
  description?: string | null;
  isPrivate: boolean;
  createdAt: string;
  _count?: { messages: number };
}

export interface Message {
  id: string;
  channelId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: Pick<User, 'id' | 'displayName' | 'avatar'>;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link?: string | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginatedMessages {
  messages: Message[];
  nextCursor: string | null;
}
