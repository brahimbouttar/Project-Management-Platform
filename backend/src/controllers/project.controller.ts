import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await ProjectService.create(req.params.workspaceId, req.body, req.user!.id);
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await ProjectService.list(req.params.workspaceId);
    res.json(projects);
  } catch (err) {
    next(err);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await ProjectService.getById(req.params.id);
    res.json(project);
  } catch (err: any) {
    if (err.message === 'Project not found') {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await ProjectService.update(req.params.id, req.body);
    res.json(project);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ProjectService.delete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
};

export const inviteByEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, role } = req.body;
    const member = await ProjectService.inviteByEmail(req.params.id, email, role);
    res.status(201).json(member);
  } catch (err: any) {
    if (err.message.includes('No user found') || err.message.includes('already')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

export const addMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, role } = req.body;
    const member = await ProjectService.addMember(req.params.id, userId, role);
    res.status(201).json(member);
  } catch (err: any) {
    if (err.message.includes('already') || err.message === 'User not found') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

export const removeMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ProjectService.removeMember(req.params.id, req.params.userId);
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

export const getWorkspaceMembers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const members = await ProjectService.getWorkspaceMembers(req.params.id);
    res.json(members);
  } catch (err) {
    next(err);
  }
};
