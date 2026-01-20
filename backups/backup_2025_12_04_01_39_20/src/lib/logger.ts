/**
 * Logger Utility
 * 
 * Centralized logging system that:
 * - Only logs to console in development
 * - Prevents console pollution in production
 * - Provides structured logging levels
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
    /**
     * Debug level - only in development
     * Use for detailed debugging information
     */
    debug: (...args: any[]) => {
        if (isDevelopment) {
            console.log('[DEBUG]', ...args);
        }
    },

    /**
     * Info level - informational messages
     * Use for general information
     */
    info: (...args: any[]) => {
        if (isDevelopment) {
            console.info('[INFO]', ...args);
        }
    },

    /**
     * Warning level - always shown
     * Use for recoverable issues
     */
    warn: (...args: any[]) => {
        console.warn('[WARN]', ...args);
    },

    /**
     * Error level - always shown
     * Use for errors that need attention
     */
    error: (...args: any[]) => {
        console.error('[ERROR]', ...args);
    },

    /**
     * Log with custom prefix
     */
    log: (prefix: string, ...args: any[]) => {
        if (isDevelopment) {
            console.log(`[${prefix}]`, ...args);
        }
    }
};

// Export a default instance
export default logger;
