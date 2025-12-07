import { Router } from 'express';
import { getUserPlansController, checkExamAccessController } from '../controllers/plans.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// All plan routes require authentication
router.get('/my-plans', authMiddleware, getUserPlansController);
router.get('/check-access/:examId', authMiddleware, checkExamAccessController);

export default router;
