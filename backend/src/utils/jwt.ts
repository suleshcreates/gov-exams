import jwt from 'jsonwebtoken';
import env from '../config/env';

interface JWTPayload {
    userId: string;
    email: string;
    type: 'access' | 'refresh';
    sessionId?: string; // Link token to specific session
}

/**
 * Generate access token (15 minutes)
 */
export function generateAccessToken(userId: string, email: string, sessionId?: string): string {
    const payload: JWTPayload = {
        userId,
        email,
        type: 'access',
        sessionId, // Include session ID to enforce single-device
    };

    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRY,
    } as jwt.SignOptions) as string;
}

/**
 * Generate refresh token (30 days)
 */
export function generateRefreshToken(userId: string, email: string, sessionId?: string): string {
    const payload: JWTPayload = {
        userId,
        email,
        type: 'refresh',
        sessionId, // Include session ID to enforce single-device
    };

    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRY,
    } as jwt.SignOptions) as string;
}
email,
    type: 'refresh',
    };

return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY,
} as jwt.SignOptions) as string;
}

/**
 * Verify any token and return decoded payload
 */
export function verifyToken(token: string): JWTPayload {
    return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(userId: string, email: string, sessionId?: string) {
    return {
        accessToken: generateAccessToken(userId, email, sessionId),
        refreshToken: generateRefreshToken(userId, email, sessionId),
        expiresIn: 900, // 15 minutes in seconds
    };
}

export default {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    generateTokenPair,
};
