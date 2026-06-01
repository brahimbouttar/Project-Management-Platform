import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as pageController from '../controllers/page.controller';

const router = Router();

router.post('/projects/:projectId/pages', authenticate, pageController.create);
router.get('/projects/:projectId/pages', authenticate, pageController.list);
router.get('/pages/:id', authenticate, pageController.getById);
router.put('/pages/:id', authenticate, pageController.update);
router.delete('/pages/:id', authenticate, pageController.remove);

export default router;
