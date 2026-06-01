import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notifications = await NotificationService.list(req.user!.id);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notification = await NotificationService.markAsRead(req.params.id, req.user!.id);
    res.json(notification);
  } catch (err: any) {
    if (err.message === 'Notification not found') {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
};

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await NotificationService.markAllAsRead(req.user!.id);
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};
