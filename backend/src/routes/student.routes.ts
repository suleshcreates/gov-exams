import { Router } from 'express';
import {
    getTopicsBySubjectController,
    getTopicProgressController,
    markVideoCompletedController
} from '../controllers/topic.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

// Topic fetch (Students can view topics for a subject)
router.get('/subjects/:subjectId/topics', getTopicsBySubjectController);

// Topic Progress
router.get('/topics/:topicId/progress', getTopicProgressController);
router.post('/topics/:topicId/complete', markVideoCompletedController);

export default router;
