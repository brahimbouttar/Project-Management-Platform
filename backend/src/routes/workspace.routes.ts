import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import * as workspaceController from '../controllers/workspace.controller';

const router = Router();

router.post(
  '/',
  authenticate,
  [
    body('name').notEmpty().withMessage('Workspace name is required'),
    body('slug').notEmpty().withMessage('Slug is required').matches(/^[a-z0-9-]+$/).withMessage('Slug must be lowercase alphanumeric with dashes'),
    validate,
  ],
  workspaceController.create
);

router.get('/', authenticate, workspaceController.list);
router.get('/:slug', authenticate, workspaceController.getBySlug);

router.post('/:id/members', authenticate, [
    body('email').isEmail().withMessage('Valid email is required'),
    validate,
  ], workspaceController.addMember);

router.delete('/:id/members/:userId', authenticate, workspaceController.removeMember);

export default router;
