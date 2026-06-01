import prisma from '../lib/prisma';

const DEFAULT_COLUMNS = [
  { name: 'Backlog', order: 0, color: '#d1d5db' },
  { name: 'To Do', order: 1, color: '#e5e7eb' },
  { name: 'In Progress', order: 2, color: '#93c5fd' },
  { name: 'In Review', order: 3, color: '#fde68a' },
  { name: 'Done', order: 4, color: '#86efac' },
];

export class BoardService {
  static async create(projectId: string, name: string = 'Kanban Board') {
    const board = await prisma.board.create({
      data: {
        projectId,
        name,
        columns: {
          create: DEFAULT_COLUMNS.map((col) => ({
            name: col.name,
            order: col.order,
            color: col.color,
          })),
        },
      },
      include: {
        columns: { orderBy: { order: 'asc' } },
      },
    });
    return board;
  }

  static async list(projectId: string) {
    return prisma.board.findMany({
      where: { projectId },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: { _count: { select: { tasks: true } } },
        },
      },
    });
  }

  static async getById(id: string) {
    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            tasks: {
              orderBy: { order: 'asc' },
              include: {
                assignee: { select: { id: true, displayName: true, avatar: true } },
                _count: { select: { comments: true, subtasks: true } },
              },
            },
          },
        },
      },
    });
    if (!board) throw new Error('Board not found');
    return board;
  }

  static async reorderColumns(boardId: string, columnIds: string[]) {
    await prisma.$transaction(
      columnIds.map((id, index) =>
        prisma.column.update({ where: { id }, data: { order: index } })
      )
    );
  }

  static async addColumn(boardId: string, name: string) {
    const maxOrder = await prisma.column.findFirst({
      where: { boardId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    return prisma.column.create({
      data: { boardId, name, order: (maxOrder?.order ?? -1) + 1 },
    });
  }
}
