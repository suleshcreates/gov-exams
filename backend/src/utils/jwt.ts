import jwt from 'jsonwebtoken';
import env from '../config/env';

interface JWTPayload {
    userId: string;
    email: string;
    type: 'access' | 'refresh';
    sessionId?: string; // Link token to specific session
}


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


export function verifyToken(token: string): JWTPayload {
    return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
}

export function verifyRefreshToken(token: string): JWTPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JWTPayload;
}


export function generateTokenPair(userId: string, email: string, sessionId?: string) {
    return {
        accessToken: generateAccessToken(userId, email, sessionId),
        refreshToken: generateRefreshToken(userId, email, sessionId),
        expiresIn: 900, // 15 minutes in seconds
    };
}

// Admin tokens with very long expiry (no frequent re-login needed)
export function generateAdminTokenPair(userId: string, email: string, sessionId?: string) {
    const payload: JWTPayload = {
        userId,
        email,
        type: 'access',
        sessionId,
    };

    const refreshPayload: JWTPayload = {
        userId,
        email,
        type: 'refresh',
        sessionId,
    };

    return {
        accessToken: jwt.sign(payload, env.JWT_SECRET, {
            expiresIn: '365d',
        } as jwt.SignOptions) as string,
        refreshToken: jwt.sign(refreshPayload, env.JWT_REFRESH_SECRET, {
            expiresIn: '365d',
        } as jwt.SignOptions) as string,
        expiresIn: 365 * 24 * 60 * 60, // 1 year in seconds
    };
}

export default {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    verifyRefreshToken,
    generateTokenPair,
    generateAdminTokenPair,
};
