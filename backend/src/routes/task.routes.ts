import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import * as taskController from '../controllers/task.controller';

const router = Router();

router.post(
  '/projects/:projectId/tasks',
  authenticate,
  [
    body('title').notEmpty().withMessage('Task title is required'),
    body('description')
      .optional()
      .isLength({ max: 5000 }).withMessage('Description must be at most 5000 characters'),
    body('priority')
      .optional()
      .isIn(['urgent', 'high', 'medium', 'low']).withMessage('Invalid priority'),
    body('type')
      .optional()
      .isIn(['task', 'bug', 'epic', 'feature']).withMessage('Invalid task type'),
    validate,
  ],
  taskController.create
);

router.get('/projects/:projectId/tasks', authenticate, taskController.list);
router.get('/tasks/:id', authenticate, taskController.getById);
router.put('/tasks/:id', authenticate, taskController.update);
router.patch('/tasks/:id/move', authenticate, taskController.move);
router.delete('/tasks/:id', authenticate, taskController.remove);

export default router;
