import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, username, password, displayName } = req.body;
    const result = await AuthService.register(email, username, password, displayName || username);
    res.status(201).json(result);
  } catch (err: any) {
    if (err.message.includes('already')) {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.json(result);
  } catch (err: any) {
    if (err.message === 'Invalid email or password') {
      return res.status(401).json({ error: err.message });
    }
    next(err);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await AuthService.getProfile(req.user!.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await AuthService.updateProfile(req.user!.id, req.body);
    res.json(user);
  } catch (err) {
    next(err);
  }
};
