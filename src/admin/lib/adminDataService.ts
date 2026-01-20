// Admin API Service - calls backend admin endpoints
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Get admin access token from localStorage
 */
function getAdminToken(): string | null {
    return localStorage.getItem('admin_access_token');
}

/**
 * Get dashboard statistics
 */
export async function getAdminStats() {
    try {
        const token = getAdminToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_URL}/api/admin/stats`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('[AdminAPI] Get stats error:', error);
        return { success: false, error: 'Failed to get statistics' };
    }
}

/**
 * Get all students
 */
export async function getAdminStudents() {
    try {
        const token = getAdminToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_URL}/api/admin/students`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('[AdminAPI] Get students error:', error);
        return { success: false, error: 'Failed to get students' };
    }
}

/**
 * Get all plans
 */
export async function getAdminPlans() {
    try {
        const token = getAdminToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_URL}/api/admin/plans`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('[AdminAPI] Get plans error:', error);
        return { success: false, error: 'Failed to get plans' };
    }
}

/**
 * Get all exam results
 */
export async function getAdminResults() {
    try {
        const token = getAdminToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_URL}/api/admin/results`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('[AdminAPI] Get results error:', error);
        return { success: false, error: 'Failed to get exam results' };
    }
}

export default {
    getAdminStats,
    getAdminStudents,
    getAdminPlans,
    getAdminResults,
};
