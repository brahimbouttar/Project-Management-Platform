import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const requireWorkspaceMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.params.workspaceId || req.params.id;
    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID is required' });
    }
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: req.user!.id } },
    });
    if (!member) {
      return res.status(403).json({ error: 'Access denied: not a workspace member' });
    }
    req.workspaceMember = member;
    next();
  } catch {
    return res.status(500).json({ error: 'Authorization check failed' });
  }
};

export const requireWorkspaceOwner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.params.workspaceId || req.params.id;
    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID is required' });
    }
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: req.user!.id } },
    });
    if (!member || member.role !== 'owner') {
      return res.status(403).json({ error: 'Access denied: workspace owner role required' });
    }
    req.workspaceMember = member;
    next();
  } catch {
    return res.status(500).json({ error: 'Authorization check failed' });
  }
};

export const requireProjectMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.projectId || req.params.id;
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: req.user!.id } },
    });
    if (!member) {
      return res.status(403).json({ error: 'Access denied: not a project member' });
    }
    next();
  } catch {
    return res.status(500).json({ error: 'Authorization check failed' });
  }
};
