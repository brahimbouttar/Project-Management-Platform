import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import * as commentController from '../controllers/comment.controller';

const router = Router();

router.post(
  '/tasks/:taskId/comments',
  authenticate,
  [
    body('content')
      .notEmpty().withMessage('Comment content is required')
      .isLength({ max: 5000 }).withMessage('Comment must be at most 5000 characters'),
    validate,
  ],
  commentController.create
);

router.get('/tasks/:taskId/comments', authenticate, commentController.list);
router.delete('/comments/:id', authenticate, commentController.remove);

export default router;
