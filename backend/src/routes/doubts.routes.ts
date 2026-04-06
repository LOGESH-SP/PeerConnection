import { Router } from 'express';
import { createDoubt, getDoubts, getDoubtById, saveDoubt, getSavedDoubts } from '../controllers/doubts.controller';
import { protect } from '../middleware/auth.middleware';
import { apiLimiter } from '../middleware/rateLimit.middleware';
import { validate } from '../middleware/validate.middleware';
import { doubtSchema } from '../validations/schemas';

const router = Router();

router.post('/', protect, apiLimiter, validate(doubtSchema), createDoubt);
router.get('/', protect, getDoubts);
router.get('/saved', protect, getSavedDoubts);
router.post('/:id/save', protect, apiLimiter, saveDoubt);
router.get('/:id', protect, getDoubtById);

export default router;
