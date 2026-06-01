import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import * as channelController from '../controllers/channel.controller';

const router = Router();

router.post(
  '/workspaces/:workspaceId/channels',
  authenticate,
  [body('name').notEmpty().withMessage('Channel name is required'), validate],
  channelController.create
);

router.get('/workspaces/:workspaceId/channels', authenticate, channelController.list);
router.get('/channels/:id/messages', authenticate, channelController.getMessages);
router.post('/channels/:id/messages', authenticate, [
    body('content').notEmpty().withMessage('Message content is required'),
    validate,
  ], channelController.postMessage);

export default router;
