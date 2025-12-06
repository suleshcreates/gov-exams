import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { supabaseService } from '@/lib/supabaseService';
import logger from '@/lib/logger';
import { generateOTP, sendOTPEmail, storeOTP, verifyOTP as verifyOTPCode, clearOTP } from '@/lib/emailService';

interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  phone: string;
  avatar_url: string | null;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

interface AuthContextType {
  auth: AuthState;
  signUp: (data: SignUpData) => Promise<void>;
  sendOTP: (email: string, name: string) => Promise<string>;
  verifyOTP: (email: string, otp: string) => { valid: boolean; message: string };
  signIn: (identifier: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
}

interface SignUpData {
  fullName: string;
  username: string;
  phone: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user profile from students table
  const loadUserProfile = async (phone: string) => {
    try {
      logger.debug('[AuthContext] Loading user profile for phone:', phone);

      const student = await supabaseService.getStudentByPhone(phone);

      if (student) {
        logger.debug('[AuthContext] User profile loaded:', student.email);
        setUser({
          id: student.phone,
          email: student.email,
          username: student.username || '',
          name: student.name,
          phone: student.phone,
          avatar_url: student.avatar_url
        });
      } else {
        logger.error('[AuthContext] No student found for phone:', phone);
        setUser(null);
      }
    } catch (error) {
      logger.error('[AuthContext] Error loading user profile:', error);
      setUser(null);
    }
  };

  // Initialize auth state from session storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        logger.debug('[AuthContext] Initializing auth...');

        const storedPhone = sessionStorage.getItem('auth_user_phone');

        if (storedPhone) {
          logger.debug('[AuthContext] Found stored session for phone:', storedPhone);
          await loadUserProfile(storedPhone);
        } else {
          logger.debug('[AuthContext] No active session found');
        }
      } catch (error) {
        logger.error('[AuthContext] Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Send OTP for email verification
  const sendOTP = async (email: string, name: string): Promise<string> => {
    try {
      logger.debug('[AuthContext] Generating and sending OTP to:', email);

      const otp = generateOTP();
      await sendOTPEmail(email, name, otp);
      storeOTP(email, otp, 5); // 5-minute expiry

      logger.debug('[AuthContext] OTP sent successfully');
      return otp; // Return for testing purposes (remove in production)
    } catch (error) {
      logger.error('[AuthContext] Error sending OTP:', error);
      throw new Error('Failed to send verification code. Please try again.');
    }
  };

  // Verify OTP
  const verifyOTP = (email: string, otp: string) => {
    logger.debug('[AuthContext] Verifying OTP for:', email);
    return verifyOTPCode(email, otp);
  };

  // Sign up new user
  // Sign up new user
  const signUp = async (data: SignUpData) => {
    try {
      logger.debug("[AuthContext] Creating new account for:", data.email);

      // 1️⃣ Hash password for STUDENTS table
      const encoder = new TextEncoder();
      const passwordData = encoder.encode(data.password);
      const hashBuffer = await crypto.subtle.digest("SHA-256", passwordData);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const password_hash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

      // 2️⃣ Create SUPABASE AUTH user (Client-side)
      // We use client-side auth to avoid Edge Function complexity
      let supabase_uid = null;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.fullName,
            username: data.username
          }
        }
      });

      if (authError) {
        // If user already exists, we proceed to try creating the profile anyway
        // The RPC function will look up the ID by email
        if (authError.message.includes("already registered") || authError.status === 422) {
          console.log("User exists in Auth, proceeding to profile creation...");
        } else {
          throw authError;
        }
      } else {
        supabase_uid = authData.user?.id;
      }

      // 3️⃣ Insert into students table using SMART RPC
      // If supabase_uid is null, the RPC will look it up by email
      const { data: rpcData, error: rpcError } = await supabase.rpc('create_student_profile', {
        p_auth_user_id: supabase_uid,
        p_name: data.fullName,
        p_email: data.email,
        p_phone: data.phone,
        p_username: data.username,
        p_password_hash: password_hash
      });

      if (rpcError) {
        console.error("RPC Error:", rpcError);
        throw rpcError;
      }

      if (rpcData && !rpcData.success) {
        console.error("RPC Failed:", rpcData);
        throw new Error(rpcData.error || 'Failed to create student profile');
      }

      // 4️⃣ Clear OTP
      clearOTP(data.email);

      // 5️⃣ Auto-Login if we don't have a session (e.g. user existed)
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.log("No session after signup, attempting auto-login...");
        await signIn(data.email, data.password);
      }

      logger.debug("[AuthContext] Signup completed successfully");
    } catch (error) {
      logger.error("[AuthContext] Signup error:", error);
      throw error;
    }
  };



  // Sign in with email/username and password
  const signIn = async (identifier: string, password: string) => {
    try {
      logger.debug('[AuthContext] Attempting login for:', identifier);

      // Hash the provided password with SHA-256
      const encoder = new TextEncoder();
      const passwordData = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const password_hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Use secure database function for login (protects password hash)
      const { data: students, error } = await supabase
        .rpc('verify_student_login', {
          identifier_input: identifier,
          password_hash_input: password_hash
        });

      if (error) {
        logger.error('[AuthContext] Login RPC error:', error);
        throw new Error('Invalid email/username or password');
      }

      if (!students || students.length === 0) {
        logger.error('[AuthContext] Invalid credentials');
        throw new Error('Invalid email/username or password');
      }

      const student = students[0];

      // 2️⃣ Create Supabase Auth Session (required for RLS)
      // We use the email from the student record found by the RPC
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: student.email,
        password: password
      });

      if (authError) {
        console.warn("Auth session creation failed, attempting sync...", authError);

        // 🔄 Fallback: Try to SYNC user (Create or Update password)
        const { error: syncError } = await supabase.functions.invoke('sync-user-auth', {
          body: {
            email: student.email,
            password: password,
            user_metadata: {
              name: student.name,
              username: student.username
            }
          }
        });

        if (syncError) {
          console.error("Sync failed:", syncError);
          throw new Error("Unable to sync account. Please contact support.");
        }

        // Retry login after sync
        const { error: retryError } = await supabase.auth.signInWithPassword({
          email: student.email,
          password: password
        });

        if (retryError) {
          console.error("Retry login failed:", retryError);
          throw new Error("Login failed after sync.");
        }
      }

      logger.debug('[AuthContext] Login + Supabase session complete');

      // Store session
      sessionStorage.setItem('auth_user_phone', student.phone);
      await loadUserProfile(student.phone);
    } catch (error: any) {
      logger.error('[AuthContext] Login error:', error);
      throw new Error('Invalid email/username or password');
    }
  };

  // Reset password
  const resetPassword = async (email: string, newPassword: string) => {
    try {
      logger.debug('[AuthContext] Resetting password for:', email);

      // Hash password with SHA-256
      const encoder = new TextEncoder();
      const passwordData = encoder.encode(newPassword);
      const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const password_hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Update password in database
      await supabaseService.updateStudentPassword(email, password_hash);

      logger.debug('[AuthContext] Password reset successful');
    } catch (error: any) {
      logger.error('[AuthContext] Password reset error:', error);
      throw new Error('Failed to reset password. Please try again.');
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      logger.debug('[AuthContext] Signing out');
      sessionStorage.removeItem('auth_user_phone');
      setUser(null);
    } catch (error: any) {
      logger.error('[AuthContext] Sign out error:', error);
      throw error;
    }
  };

  const auth: AuthState = {
    isAuthenticated: !!user,
    user,
    loading
  };

  return (
    <AuthContext.Provider value={{ auth, signUp, sendOTP, verifyOTP, signIn, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
