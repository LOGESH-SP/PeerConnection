import { Router } from 'express';
import { registerUser, loginUser, getUserProfile, getLeaderboard } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rateLimit.middleware';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema } from '../validations/schemas';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), registerUser);
router.post('/login', authLimiter, validate(loginSchema), loginUser);
router.get('/profile', protect, getUserProfile);
router.get('/leaderboard', protect, getLeaderboard);

export default router;
