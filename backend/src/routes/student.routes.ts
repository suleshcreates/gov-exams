import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import {
    checkExamAccessController,
    getExamSetQuestionsController,
    submitExamResultController,
    getUserExamResultsController
} from '../controllers/specialExam.controller';
import {
    checkPYQAccessController,
    getPYQDownloadController,
    getPYQWatermarkedDownloadController
} from '../controllers/pyq.controller';
import {
    purchasePremiumAccessController,
    getUserPremiumAccessController
} from '../controllers/premiumAccess.controller';
import {
    getTopicsBySubjectController,
    getTopicPDFController,
    getTopicProgressController,
    markVideoCompletedController,
    getTopicMaterialsController
} from '../controllers/topic.controller';

const router = Router();

// All student routes require authentication
router.use(requireAuth);

// Subjects & Topics
router.get('/subjects/:subjectId/topics', getTopicsBySubjectController);
router.get('/topics/:topicId/materials', getTopicMaterialsController);
router.get('/topics/:topicId/pdf', getTopicPDFController);
router.get('/topics/:topicId/progress', getTopicProgressController);
router.post('/topics/:topicId/complete', markVideoCompletedController);

// Student Exam Routes (Topic/Question Sets)
import { getStudentQuestionsController, submitStudentExamResultController, getStudentQuestionSetDetailsController, getStudentExamHistoryController, getStudentExamResultDetailController } from '../controllers/topic.controller';
router.get('/question-sets/:setId/details', getStudentQuestionSetDetailsController);
router.get('/question-sets/:setId/questions', getStudentQuestionsController);
router.post('/question-sets/:setId/submit', submitStudentExamResultController);
router.get('/history', getStudentExamHistoryController);
router.get('/history/:resultId', getStudentExamResultDetailController);

// Premium Access
router.get('/premium-access', getUserPremiumAccessController);
router.post('/premium-access/purchase', purchasePremiumAccessController);

// Special Exams
router.get('/special-exams/:id/access', checkExamAccessController);
router.get('/special-exams/:examId/sets/:setNumber/questions', getExamSetQuestionsController);
router.post('/special-exams/:examId/sets/:setNumber/result', submitExamResultController);
router.get('/special-exams/:examId/results', getUserExamResultsController);

// PYQ
router.get('/pyq/:id/access', checkPYQAccessController);
router.get('/pyq/:id/download', getPYQDownloadController);
router.get('/pyq/:id/download-watermarked', getPYQWatermarkedDownloadController);

export default router;

