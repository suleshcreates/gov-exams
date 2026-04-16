import { Router } from 'express';
import {
    getPlanTemplatesController
} from '../controllers/admin.controller';
import {
    getSpecialExamsController,
    getSpecialExamByIdController,
    diagnosticSetsController
} from '../controllers/specialExam.controller';
import {
    getPYQsController,
    getPYQByIdController
} from '../controllers/pyq.controller';
import { getCategoriesController } from '../controllers/premiumAccess.controller';
import { getCategoryPlansController } from '../controllers/categoryPlan.controller';
import { submitContactController } from '../controllers/contact.controller';
import { getSubjectsController } from '../controllers/admin.controller';

const router = Router();

// Public Plan Routes (No auth required to view plans)
router.get('/plans', getPlanTemplatesController);
router.get('/subjects', getSubjectsController);

// Public Special Exams (No auth required to view list)
router.get('/special-exams', getSpecialExamsController);
router.get('/special-exams/:id', getSpecialExamByIdController);

// Public PYQ Routes (No auth required to view list)
router.get('/pyq', getPYQsController);
router.get('/pyq/:id', getPYQByIdController);

// Categories for filtering
router.get('/categories', getCategoriesController);

// Category Plans (No auth required to view)
router.get('/category-plans', getCategoryPlansController);

// Contact Form (No auth required)
router.post('/contact', submitContactController);

// Diagnostic (temporary)
router.get('/diagnostic/sets', diagnosticSetsController);

export default router;

