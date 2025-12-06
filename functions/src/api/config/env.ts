// Firebase Functions environment configuration
import * as functions from 'firebase-functions';

const config = functions.config();

export default {
    NODE_ENV: 'production',
    PORT: 8080,

    // Supabase
    SUPABASE_URL: config.supabase?.url || process.env.SUPABASE_URL || '',
    SUPABASE_ANON_KEY: config.supabase?.anon_key || process.env.SUPABASE_ANON_KEY || '',
    SUPABASE_SERVICE_ROLE_KEY: config.supabase?.service_key || process.env.SUPABASE_SERVICE_ROLE_KEY || '',

    // JWT
    JWT_SECRET: config.jwt?.secret || process.env.JWT_SECRET || 'dev-secret',
    JWT_REFRESH_SECRET: config.jwt?.refresh_secret || process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    JWT_ACCESS_EXPIRY: '15m',
    JWT_REFRESH_EXPIRY: '30d',

    // Email
    EMAIL_USER: config.email?.user || process.env.EMAIL_USER || '',
    EMAIL_PASS: config.email?.pass || process.env.EMAIL_PASS || '',
};
