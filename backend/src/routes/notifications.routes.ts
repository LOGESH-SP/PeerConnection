import { Router } from 'express';
import { getNotifications, markNotificationsRead } from '../controllers/notifications.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/', protect, getNotifications);
router.post('/read', protect, markNotificationsRead);

export default router;
