import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as api from '@/lib/apiService';
import logger from '@/lib/logger';

interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  phone: string;
  avatar_url?: string | null;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

interface AuthContextType {
  auth: AuthState;
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (identifier: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  verifyOTP: (email: string, otp: string) => { valid: boolean; message: string };
  requestOTP: (email: string, name: string) => Promise<any>;
  verifyOTPAndSignup: (email: string, otp: string, data: SignUpData) => Promise<void>;
  resetPassword: (email: string, newPassword: string, resetToken: string) => Promise<void>;
  authModalType: 'login' | 'signup' | 'forgot-password' | null;
  openAuthModal: (type: 'login' | 'signup' | 'forgot-password') => void;
  closeAuthModal: () => void;
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
  const [authModalType, setAuthModalType] = useState<'login' | 'signup' | 'forgot-password' | null>(null);

  const openAuthModal = (type: 'login' | 'signup' | 'forgot-password') => {
    setAuthModalType(type);
  };

  const closeAuthModal = () => {
    setAuthModalType(null);
  };

  // Load user profile on mount if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        logger.debug('[AuthContext] Initializing auth...');

        if (api.isAuthenticated()) {
          logger.debug('[AuthContext] Access token found, loading profile...');
          await loadUserProfile();
        } else {
          logger.debug('[AuthContext] No access token found');
        }
      } catch (error) {
        logger.error('[AuthContext] Error initializing auth:', error);
        // Clear invalid tokens
        api.clearTokens();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (!user) return; // Only run if user is logged in

    const validateSession = async () => {
      try {
        const response = await api.getProfile();

        if (!response.success && response.error === 'Unauthorized') {
          logger.warn('[AuthContext] Session invalidated - logging out');
          // Session is no longer valid (logged in on another device or token expired)
          api.clearTokens();
          setUser(null);
          window.location.href = '/';
        }
      } catch (error) {
        logger.warn('[AuthContext] Session validation network error (ignoring):', error);
      }
    };

    const initialTimeout = setTimeout(validateSession, 10000);

    const interval = setInterval(validateSession, 300000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const response = await api.getProfile();

      if (response.success && response.user) {
        logger.debug('[AuthContext] User profile loaded:', response.user.email);
        setUser(response.user);
      } else {
        logger.error('[AuthContext] Failed to load profile:', response.error);
        setUser(null);
        api.clearTokens();
      }
    } catch (error) {
      logger.error('[AuthContext] Error loading profile:', error);
      setUser(null);
      api.clearTokens();
    }
  };

  const requestOTP = async (email: string, name: string) => {
    logger.debug('[AuthContext] Requesting OTP for:', email);
    const response = await api.requestOTP(email, name);
    if (!response.success) {
      throw new Error(response.error || 'Failed to send OTP');
    }
    return response;
  };

  const verifyOTPAndSignup = async (email: string, otp: string, data: SignUpData) => {
    logger.debug('[AuthContext] Verifying OTP and completing signup for:', email);
    const response = await api.verifyOTPAndSignup(email, otp, {
      name: data.fullName,
      email: data.email,
      username: data.username,
      phone: data.phone,
      password: data.password,
    });

    if (!response.success) {
      throw new Error(response.error || 'Invalid OTP or failed to sign up');
    }

    if (response.user) {
      setUser(response.user);
    }
  };

  const signUp = async (data: SignUpData) => {
    try {
      logger.debug('[AuthContext] Creating new account for:', data.email);

      const response = await api.signup({
        name: data.fullName,
        email: data.email,
        username: data.username,
        phone: data.phone,
        password: data.password,
      });

      if (!response.success) {
        throw new Error(response.error || 'Signup failed');
      }

      if (response.user) {
        setUser(response.user);
      }

      logger.debug('[AuthContext] Signup completed successfully');
    } catch (error: any) {
      logger.error('[AuthContext] Signup error:', error);
      throw error;
    }
  };

  const signIn = async (identifier: string, password: string) => {
    try {
      logger.debug('[AuthContext] Attempting login for:', identifier);

      const response = await api.login(identifier, password);

      if (!response.success) {
        throw new Error(response.error || 'Login failed');
      }

      if (response.user) {
        setUser(response.user);
      }

      logger.debug('[AuthContext] Login completed successfully');
    } catch (error: any) {
      logger.error('[AuthContext] Login error:', error);
      throw new Error('Invalid email/username or password');
    }
  };

  const signOut = async () => {
    try {
      logger.debug('[AuthContext] Signing out');
      await api.logout();
      setUser(null);
    } catch (error: any) {
      logger.error('[AuthContext] Sign out error:', error);
      api.clearTokens();
      setUser(null);
    }
  };

  const refreshUser = async () => {
    if (api.isAuthenticated()) {
      await loadUserProfile();
    }
  };

  const verifyOTP = (email: string, otp: string): { valid: boolean; message: string } => {
    const storedData = sessionStorage.getItem(`otp_${email}`);

    if (!storedData) {
      return { valid: false, message: 'No verification code found. Please request a new code.' };
    }

    const { code: storedOtp, expiry } = JSON.parse(storedData);

    if (Date.now() > expiry) {
      sessionStorage.removeItem(`otp_${email}`);
      return { valid: false, message: 'Verification code has expired. Please request a new code.' };
    }


    if (otp !== storedOtp) {
      return { valid: false, message: 'Invalid verification code. Please try again.' };
    }

    sessionStorage.removeItem(`otp_${email}`);
    return { valid: true, message: 'Verification successful!' };
  };

  const resetPassword = async (email: string, newPassword: string, resetToken: string): Promise<void> => {
    try {
      logger.debug('[AuthContext] Resetting password for:', email);

      const response = await api.resetPassword(email, newPassword, resetToken);

      if (!response.success) {
        throw new Error(response.error || 'Failed to reset password');
      }

      logger.debug('[AuthContext] Password reset successful');
    } catch (error: any) {
      logger.error('[AuthContext] Password reset error:', error);
      throw error;
    }
  };

  const auth: AuthState = {
    isAuthenticated: !!user && api.isAuthenticated(),
    user,
    loading,
  };

  return (
    <AuthContext.Provider value={{ auth, signUp, signIn, signOut, refreshUser, verifyOTP, requestOTP, verifyOTPAndSignup, resetPassword, authModalType, openAuthModal, closeAuthModal }}>
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
