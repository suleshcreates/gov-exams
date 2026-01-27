import { authenticatedFetch } from './apiService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface Topic {
    id: string;
    subject_id: string;
    title: string;
    description: string;
    video_url: string;
    video_duration: number;
    order_index: number;
    is_active: boolean;
    pdf_url?: string;
}

interface TopicProgress {
    is_video_completed: boolean;
    completed_at: string | null;
    last_watched_position: number;
}



export const studentService = {
    getTopicsBySubject: async (subjectId: string): Promise<Topic[]> => {
        const response = await authenticatedFetch(`${API_URL}/api/student/subjects/${subjectId}/topics`);

        if (!response.ok) {
            throw new Error('Failed to fetch topics');
        }

        return response.json();
    },

    getTopicProgress: async (topicId: string): Promise<TopicProgress | null> => {
        const response = await authenticatedFetch(`${API_URL}/api/student/topics/${topicId}/progress`);

        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error('Failed to fetch topic progress');
        }

        return response.json();
    },

    markVideoCompleted: async (topicId: string): Promise<void> => {
        const response = await authenticatedFetch(`${API_URL}/api/student/topics/${topicId}/complete`, {
            method: 'POST',
            body: JSON.stringify({}),
        });

        if (!response.ok) {
            throw new Error('Failed to mark video as completed');
        }
    },

    getTopicPdfUrl: async (topicId: string): Promise<string> => {
        const response = await authenticatedFetch(`${API_URL}/api/student/topics/${topicId}/pdf`);

        if (!response.ok) {
            throw new Error('Failed to fetch PDF URL');
        }

        const data = await response.json();
        return data.downloadUrl;
    },

    getQuestions: async (setId: string): Promise<any[]> => {
        const response = await authenticatedFetch(`${API_URL}/api/student/question-sets/${setId}/questions`);

        if (!response.ok) {
            throw new Error('Failed to fetch questions');
        }

        return response.json();
    },

    submitExamResult: async (setId: string, resultData: any): Promise<any> => {
        const response = await authenticatedFetch(`${API_URL}/api/student/question-sets/${setId}/submit`, {
            method: 'POST',
            body: JSON.stringify(resultData),
        });

        if (!response.ok) {
            throw new Error('Failed to submit exam result');
        }

        return response.json();
    },

    getQuestionSetDetails: async (setId: string): Promise<any> => {
        const response = await authenticatedFetch(`${API_URL}/api/student/question-sets/${setId}/details`);

        if (!response.ok) {
            throw new Error('Failed to fetch question set details');
        }

        return response.json();
    },

    getExamHistory: async (): Promise<any[]> => {
        const response = await authenticatedFetch(`${API_URL}/api/student/history`);

        if (!response.ok) {
            throw new Error('Failed to fetch exam history');
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            console.error("History response is not an array:", data);
            throw new Error('Invalid history response format');
        }

        return data;
    },

    getExamResultDetail: async (resultId: string): Promise<any> => {
        const response = await authenticatedFetch(`${API_URL}/api/student/history/${resultId}`);

        if (!response.ok) {
            throw new Error('Failed to fetch exam result details');
        }

        return response.json();
    },

    getTopicMaterials: async (topicId: string): Promise<any[]> => {
        try {
            const response = await authenticatedFetch(`${API_URL}/api/student/topics/${topicId}/materials`);
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            return [];
        }
    },

    submitSpecialExamResult: async (examId: string, setNumber: number, resultData: any): Promise<any> => {
        const response = await authenticatedFetch(`${API_URL}/api/student/special-exams/${examId}/sets/${setNumber}/result`, {
            method: 'POST',
            body: JSON.stringify(resultData),
        });

        if (!response.ok) {
            throw new Error('Failed to submit special exam result');
        }

        return response.json();
    },

    getSpecialExamResults: async (examId: string): Promise<any[]> => {
        const response = await authenticatedFetch(`${API_URL}/api/student/special-exams/${examId}/results`);

        if (!response.ok) {
            throw new Error('Failed to fetch special exam results');
        }

        return response.json();
    }
};
