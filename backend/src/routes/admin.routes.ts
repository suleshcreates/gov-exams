import { Router } from 'express';
import { getStatsController } from '../controllers/admin.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';

const router = Router();

// All admin routes require auth + admin role
router.use(requireAuth);
router.use(requireAdmin);

// Dashboard stats (only endpoint we have)
router.get('/stats', getStatsController);

export default router;
