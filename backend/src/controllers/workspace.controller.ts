import { Request, Response, NextFunction } from 'express';
import { WorkspaceService } from '../services/workspace.service';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspace = await WorkspaceService.create(req.body, req.user!.id);
    res.status(201).json(workspace);
  } catch (err: any) {
    if (err.message.includes('already taken')) {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaces = await WorkspaceService.getByUserId(req.user!.id);
    res.json(workspaces);
  } catch (err) {
    next(err);
  }
};

export const getBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspace = await WorkspaceService.getBySlug(req.params.slug);
    res.json(workspace);
  } catch (err: any) {
    if (err.message === 'Workspace not found') {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
};

export const addMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, role } = req.body;
    const member = await WorkspaceService.addMember(req.params.id, email, role);
    res.status(201).json(member);
  } catch (err: any) {
    if (err.message.includes('not found') || err.message.includes('already')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

export const removeMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await WorkspaceService.removeMember(req.params.id, req.params.userId);
    res.json({ message: 'Member removed' });
  } catch (err: any) {
    if (err.message === 'Member not found') {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === 'Cannot remove the owner') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};
