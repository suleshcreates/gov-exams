import { Request } from 'express';

// Extend Express Request type to include user
export interface AuthRequest extends Request {
    user?: Student;
}

// Database types matching Supabase schema
export interface Student {
    phone: string;
    name: string;
    email: string;
    username: string;
    auth_user_id: string;
    password_hash: string;
    is_verified: boolean;
    email_verified: boolean;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}

export interface Admin {
    email: string;
    password_hash: string;
    created_at: string;
}

export interface Session {
    id: string;
    user_id: string;
    refresh_token_hash: string;
    user_agent?: string;
    ip_address?: string;
    created_at: string;
    expires_at: string;
    last_used_at: string;
}

export interface UserPlan {
    id: string;
    student_phone: string;
    student_name?: string;
    plan_id?: string;
    plan_name?: string;
    price_paid: number;
    exam_ids: string[];
    purchased_at: string;
    expires_at?: string;
}

export interface ExamResult {
    id: string;
    student_phone: string;
    exam_id: string;
    exam_title: string;
    set_id: string;
    set_number: number;
    score: number;
    total_questions: number;
    accuracy: number;
    time_taken: string;
    user_answers: any[];
    created_at: string;
}

// API Request/Response types
export interface SignupRequest {
    name: string;
    email: string;
    username: string;
    phone: string;
    password: string;
}

export interface LoginRequest {
    identifier: string; // email or username
    password: string;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// All types exported above individually
