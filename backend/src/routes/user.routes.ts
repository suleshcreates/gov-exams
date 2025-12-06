import { Router } from 'express';
import {
    getProfileController,
    updateProfileController,
    getUserPlansController,
    getActivePlansController,
    getExamHistoryController,
    getExamProgressController,
} from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateProfileUpdate } from '../middlewares/validate.middleware';

const router = Router();

// All user routes require authentication
router.use(requireAuth);

router.get('/profile', getProfileController);
router.put('/profile', validateProfileUpdate, updateProfileController);
router.get('/plans', getUserPlansController);
router.get('/plans/active', getActivePlansController);
router.get('/exam-history', getExamHistoryController);
router.get('/exam-progress/:examId', getExamProgressController);

export default router;
