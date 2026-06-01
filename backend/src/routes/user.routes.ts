import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as userController from '../controllers/user.controller';

const router = Router();

router.get('/search', authenticate, userController.searchByEmail);

export default router;
