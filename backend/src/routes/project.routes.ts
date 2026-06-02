import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import * as projectController from '../controllers/project.controller';

const router = Router();

router.post(
  '/workspaces/:workspaceId/projects',
  authenticate,
  [
    body('name').notEmpty().withMessage('Project name is required'),
    body('description')
      .optional()
      .isLength({ max: 1000 }).withMessage('Description must be at most 1000 characters'),
    body('color')
      .optional()
      .matches(/^#[0-9a-fA-F]{6}$/).withMessage('Color must be a valid hex color'),
    validate,
  ],
  projectController.create
);

router.get('/workspaces/:workspaceId/projects', authenticate, projectController.list);
router.get('/projects/:id', authenticate, projectController.getById);

router.put('/projects/:id', authenticate, [
    body('name').optional().notEmpty().withMessage('Project name cannot be empty'),
    body('description')
      .optional()
      .isLength({ max: 1000 }).withMessage('Description must be at most 1000 characters'),
    body('color')
      .optional()
      .matches(/^#[0-9a-fA-F]{6}$/).withMessage('Color must be a valid hex color'),
    validate,
  ], projectController.update);

router.delete('/projects/:id', authenticate, projectController.remove);

router.post('/projects/:id/members', authenticate, [
    body('userId').notEmpty().withMessage('userId is required'),
    body('role')
      .optional()
      .isIn(['member', 'admin', 'owner'])
      .withMessage('Role must be member, admin, or owner'),
    validate,
  ], projectController.addMember);

router.post('/projects/:id/invite', authenticate, [
    body('email').isEmail().withMessage('Valid email is required'),
    body('role')
      .optional()
      .isIn(['member', 'admin'])
      .withMessage('Role must be member or admin'),
    validate,
  ], projectController.inviteByEmail);

router.delete('/projects/:id/members/:userId', authenticate, projectController.removeMember);
router.get('/projects/:id/workspace-members', authenticate, projectController.getWorkspaceMembers);

export default router;
