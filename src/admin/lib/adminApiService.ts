// Use Vite environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Admin login via backend API
 */
export async function adminLogin(email: string, password: string) {
    try {
        const response = await fetch(`${API_URL}/api/auth/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: result.error || 'Admin login failed',
            };
        }

        // Store JWT tokens in localStorage
        if (result.success && result.session) {
            localStorage.setItem('admin_access_token', result.session.access_token);
            localStorage.setItem('admin_refresh_token', result.session.refresh_token);
            localStorage.setItem('admin_user', JSON.stringify(result.user));
        }

        return result;
    } catch (error) {
        console.error('[AdminAPI] Login error:', error);
        return {
            success: false,
            error: 'Network error during admin login',
        };
    }
}

/**
 * Admin logout
 */
export async function adminLogout() {
    try {
        const accessToken = localStorage.getItem('admin_access_token');

        if (accessToken) {
            await fetch(`${API_URL}/api/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                credentials: 'include',
            });
        }

        // Clear local storage
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_refresh_token');
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_session');

        return { success: true };
    } catch (error) {
        console.error('[AdminAPI] Logout error:', error);
        // Clear local storage anyway
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_refresh_token');
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_session');

        return { success: true };
    }
}

/**
 * Check if admin is authenticated
 */
export function isAdminAuthenticated(): boolean {
    const accessToken = localStorage.getItem('admin_access_token');
    return !!accessToken;
}

/**
 * Get stored admin user
 */
export function getStoredAdminUser() {
    const userStr = localStorage.getItem('admin_user');
    if (!userStr) return null;

    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
}

export default {
    adminLogin,
    adminLogout,
    isAdminAuthenticated,
    getStoredAdminUser,
};
