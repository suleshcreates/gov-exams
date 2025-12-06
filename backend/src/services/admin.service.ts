import { supabaseAdmin } from '../config/supabase';
import { generateTokenPair } from '../utils/jwt';
import { createSession } from './session.service';
import logger from '../utils/logger';
import crypto from 'crypto';

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
 * Admin login with plain text password comparison
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

        // Simple password comparison (plain text)
        if (admin.password_hash !== password) {
            logger.warn(`Admin login attempt with incorrect password: ${email}`);
            return {
                success: false,
                error: 'Invalid credentials',
            };
        }

        // Generate JWT tokens (use admin.id as user_id)
        const tokens = generateTokenPair(admin.id, admin.email);

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
