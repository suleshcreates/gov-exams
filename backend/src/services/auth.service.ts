import { supabaseAdmin } from '../config/supabase';
import { hashPassword, comparePassword } from '../utils/password';
import { generateTokenPair } from '../utils/jwt';
import { createSession } from './session.service';
import logger from '../utils/logger';
import { SignupRequest, LoginRequest } from '../types';
import crypto from 'crypto';

/**
 * Create hash of refresh token for secure storage
 */
function hashRefreshToken(refreshToken: string): string {
    return crypto.createHash('sha256').update(refreshToken).digest('hex');
}

/**
 * Check if email is already taken
 */
export async function isEmailTaken(email: string): Promise<boolean> {
    const { data } = await supabaseAdmin
        .from('students')
        .select('email')
        .eq('email', email)
        .single();

    return !!data;
}

/**
 * Check if username is already taken
 */
export async function isUsernameTaken(username: string): Promise<boolean> {
    const { data } = await supabaseAdmin
        .from('students')
        .select('username')
        .eq('username', username)
        .single();

    return !!data;
}


export async function isPhoneTaken(phone: string): Promise<boolean> {
    const { data } = await supabaseAdmin
        .from('students')
        .select('phone')
        .eq('phone', phone)
        .single();

    return !!data;
}


export async function signup(
    signupData: SignupRequest,
    userAgent?: string,
    ipAddress?: string
) {
    const { name, email, username, phone, password } = signupData;

    try {
        const [usernameExists, phoneExists] = await Promise.all([
            isUsernameTaken(username),
            isPhoneTaken(phone),
        ]);

        if (usernameExists) {
            return {
                success: false,
                error: 'Username already taken',
            };
        }

        if (phoneExists) {
            return {
                success: false,
                error: 'Phone number already registered',
            };
        }

        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: {
                name,
                username,
            },
        });

        if (authError) {
            logger.error('Error creating Supabase Auth user:', authError);

            if (authError.message?.includes('already been registered')) {
                return {
                    success: false,
                    error: 'Email already registered. Please login or use forgot password.',
                };
            }

            return {
                success: false,
                error: 'Failed to create user account',
            };
        }

        if (!authData.user) {
            logger.error('No user data returned from auth');
            return {
                success: false,
                error: 'Failed to create user account',
            };
        }

        const authUserId = authData.user.id;
        const passwordHash = await hashPassword(password);

        logger.info(`Updating OTP record for: ${email}`);
        const { data: student, error: updateError } = await supabaseAdmin
            .from('students')
            .update({
                auth_user_id: authUserId,
                name,
                username,
                phone,
                password_hash: passwordHash,
                is_verified: true,
                email_verified: true,
                verification_code: null,
                verification_code_expires: null,
            })
            .eq('email', email)
            .select()
            .single();

        if (updateError || !student) {
            logger.error('Error updating student profile:', updateError);
            await supabaseAdmin.auth.admin.deleteUser(authUserId);
            return {
                success: false,
                error: 'Failed to create user profile',
            };
        }

        const tokens = generateTokenPair(authUserId, email);

        const { deleteAllUserSessions } = await import('./session.service');
        await deleteAllUserSessions(authUserId);
        logger.info(`[Single Device] Cleared existing sessions for: ${email}`);

        const refreshTokenHash = hashRefreshToken(tokens.refreshToken);
        const session = await createSession(authUserId, refreshTokenHash, userAgent, ipAddress);

        if (!session) {
            logger.warn('Failed to create session for new user');
        }

        logger.info(`New user signed up: ${email}`);

        return {
            success: true,
            session: {
                access_token: tokens.accessToken,
                refresh_token: tokens.refreshToken,
                expires_in: tokens.expiresIn,
            },
            user: {
                id: student.auth_user_id,
                email: student.email,
                username: student.username,
                name: student.name,
                phone: student.phone,
            },
        };
    } catch (error: any) {
        logger.error('Exception in signup:', error);
        return {
            success: false,
            error: 'An error occurred during signup',
        };
    }
}


export async function login(
    loginData: LoginRequest,
    userAgent?: string,
    ipAddress?: string
) {
    const { identifier, password } = loginData;

    try {
        const { data: student, error } = await supabaseAdmin
            .from('students')
            .select('*')
            .or(`email.eq.${identifier},username.eq.${identifier}`)
            .single();

        if (error || !student) {
            return {
                success: false,
                error: 'Invalid credentials',
            };
        }

        const isValidPassword = await comparePassword(password, student.password_hash);

        if (!isValidPassword) {
            return {
                success: false,
                error: 'Invalid credentials',
            };
        }

        const { deleteAllUserSessions } = await import('./session.service');
        await deleteAllUserSessions(student.auth_user_id);
        logger.info(`[Single Device] Cleared existing sessions for: ${student.email}`);

        const tempSession = await createSession(
            student.auth_user_id,
            userAgent || '',
            ipAddress
        );

        if (!tempSession) {
            logger.error('Failed to create session for login');
            return {
                success: false,
                error: 'Failed to create session',
            };
        }

        const tokens = generateTokenPair(
            student.auth_user_id,
            student.email,
            tempSession.id // Link tokens to this specific session
        );

        // Update session with actual refresh token hash
        const refreshTokenHash = hashRefreshToken(tokens.refreshToken);
        await supabaseAdmin
            .from('sessions')
            .update({ refresh_token_hash: refreshTokenHash })
            .eq('id', tempSession.id);

        logger.info(`User logged in: ${student.email}, Session ID: ${tempSession.id}`);

        return {
            success: true,
            session: {
                access_token: tokens.accessToken,
                refresh_token: tokens.refreshToken,
                expires_in: tokens.expiresIn,
            },
            user: {
                id: student.auth_user_id,
                email: student.email,
                username: student.username,
                name: student.name,
                phone: student.phone,
            },
        };
    } catch (error: any) {
        logger.error('Exception in login:', error);
        return {
            success: false,
            error: 'An error occurred during login',
        };
    }
}

export default {
    signup,
    login,
    isEmailTaken,
    isUsernameTaken,
    isPhoneTaken,
};
