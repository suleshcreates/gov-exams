/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate Indian phone number (10 digits starting with 6-9)
 */
export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
}

/**
 * Validate username (3-20 alphanumeric characters, can include underscore)
 */
export function isValidUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
}

/**
 * Validate password strength (min 6 characters)
 */
export function isValidPassword(password: string): boolean {
    return password.length >= 6;
}

/**
 * Sanitize string to prevent XSS
 */
export function sanitizeString(str: string): string {
    return str.replace(/[<>]/g, '');
}

export default {
    isValidEmail,
    isValidPhone,
    isValidUsername,
    isValidPassword,
    sanitizeString,
};
