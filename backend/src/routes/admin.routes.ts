import { Router } from 'express';
import {
    getStatsController,
    getRecentRegistrationsController,
    getRecentExamCompletionsController,
    getRecentPlanPurchasesController,
    getStudentsController,
    getExamResultsController,
    getSubjectsController,
    createSubjectController,
    updateSubjectController,
    deleteSubjectController,
    getUserPlansController,
    createUserPlanController,
    deactivateUserPlanController,
    getPlanTemplatesController,
    createPlanTemplateController,
    updatePlanTemplateController,
    deletePlanTemplateController
} from '../controllers/admin.controller';
import {
    createTopicController,
    updateTopicController,
    deleteTopicController,
    getTopicsBySubjectController,
    getTopicProgressController,
    uploadVideoController
} from '../controllers/topic.controller';
import { createQuestionSetController, updateQuestionSetController } from '../controllers/questionSet.controller';
import { bulkCreateQuestionsController } from '../controllers/question.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// All admin routes require auth + admin role
router.use(requireAuth);
router.use(requireAdmin);

// Dashboard stats
router.get('/stats', getStatsController);

// Recent activity
router.get('/recent-registrations', getRecentRegistrationsController);
router.get('/recent-exam-completions', getRecentExamCompletionsController);
router.get('/recent-plan-purchases', getRecentPlanPurchasesController);

// Students
router.get('/students', getStudentsController);

// Exam Results
router.get('/exam-results', getExamResultsController);

// Subjects CRUD
router.get('/subjects', getSubjectsController);
router.post('/subjects', createSubjectController);
router.put('/subjects/:id', updateSubjectController);
router.delete('/subjects/:id', deleteSubjectController);

// Topics Management
router.get('/subjects/:subjectId/topics', getTopicsBySubjectController);
router.post('/topics', createTopicController);
router.put('/topics/:id', updateTopicController);
router.delete('/topics/:id', deleteTopicController);
router.post('/upload-video', upload.single('video'), uploadVideoController);

// Question Sets Management
router.post('/question-sets', createQuestionSetController);
router.put('/question-sets/:id', updateQuestionSetController);

// Questions Management
router.post('/questions/bulk', bulkCreateQuestionsController);

// Plans Management
router.get('/plans', getUserPlansController);
router.post('/plans', createUserPlanController);
router.put('/plans/:id/deactivate', deactivateUserPlanController);

// Plan Templates Management
router.get('/plan-templates', getPlanTemplatesController);
router.post('/plan-templates', createPlanTemplateController);
router.put('/plan-templates/:id', updatePlanTemplateController);
router.delete('/plan-templates/:id', deletePlanTemplateController);

export default router;
