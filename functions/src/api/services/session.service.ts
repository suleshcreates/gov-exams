import { supabaseAdmin } from '../config/supabase';
import logger from '../utils/logger';
import { Session } from '../types';

/**
 * Create a new session in the database
 */
export async function createSession(
    userId: string,
    refreshTokenHash: string,
    userAgent?: string,
    ipAddress?: string
): Promise<Session | null> {
    try {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

        const { data, error } = await supabaseAdmin
            .from('sessions')
            .insert({
                user_id: userId,
                refresh_token_hash: refreshTokenHash,
                user_agent: userAgent,
                ip_address: ipAddress,
                expires_at: expiresAt.toISOString(),
            })
            .select()
            .single();

        if (error) {
            logger.error('Error creating session:', error);
            return null;
        }

        return data as Session;
    } catch (error) {
        logger.error('Exception in createSession:', error);
        return null;
    }
}

/**
 * Find session by refresh token hash
 */
export async function findSession(
    refreshTokenHash: string
): Promise<Session | null> {
    try {
        const { data, error } = await supabaseAdmin
            .from('sessions')
            .select('*')
            .eq('refresh_token_hash', refreshTokenHash)
            .single();

        if (error) {
            return null;
        }

        return data as Session;
    } catch (error) {
        logger.error('Exception in findSession:', error);
        return null;
    }
}

/**
 * Update session last_used_at timestamp
 */
export async function updateSessionUsage(sessionId: string): Promise<boolean> {
    try {
        const { error } = await supabaseAdmin
            .from('sessions')
            .update({ last_used_at: new Date().toISOString() })
            .eq('id', sessionId);

        return !error;
    } catch (error) {
        logger.error('Exception in updateSessionUsage:', error);
        return false;
    }
}

/**
 * Delete a specific session (logout)
 */
export async function deleteSession(sessionId: string): Promise<boolean> {
    try {
        const { error } = await supabaseAdmin
            .from('sessions')
            .delete()
            .eq('id', sessionId);

        return !error;
    } catch (error) {
        logger.error('Exception in deleteSession:', error);
        return false;
    }
}

/**
 * Delete all sessions for a user (logout from all devices)
 */
export async function deleteAllUserSessions(userId: string): Promise<boolean> {
    try {
        const { error } = await supabaseAdmin
            .from('sessions')
            .delete()
            .eq('user_id', userId);

        return !error;
    } catch (error) {
        logger.error('Exception in deleteAllUserSessions:', error);
        return false;
    }
}

/**
 * Delete expired sessions (cleanup job)
 */
export async function cleanupExpiredSessions(): Promise<number> {
    try {
        const { data, error } = await supabaseAdmin
            .from('sessions')
            .delete()
            .lt('expires_at', new Date().toISOString())
            .select();

        if (error) {
            logger.error('Error cleaning up expired sessions:', error);
            return 0;
        }

        const deletedCount = data ? data.length : 0;
        logger.info(`Cleaned up ${deletedCount} expired sessions`);
        return deletedCount;
    } catch (error) {
        logger.error('Exception in cleanupExpiredSessions:', error);
        return 0;
    }
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId: string): Promise<Session[]> {
    try {
        const { data, error } = await supabaseAdmin
            .from('sessions')
            .select('*')
            .eq('user_id', userId)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false });

        if (error) {
            logger.error('Error fetching user sessions:', error);
            return [];
        }

        return (data as Session[]) || [];
    } catch (error) {
        logger.error('Exception in getUserSessions:', error);
        return [];
    }
}

export default {
    createSession,
    findSession,
    updateSessionUsage,
    deleteSession,
    deleteAllUserSessions,
    cleanupExpiredSessions,
    getUserSessions,
};
