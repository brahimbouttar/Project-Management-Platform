import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { requireWorkspaceOwner } from '../middleware/authorize';
import * as workspaceController from '../controllers/workspace.controller';

const router = Router();

router.post(
  '/',
  authenticate,
  [
    body('name').notEmpty().withMessage('Workspace name is required'),
    body('slug')
      .notEmpty().withMessage('Slug is required')
      .matches(/^[a-z0-9-]+$/).withMessage('Slug must be lowercase alphanumeric with dashes'),
    body('description')
      .optional()
      .isLength({ max: 500 }).withMessage('Description must be at most 500 characters'),
    validate,
  ],
  workspaceController.create
);

router.get('/', authenticate, workspaceController.list);
router.get('/:slug', authenticate, workspaceController.getBySlug);

router.post('/:id/members', authenticate, requireWorkspaceOwner, [
    body('email').isEmail().withMessage('Valid email is required'),
    body('role')
      .optional()
      .isIn(['member', 'admin'])
      .withMessage('Role must be member or admin'),
    validate,
  ], workspaceController.addMember);

router.delete('/:id/members/:userId', authenticate, requireWorkspaceOwner, workspaceController.removeMember);

export default router;
