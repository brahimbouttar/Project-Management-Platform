import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import * as taskController from '../controllers/task.controller';

const router = Router();

router.post(
  '/projects/:projectId/tasks',
  authenticate,
  [body('title').notEmpty().withMessage('Task title is required'), validate],
  taskController.create
);

router.get('/projects/:projectId/tasks', authenticate, taskController.list);
router.get('/tasks/:id', authenticate, taskController.getById);
router.put('/tasks/:id', authenticate, taskController.update);
router.patch('/tasks/:id/move', authenticate, taskController.move);
router.delete('/tasks/:id', authenticate, taskController.remove);

export default router;
