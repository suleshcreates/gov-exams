import { Router } from 'express';
import {
    getPlanTemplatesController
} from '../controllers/admin.controller';

const router = Router();

// Public Plan Routes (No auth required to view plans)
router.get('/plans', getPlanTemplatesController);

export default router;
