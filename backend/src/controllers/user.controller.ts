import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const searchByEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.query;
    if (!email || typeof email !== 'string' || email.length < 2) {
      return res.status(400).json({ error: 'Email search must be at least 2 characters' });
    }

    const users = await prisma.user.findMany({
      where: { email: { contains: email, mode: 'insensitive' } },
      select: { id: true, email: true, username: true, displayName: true, avatar: true },
      take: 10,
    });

    res.json(users);
  } catch (err) {
    next(err);
  }
};
