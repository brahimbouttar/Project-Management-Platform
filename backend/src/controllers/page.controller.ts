import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.projectId } });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const page = await prisma.page.create({
      data: {
        projectId: req.params.projectId,
        authorId: req.user!.id,
        title: req.body.title || 'Untitled',
        content: req.body.content || '',
        emoji: req.body.emoji,
        isPublic: req.body.isPublic || false,
      },
      include: {
        author: { select: { id: true, displayName: true, avatar: true } },
      },
    });
    res.status(201).json(page);
  } catch (err) {
    next(err);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pages = await prisma.page.findMany({
      where: { projectId: req.params.projectId },
      include: {
        author: { select: { id: true, displayName: true, avatar: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(pages);
  } catch (err) {
    next(err);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = await prisma.page.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { id: true, displayName: true, avatar: true } },
        project: { select: { id: true, name: true } },
      },
    });
    if (!page) return res.status(404).json({ error: 'Page not found' });
    res.json(page);
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = await prisma.page.findUnique({ where: { id: req.params.id } });
    if (!page) return res.status(404).json({ error: 'Page not found' });

    const updated = await prisma.page.update({
      where: { id: req.params.id },
      data: {
        title: req.body.title,
        content: req.body.content,
        emoji: req.body.emoji,
        isPublic: req.body.isPublic,
      },
      include: {
        author: { select: { id: true, displayName: true, avatar: true } },
      },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = await prisma.page.findUnique({ where: { id: req.params.id } });
    if (!page) return res.status(404).json({ error: 'Page not found' });
    await prisma.page.delete({ where: { id: req.params.id } });
    res.json({ message: 'Page deleted' });
  } catch (err) {
    next(err);
  }
};
