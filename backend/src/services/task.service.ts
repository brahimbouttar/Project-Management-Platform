import prisma from '../lib/prisma';

const STATUS_COLUMN_MAP: Record<string, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
};

async function resolveColumnId(projectId: string, status: string): Promise<string | null> {
  const columnName = STATUS_COLUMN_MAP[status];
  if (!columnName) return null;
  const column = await prisma.column.findFirst({
    where: { board: { projectId }, name: columnName },
  });
  return column?.id || null;
}

export class TaskService {
  static async create(projectId: string, data: {
    title: string; description?: string; priority?: string; type?: string;
    assigneeId?: string; creatorId: string; columnId?: string; dueDate?: string;
    labels?: string[]; parentTaskId?: string; status?: string;
  }) {
    if (data.parentTaskId) {
      const parent = await prisma.task.findUnique({ where: { id: data.parentTaskId } });
      if (!parent) throw new Error('Parent task not found');
      if (parent.type !== 'epic') throw new Error('Only epics can have subtasks');
    }

    // Auto-assign column from status if no columnId provided
    let columnId: string | undefined = data.columnId;
    if (!columnId && data.status) {
      columnId = (await resolveColumnId(projectId, data.status)) ?? undefined;
    }

    if (columnId) {
      const column = await prisma.column.findUnique({ where: { id: columnId } });
      if (!column) throw new Error('Column not found');
    }

    const maxOrder = columnId ? await prisma.task.findFirst({
      where: { columnId: data.columnId },
      orderBy: { order: 'desc' },
      select: { order: true },
    }) : null;

    const task = await prisma.task.create({
      data: {
        projectId,
        title: data.title,
        description: data.description,
        priority: data.priority || 'medium',
        type: data.type || 'task',
        status: data.status || 'todo',
        assigneeId: data.assigneeId,
        creatorId: data.creatorId,
        columnId: columnId ?? undefined,
        parentTaskId: data.parentTaskId,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        labels: data.labels || [],
        order: (maxOrder?.order ?? -1) + 1,
      },
      include: {
        assignee: { select: { id: true, displayName: true, avatar: true } },
        creator: { select: { id: true, displayName: true, avatar: true } },
        parentTask: { select: { id: true, title: true, type: true } },
        _count: { select: { comments: true, subtasks: true } },
      },
    });
    return task;
  }

  static async list(projectId: string, filters?: {
    status?: string; assigneeId?: string; priority?: string; label?: string; type?: string;
  }) {
    const where: any = { projectId };
    if (filters?.status) where.status = filters.status;
    if (filters?.assigneeId) where.assigneeId = filters.assigneeId;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.type) where.type = filters.type;
    if (filters?.label) where.labels = { has: filters.label };

    return prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, displayName: true, avatar: true } },
        creator: { select: { id: true, displayName: true, avatar: true } },
        parentTask: { select: { id: true, title: true, type: true } },
        _count: { select: { comments: true, subtasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getById(id: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, displayName: true, avatar: true, email: true } },
        creator: { select: { id: true, displayName: true, avatar: true, email: true } },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: { user: { select: { id: true, displayName: true, avatar: true } } },
        },
        parentTask: { select: { id: true, title: true, type: true } },
        subtasks: {
          include: {
            assignee: { select: { id: true, displayName: true, avatar: true } },
            _count: { select: { subtasks: true } },
          },
        },
        column: { select: { id: true, name: true } },
      },
    });
    if (!task) throw new Error('Task not found');
    return task;
  }

  static async update(id: string, data: {
    title?: string; description?: string; status?: string; priority?: string;
    assigneeId?: string | null; columnId?: string | null; order?: number;
    dueDate?: string | null; labels?: string[]; parentTaskId?: string | null;
  }) {
    // If status changed but no explicit columnId, resolve column from status
    let resolvedColumnId: string | undefined | null = data.columnId;
    if (data.status && resolvedColumnId === undefined) {
      const existing = await prisma.task.findUnique({
        where: { id },
        select: { status: true, projectId: true },
      });
      if (existing && existing.status !== data.status) {
        resolvedColumnId = await resolveColumnId(existing.projectId, data.status);
      }
    }

    const updateData: any = { ...data, columnId: resolvedColumnId };
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    return prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignee: { select: { id: true, displayName: true, avatar: true } },
        column: { select: { id: true, name: true } },
        _count: { select: { comments: true, subtasks: true } },
      },
    });
  }

  static async move(id: string, columnId: string, order: number) {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) throw new Error('Task not found');

    // Sync status from column name
    const column = await prisma.column.findUnique({ where: { id: columnId } });
    const statusFromColumn = column
      ? (Object.entries(STATUS_COLUMN_MAP).find(([, v]) => v === column.name)?.[0] || task.status)
      : task.status;

    return prisma.task.update({
      where: { id },
      data: { columnId, order, status: statusFromColumn },
      include: {
        assignee: { select: { id: true, displayName: true, avatar: true } },
        column: { select: { id: true, name: true } },
      },
    });
  }

  static async delete(id: string) {
    await prisma.task.delete({ where: { id } });
  }
}
