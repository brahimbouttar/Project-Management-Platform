import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import * as projectController from '../controllers/project.controller';

const router = Router();

router.post(
  '/workspaces/:workspaceId/projects',
  authenticate,
  [body('name').notEmpty().withMessage('Project name is required'), validate],
  projectController.create
);

router.get('/workspaces/:workspaceId/projects', authenticate, projectController.list);
router.get('/projects/:id', authenticate, projectController.getById);
router.put('/projects/:id', authenticate, projectController.update);
router.delete('/projects/:id', authenticate, projectController.remove);

router.post('/projects/:id/members', authenticate, [
    body('userId').notEmpty().withMessage('userId is required'),
    validate,
  ], projectController.addMember);

router.post('/projects/:id/invite', authenticate, [
    body('email').isEmail().withMessage('Valid email is required'),
    validate,
  ], projectController.inviteByEmail);

router.delete('/projects/:id/members/:userId', authenticate, projectController.removeMember);
router.get('/projects/:id/workspace-members', authenticate, projectController.getWorkspaceMembers);

export default router;
