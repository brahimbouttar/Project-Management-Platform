import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.taskId } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const comment = await prisma.comment.create({
      data: {
        taskId: req.params.taskId,
        userId: req.user!.id,
        content: req.body.content,
      },
      include: {
        user: { select: { id: true, displayName: true, avatar: true } },
      },
    });
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { taskId: req.params.taskId },
      include: {
        user: { select: { id: true, displayName: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json(comments);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }
    await prisma.comment.delete({ where: { id: req.params.id } });
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
};
