/**
 * API Service for Backend Communication
 * All API calls to the Node.js backend go through this service
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Store tokens in localStorage
 */
export function setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * Get access token from localStorage
 */
export function getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Get refresh token from localStorage
 */
export function getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Clear all tokens (logout)
 */
export function clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    try {
        const response = await fetch(`${API_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!response.ok) {
            // Refresh token expired or invalid
            clearTokens();
            return null;
        }

        const data = await response.json();
        if (data.success && data.access_token) {
            localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
            return data.access_token;
        }

        return null;
    } catch (error) {
        console.error('Error refreshing token:', error);
        clearTokens();
        return null;
    }
}

/**
 * Make authenticated API request with automatic token refresh
 */
async function authenticatedFetch(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    let accessToken = getAccessToken();

    // Add authorization header
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };

    // Make request
    let response = await fetch(url, { ...options, headers });

    // If 401 and we have refresh token, try refreshing
    if (response.status === 401) {
        const newAccessToken = await refreshAccessToken();

        if (newAccessToken) {
            // Retry with new access token
            headers.Authorization = `Bearer ${newAccessToken}`;
            response = await fetch(url, { ...options, headers });
        }
    }

    return response;
}


// ==================== AUTH ENDPOINTS ====================

/**
 * Request OTP for email verification
 */
export async function requestOTP(email: string, name: string) {
    const response = await fetch(`${API_URL}/api/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
    });

    return response.json();
}

/**
 * Verify OTP and complete signup
 */
export async function verifyOTPAndSignup(
    email: string,
    otp: string,
    signupData: {
        name: string;
        email: string;
        username: string;
        phone: string;
        password: string;
    }
) {
    const response = await fetch(`${API_URL}/api/auth/verify-otp-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, signupData }),
    });

    const result = await response.json();

    if (result.success && result.session) {
        setTokens(result.session.access_token, result.session.refresh_token);
    }

    return result;
}

/**
 * Direct signup (legacy - use OTP flow instead)
 */
export async function signup(data: {
    name: string;
    email: string;
    username: string;
    phone: string;
    password: string;
}) {
    console.log('=== FRONTEND SENDING ===', data);
    const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success && result.session) {
        setTokens(result.session.access_token, result.session.refresh_token);
    }

    return result;
}


export async function login(identifier: string, password: string) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
    });

    const result = await response.json();

    if (result.success && result.session) {
        setTokens(result.session.access_token, result.session.refresh_token);
    }

    return result;
}

export async function logout() {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
        try {
            await fetch(`${API_URL}/api/auth/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    clearTokens();
}

export async function logoutAll() {
    const response = await authenticatedFetch(`${API_URL}/api/auth/logout-all`, {
        method: 'POST',
    });

    clearTokens();
    return response.json();
}

// ==================== USER ENDPOINTS ====================

export async function getProfile() {
    const response = await authenticatedFetch(`${API_URL}/api/user/profile`);
    return response.json();
}

export async function updateProfile(data: {
    name?: string;
    phone?: string;
    username?: string;
}) {
    const response = await authenticatedFetch(`${API_URL}/api/user/profile`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    return response.json();
}

export async function getUserPlans() {
    const response = await authenticatedFetch(`${API_URL}/api/user/plans`);
    return response.json();
}

export async function getActivePlans() {
    const response = await authenticatedFetch(`${API_URL}/api/user/plans/active`);
    return response.json();
}

export async function getExamHistory() {
    const response = await authenticatedFetch(`${API_URL}/api/user/exam-history`);
    return response.json();
}

export async function getExamProgress(examId: string) {
    const response = await authenticatedFetch(
        `${API_URL}/api/user/exam-progress/${examId}`
    );
    return response.json();
}

// ==================== HELPER FUNCTIONS ====================

export function isAuthenticated(): boolean {
    return !!getAccessToken();
}

/**
 * Reset password for user
 */
export async function resetPassword(email: string, newPassword: string) {
    const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
    });

    return response.json();
}

export default {
    signup,
    login,
    logout,
    logoutAll,
    getProfile,
    updateProfile,
    getUserPlans,
    getActivePlans,
    getExamHistory,
    getExamProgress,
    isAuthenticated,
    setTokens,
    getAccessToken,
    getRefreshToken,
    clearTokens,
    resetPassword,
};
