import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await TaskService.create(req.params.projectId, {
      ...req.body,
      creatorId: req.user!.id,
    });
    res.status(201).json(task);
  } catch (err: any) {
    if (err.message === 'Column not found') {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, assigneeId, priority, label } = req.query;
    const tasks = await TaskService.list(req.params.projectId, {
      status: status as string,
      assigneeId: assigneeId as string,
      priority: priority as string,
      label: label as string,
    });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await TaskService.getById(req.params.id);
    res.json(task);
  } catch (err: any) {
    if (err.message === 'Task not found') {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await TaskService.update(req.params.id, req.body);
    res.json(task);
  } catch (err) {
    next(err);
  }
};

export const move = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { columnId, order } = req.body;
    const task = await TaskService.move(req.params.id, columnId, order);
    res.json(task);
  } catch (err: any) {
    if (err.message === 'Task not found') {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await TaskService.delete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};
