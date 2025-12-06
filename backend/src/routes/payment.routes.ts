import { Router } from 'express';
import { createOrderController, verifyPaymentController } from '../controllers/payment.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// All payment routes require authentication
router.post('/create-order', requireAuth, createOrderController);
router.post('/verify', requireAuth, verifyPaymentController);

export default router;
