import prisma from '../lib/prisma';

const DEFAULT_COLUMNS = [
  { name: 'Backlog', order: 0, color: '#d1d5db' },
  { name: 'To Do', order: 1, color: '#e5e7eb' },
  { name: 'In Progress', order: 2, color: '#93c5fd' },
  { name: 'In Review', order: 3, color: '#fde68a' },
  { name: 'Done', order: 4, color: '#86efac' },
];

export class ProjectService {
  static async create(workspaceId: string, data: { name: string; description?: string; color?: string; icon?: string }, userId: string) {
    const project = await prisma.project.create({
      data: {
        ...data,
        workspaceId,
        members: { create: { userId, role: 'owner' } },
        boards: {
          create: {
            name: 'Kanban Board',
            columns: { create: DEFAULT_COLUMNS },
          },
        },
      },
      include: {
        members: { include: { user: { select: { id: true, email: true, username: true, displayName: true, avatar: true } } } },
        boards: { include: { columns: { orderBy: { order: 'asc' } } } },
      },
    });
    return project;
  }

  static async list(workspaceId: string) {
    return prisma.project.findMany({
      where: { workspaceId },
      include: {
        _count: { select: { tasks: true, members: true, pages: true } },
        members: { include: { user: { select: { id: true, displayName: true, avatar: true } } } },
        boards: { take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getById(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: { include: { user: { select: { id: true, email: true, username: true, displayName: true, avatar: true } } } },
        _count: { select: { tasks: true, boards: true, pages: true } },
        boards: { take: 1, include: { columns: { orderBy: { order: 'asc' } } } },
      },
    });
    if (!project) throw new Error('Project not found');
    return project;
  }

  static async update(id: string, data: { name?: string; description?: string; color?: string; icon?: string; status?: string }) {
    return prisma.project.update({ where: { id }, data });
  }

  static async delete(id: string) {
    await prisma.project.delete({ where: { id } });
  }

  static async addMember(projectId: string, userId: string, role: string = 'member') {
    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (existing) throw new Error('User is already a project member');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const member = await prisma.projectMember.create({
      data: { projectId, userId, role },
      include: { user: { select: { id: true, email: true, username: true, displayName: true, avatar: true } } },
    });
    return member;
  }

  static async removeMember(projectId: string, userId: string) {
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (!member) throw new Error('Member not found');
    if (member.role === 'owner') throw new Error('Cannot remove the owner');

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } },
    });
  }

  static async inviteByEmail(projectId: string, email: string, role: string = 'member') {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('No user found with this email');

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { workspaceId: true },
    });
    if (!project) throw new Error('Project not found');

    // Also add as workspace member if not already
    const existingWsMember = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: project.workspaceId, userId: user.id } },
    });
    if (!existingWsMember) {
      await prisma.workspaceMember.create({
        data: { workspaceId: project.workspaceId, userId: user.id, role: 'member' },
      });
    }

    return this.addMember(projectId, user.id, role);
  }

  static async getWorkspaceMembers(workspaceId: string) {
    return prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: { select: { id: true, email: true, username: true, displayName: true, avatar: true } } },
    });
  }
}
