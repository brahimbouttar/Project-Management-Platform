import prisma from '../lib/prisma';

export class WorkspaceService {
  static async create(data: { name: string; slug: string; description?: string; icon?: string }, userId: string) {
    const existing = await prisma.workspace.findUnique({ where: { slug: data.slug } });
    if (existing) throw new Error('Workspace slug already taken');

    const workspace = await prisma.workspace.create({
      data: {
        ...data,
        members: {
          create: { userId, role: 'owner' },
        },
      },
      include: { members: { include: { user: { select: { id: true, email: true, username: true, displayName: true, avatar: true } } } } },
    });
    return workspace;
  }

  static async getByUserId(userId: string) {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: {
          include: { _count: { select: { members: true, projects: true } } },
        },
      },
    });
    return memberships.map((m) => m.workspace);
  }

  static async getBySlug(slug: string) {
    const workspace = await prisma.workspace.findUnique({
      where: { slug },
      include: {
        members: {
          include: { user: { select: { id: true, email: true, username: true, displayName: true, avatar: true } } },
        },
        _count: { select: { projects: true, channels: true } },
      },
    });
    if (!workspace) throw new Error('Workspace not found');
    return workspace;
  }

  static async getById(id: string) {
    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        members: {
          include: { user: { select: { id: true, email: true, username: true, displayName: true, avatar: true } } },
        },
      },
    });
    if (!workspace) throw new Error('Workspace not found');
    return workspace;
  }

  static async addMember(workspaceId: string, email: string, role: string = 'member') {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found with this email');

    const existing = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: user.id } },
    });
    if (existing) throw new Error('User is already a member');

    const member = await prisma.workspaceMember.create({
      data: { workspaceId, userId: user.id, role },
      include: { user: { select: { id: true, email: true, username: true, displayName: true, avatar: true } } },
    });
    return member;
  }

  static async removeMember(workspaceId: string, userId: string) {
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!member) throw new Error('Member not found');
    if (member.role === 'owner') throw new Error('Cannot remove the owner');

    await prisma.workspaceMember.delete({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
  }
}
