export interface UsernameValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate username format
 * - 3-20 characters
 * - Alphanumeric and underscores only
 * - Cannot start or end with underscore
 * - Cannot have consecutive underscores
 */
export const validateUsername = (username: string): UsernameValidationResult => {
  // Check length
  if (username.length < 3) {
    return {
      isValid: false,
      error: 'Username must be at least 3 characters long'
    };
  }
  
  if (username.length > 20) {
    return {
      isValid: false,
      error: 'Username must be 20 characters or less'
    };
  }
  
  // Check format (alphanumeric and underscores only)
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      isValid: false,
      error: 'Username can only contain letters, numbers, and underscores'
    };
  }
  
  // Cannot start or end with underscore
  if (username.startsWith('_') || username.endsWith('_')) {
    return {
      isValid: false,
      error: 'Username cannot start or end with underscore'
    };
  }
  
  // Cannot have consecutive underscores
  if (username.includes('__')) {
    return {
      isValid: false,
      error: 'Username cannot have consecutive underscores'
    };
  }
  
  return { isValid: true };
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): UsernameValidationResult => {
  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      error: 'Email is required'
    };
  }
  
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }
  
  // Check email length
  if (email.length > 255) {
    return {
      isValid: false,
      error: 'Email is too long'
    };
  }
  
  return { isValid: true };
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): UsernameValidationResult => {
  if (!password || password.length < 6) {
    return {
      isValid: false,
      error: 'Password must be at least 6 characters long'
    };
  }
  
  if (password.length > 72) {
    return {
      isValid: false,
      error: 'Password is too long (max 72 characters)'
    };
  }
  
  return { isValid: true };
};

/**
 * Format username for display (lowercase)
 */
export const formatUsername = (username: string): string => {
  return username.toLowerCase().trim();
};

/**
 * Check if identifier is email or username
 */
export const isEmail = (identifier: string): boolean => {
  return identifier.includes('@');
};
