import prisma from '../lib/prisma';

export class NotificationService {
  static async create(userId: string, type: string, title: string, message: string, link?: string) {
    return prisma.notification.create({
      data: { userId, type, title, message, link },
    });
  }

  static async list(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  static async markAsRead(id: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) throw new Error('Notification not found');
    return prisma.notification.update({ where: { id }, data: { read: true } });
  }

  static async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}
