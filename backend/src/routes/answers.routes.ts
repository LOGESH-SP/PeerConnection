import { Router } from 'express';
import { postAnswer, getAnswersByDoubt, submitFeedback, verifyAnswer, flagAnswer, recheckAnswer } from '../controllers/answers.controller';
import { protect } from '../middleware/auth.middleware';
import { apiLimiter } from '../middleware/rateLimit.middleware';
import { validate } from '../middleware/validate.middleware';
import { answerSchema, feedbackSchema, flagSchema } from '../validations/schemas';

const router = Router();

router.post('/:doubtId', protect, apiLimiter, validate(answerSchema), postAnswer);
router.get('/:doubtId', protect, getAnswersByDoubt);
router.post('/:answerId/feedback', protect, apiLimiter, validate(feedbackSchema), submitFeedback);
router.post('/:answerId/verify', protect, apiLimiter, verifyAnswer);
router.post('/:answerId/recheck', protect, apiLimiter, recheckAnswer);
router.post('/:answerId/flag', protect, apiLimiter, validate(flagSchema), flagAnswer);

export default router;
