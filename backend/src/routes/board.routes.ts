import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import * as boardController from '../controllers/board.controller';

const router = Router();

router.post(
  '/projects/:projectId/boards',
  authenticate,
  boardController.create
);

router.get('/projects/:projectId/boards', authenticate, boardController.list);
router.get('/boards/:id', authenticate, boardController.getById);
router.put('/boards/:id/columns/reorder', authenticate, boardController.reorderColumns);
router.post('/boards/:id/columns', authenticate, [
    body('name').notEmpty().withMessage('Column name is required'),
    validate,
  ], boardController.addColumn);

export default router;
