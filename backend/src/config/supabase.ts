import { createClient } from '@supabase/supabase-js';
import env from './env';

// Supabase Admin Client (has full database access via service role key)
// NEVER expose this to frontend
export const supabaseAdmin = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

export default supabaseAdmin;
