import { Request, Response, NextFunction } from 'express';
import { BoardService } from '../services/board.service';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const board = await BoardService.create(req.params.projectId, req.body.name);
    res.status(201).json(board);
  } catch (err) {
    next(err);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const boards = await BoardService.list(req.params.projectId);
    res.json(boards);
  } catch (err) {
    next(err);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const board = await BoardService.getById(req.params.id);
    res.json(board);
  } catch (err: any) {
    if (err.message === 'Board not found') {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
};

export const reorderColumns = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await BoardService.reorderColumns(req.params.id, req.body.columnIds);
    res.json({ message: 'Columns reordered' });
  } catch (err) {
    next(err);
  }
};

export const addColumn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const column = await BoardService.addColumn(req.params.id, req.body.name);
    res.status(201).json(column);
  } catch (err) {
    next(err);
  }
};
