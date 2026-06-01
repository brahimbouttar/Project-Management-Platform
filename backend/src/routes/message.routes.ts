import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import * as messageController from '../controllers/message.controller';

const router = Router();

router.get('/channels/:channelId/messages', authenticate, messageController.list);
router.post('/channels/:channelId/messages', authenticate, [
    body('content').notEmpty().withMessage('Message content is required'),
    validate,
  ], messageController.create);

export default router;
