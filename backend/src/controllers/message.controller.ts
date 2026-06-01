import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { channelId } = req.params;
    const { cursor } = req.query;
    const limit = 50;

    const where: any = { channelId };
    if (cursor) {
      where.createdAt = { lt: new Date(cursor as string) };
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        user: { select: { id: true, displayName: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    });

    const hasMore = messages.length > limit;
    if (hasMore) messages.pop();

    res.json({
      messages: messages.reverse(),
      nextCursor: hasMore ? messages[0]?.createdAt.toISOString() : null,
    });
  } catch (err) {
    next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const message = await prisma.message.create({
      data: {
        channelId: req.params.channelId,
        userId: req.user!.id,
        content: req.body.content,
      },
      include: {
        user: { select: { id: true, displayName: true, avatar: true } },
      },
    });
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
};
