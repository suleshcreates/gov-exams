import { Router } from 'express';
import { getUserProfileController } from '../controllers/profile.controller';
import authMiddleware from '../middlewares/auth.middleware';

const router = Router();

// Get authenticated user's complete profile
router.get('/me', authMiddleware, getUserProfileController);

export default router;
