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
    deletePlanTemplateController,
    getStudentDetailsController,
    getStudentPlansByStudentController,
    getStudentHistoryByStudentController
} from '../controllers/admin.controller';
import {
    createTopicController,
    updateTopicController,
    deleteTopicController,
    getTopicsBySubjectController,
    uploadVideoController,
    uploadTopicPDFController,
    getTopicMaterialsController,
    createTopicMaterialController,
    deleteTopicMaterialController,
    generateUploadUrlController
} from '../controllers/topic.controller';
import { createQuestionSetController, updateQuestionSetController } from '../controllers/questionSet.controller';
import { bulkCreateQuestionsController } from '../controllers/question.controller';
import {
    createSpecialExamController,
    updateSpecialExamController,
    deleteSpecialExamController,
    assignQuestionSetController,
    getAdminSpecialExamByIdController
} from '../controllers/specialExam.controller';
import {
    createPYQController,
    updatePYQController,
    deletePYQController,
    uploadPYQFileController
} from '../controllers/pyq.controller';
import { getAllPremiumAccessController } from '../controllers/premiumAccess.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';
import { upload, pdfUpload } from '../middlewares/upload.middleware';

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
// Students
router.get('/students', getStudentsController);
router.get('/students/:email', getStudentDetailsController);
router.get('/students/:email/plans', getStudentPlansByStudentController);
router.get('/students/:email/history', getStudentHistoryByStudentController);

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
router.post('/topics/upload-pdf', pdfUpload.single('pdf'), uploadTopicPDFController);

// Topic Materials (Multiple Content)
router.get('/topics/:topicId/materials', getTopicMaterialsController);
router.post('/topic-materials', createTopicMaterialController);
router.delete('/topic-materials/:id', deleteTopicMaterialController);
router.post('/generate-upload-url', generateUploadUrlController);

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

// Special Exams Management
router.post('/special-exams', createSpecialExamController);
router.put('/special-exams/:id', updateSpecialExamController);
router.delete('/special-exams/:id', deleteSpecialExamController);
router.get('/special-exams/:id', getAdminSpecialExamByIdController);
router.put('/special-exams/:examId/sets/:setNumber', assignQuestionSetController);

// PYQ Management
router.post('/pyq', createPYQController);
router.put('/pyq/:id', updatePYQController);
router.delete('/pyq/:id', deletePYQController);
router.post('/pyq/upload', pdfUpload.single('pdf'), uploadPYQFileController);

// Premium Access Management
router.get('/premium-access', getAllPremiumAccessController);

export default router;

