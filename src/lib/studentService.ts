import { getAccessToken } from './apiService';

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
}

interface TopicProgress {
    is_video_completed: boolean;
    completed_at: string | null;
    last_watched_position: number;
}

const getHeaders = () => {
    const token = getAccessToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const studentService = {
    getTopicsBySubject: async (subjectId: string): Promise<Topic[]> => {
        const response = await fetch(`${API_URL}/api/student/subjects/${subjectId}/topics`, {
            method: 'GET',
            headers: getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch topics');
        }

        return response.json();
    },

    getTopicProgress: async (topicId: string): Promise<TopicProgress | null> => {
        const response = await fetch(`${API_URL}/api/student/topics/${topicId}/progress`, {
            method: 'GET',
            headers: getHeaders(),
        });

        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error('Failed to fetch topic progress');
        }

        return response.json();
    },

    markVideoCompleted: async (topicId: string): Promise<void> => {
        const response = await fetch(`${API_URL}/api/student/topics/${topicId}/complete`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({}),
        });

        if (!response.ok) {
            throw new Error('Failed to mark video as completed');
        }
    }
};
