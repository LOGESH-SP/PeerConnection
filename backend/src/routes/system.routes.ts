import { Router } from 'express';
import { checkDatabaseStatus } from '../controllers/system.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/db-status', protect, checkDatabaseStatus);

export default router;
