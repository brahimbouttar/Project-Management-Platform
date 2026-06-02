import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import * as pageController from '../controllers/page.controller';

const router = Router();

router.post(
  '/projects/:projectId/pages',
  authenticate,
  [
    body('title').notEmpty().withMessage('Page title is required'),
    body('content').optional(),
    validate,
  ],
  pageController.create
);

router.get('/projects/:projectId/pages', authenticate, pageController.list);
router.get('/pages/:id', authenticate, pageController.getById);

router.put('/pages/:id', authenticate, [
    body('title').optional().notEmpty().withMessage('Page title cannot be empty'),
    validate,
  ], pageController.update);

router.delete('/pages/:id', authenticate, pageController.remove);

export default router;
