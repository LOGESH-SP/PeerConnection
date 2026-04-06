import { Router } from 'express';
import { getMessages, sendMessage } from '../controllers/messages.controller';
import { protect } from '../middleware/auth.middleware';
import { apiLimiter } from '../middleware/rateLimit.middleware';
import { validate } from '../middleware/validate.middleware';
import { messageSchema } from '../validations/schemas';

const router = Router();

router.get('/', protect, apiLimiter, getMessages);
router.post('/', protect, apiLimiter, validate(messageSchema), sendMessage);

export default router;
