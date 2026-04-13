import { supabaseAdmin } from '../config/supabase';
import { generateAdminTokenPair } from '../utils/jwt';
import { createSession } from './session.service';
import logger from '../utils/logger';
import crypto from 'crypto';
import { comparePassword } from '../utils/password';

/**
 * Create hash of refresh token for secure storage
 */
function hashRefreshToken(refreshToken: string): string {
    return crypto.createHash('sha256').update(refreshToken).digest('hex');
}

/**
 * Get admin by email
 */
export async function getAdminByEmail(email: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from('admins')
            .select('*')
            .eq('email', email)
            .single();

        if (error) {
            return null;
        }

        return data;
    } catch (error) {
        logger.error('Exception in getAdminByEmail:', error);
        return null;
    }
}

/**
 * Check if user is admin
 */
export async function isAdmin(email: string): Promise<boolean> {
    const admin = await getAdminByEmail(email);
    return !!admin;
}

/**
 * Admin login
 */
export async function adminLogin(
    email: string,
    password: string,
    userAgent?: string,
    ipAddress?: string
) {
    try {
        // Find admin by email
        const admin = await getAdminByEmail(email);

        if (!admin) {
            logger.warn(`Admin login attempt with non-existent email: ${email}`);
            return {
                success: false,
                error: 'Invalid credentials',
            };
        }

        // Compare password using bcrypt (wrapped in try/catch because bcrypt throws if hash is invalid)
        let isValidPassword = false;
        try {
            isValidPassword = await comparePassword(password, admin.password_hash);
        } catch (e) {
            // Hash was probably not a bcrypt string (e.g. plain text pass@123)
            isValidPassword = false;
        }

        // Fallback for transition: if bcrypt fails, try plain text match
        // (Helpful if the DB still has 'pass@123' in plain text until it's updated)
        let passwordMatches = isValidPassword;
        if (!isValidPassword && admin.password_hash === password) {
            passwordMatches = true;
            logger.warn(`Admin ${email} is still using a plain text password!`);
        }

        if (!passwordMatches) {
            logger.warn(`Admin login attempt with incorrect password: ${email}`);
            return {
                success: false,
                error: 'Invalid credentials',
            };
        }

        // Generate JWT tokens (use admin.id as user_id)
        const tokens = generateAdminTokenPair(admin.id, admin.email);

        // SINGLE DEVICE ENFORCEMENT: Delete all existing sessions for this admin
        const { deleteAllUserSessions } = await import('./session.service');
        await deleteAllUserSessions(admin.id);
        logger.info(`[Single Device] Cleared existing admin sessions for: ${email}`);

        // Store new session
        const refreshTokenHash = hashRefreshToken(tokens.refreshToken);
        const session = await createSession(admin.id, refreshTokenHash, userAgent, ipAddress);

        if (!session) {
            logger.warn('Failed to create session for admin login');
        }

        logger.info(`Admin logged in: ${email}`);

        return {
            success: true,
            session: {
                access_token: tokens.accessToken,
                refresh_token: tokens.refreshToken,
                expires_in: tokens.expiresIn,
            },
            user: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role || 'admin',
            },
        };
    } catch (error: any) {
        logger.error('Exception in adminLogin:', error);
        return {
            success: false,
            error: 'An error occurred during admin login',
        };
    }
}

export default {
    adminLogin,
    isAdmin,
    getAdminByEmail,
};
