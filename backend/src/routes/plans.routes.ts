import { Router } from 'express';
import { getUserPlansController, checkExamAccessController, deactivateUserPlanController } from '../controllers/plans.controller';
import authMiddleware from '../middlewares/auth.middleware';
import adminMiddleware from '../middlewares/admin.middleware';

const router = Router();

// All plan routes require authentication
router.get('/my-plans', authMiddleware, getUserPlansController);
router.get('/check-access/:examId', authMiddleware, checkExamAccessController);

// Admin routes (requires admin auth)
router.patch('/deactivate/:planId', authMiddleware, adminMiddleware, deactivateUserPlanController);

export default router;
