import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL and Anon Key are required. Please add them to your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'govexams-auth',
    flowType: 'pkce',
    debug: import.meta.env.DEV // Enable debug logs in development
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-client-info': 'supabase-js-web'
    }
  }
});

// Log session status on initialization (dev only)
if (import.meta.env.DEV) {
  supabase.auth.getSession().then(({ data: { session } }) => {
    console.log('[Supabase] Initial session check:', session ? 'Session exists' : 'No session');
  });
}

// Database Types
export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          phone: string;
          name: string;
          password_hash: string;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          phone: string;
          name: string;
          password_hash: string;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          phone?: string;
          name?: string;
          password_hash?: string;
          is_verified?: boolean;
          updated_at?: string;
        };
      };
      otp_verifications: {
        Row: {
          id: string;
          phone: string;
          otp_code: string;
          expires_at: string;
          is_used: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          phone: string;
          otp_code: string;
          expires_at: string;
          is_used?: boolean;
          created_at?: string;
        };
        Update: {
          is_used?: boolean;
        };
      };
      exam_results: {
        Row: {
          id: string;
          student_phone: string;
          student_name: string;
          exam_id: string;
          exam_title: string;
          set_id: string;
          set_number: number;
          score: number;
          total_questions: number;
          accuracy: number;
          time_taken: string;
          user_answers: number[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_phone: string;
          student_name: string;
          exam_id: string;
          exam_title: string;
          set_id: string;
          set_number: number;
          score: number;
          total_questions: number;
          accuracy: number;
          time_taken: string;
          user_answers?: number[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_phone?: string;
          student_name?: string;
          exam_id?: string;
          exam_title?: string;
          set_id?: string;
          set_number?: number;
          score?: number;
          total_questions?: number;
          accuracy?: number;
          time_taken?: string;
          user_answers?: number[] | null;
        };
      };
      exam_progress: {
        Row: {
          id: string;
          student_phone: string;
          student_name: string;
          exam_id: string;
          completed_set_number: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_phone: string;
          student_name: string;
          exam_id: string;
          completed_set_number: number;
          updated_at?: string;
        };
        Update: {
          completed_set_number?: number;
          student_name?: string;
          updated_at?: string;
        };
      };
      user_plans: {
        Row: {
          id: string;
          student_phone: string;
          student_name: string;
          plan_id: string;
          plan_name: string;
          price_paid: number;
          exam_ids: string[];
          purchased_at: string;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_phone: string;
          student_name: string;
          plan_id: string;
          plan_name: string;
          price_paid: number;
          exam_ids: string[];
          purchased_at?: string;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          is_active?: boolean;
          expires_at?: string | null;
        };
      };
    };
  };
}

