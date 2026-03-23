import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import logger from '@/lib/logger';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
}

interface AdminAuthContextType {
  isAuthenticated: boolean;
  admin: AdminUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  // Token refresh function
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const refreshTok = localStorage.getItem('admin_refresh_token');
      if (!refreshTok) return false;

      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshTok }),
      });

      const result = await response.json();

      if (response.ok && result.success && result.access_token) {
        localStorage.setItem('admin_access_token', result.access_token);
        logger.debug('[AdminAuth] Token refreshed successfully');
        return true;
      }

      logger.warn('[AdminAuth] Token refresh failed, logging out');
      return false;
    } catch (error) {
      logger.error('[AdminAuth] Token refresh error:', error);
      return false;
    }
  }, [API_URL]);

  useEffect(() => {
    // Check for existing admin session from localStorage
    const checkSession = async () => {
      try {
        const savedSession = localStorage.getItem('admin_session');
        const accessToken = localStorage.getItem('admin_access_token');

        if (savedSession && accessToken) {
          const adminUser = JSON.parse(savedSession) as AdminUser;
          setAdmin(adminUser);
          logger.debug('[AdminAuth] Session restored for admin:', adminUser.email);
        } else {
          // No session, clear local storage
          localStorage.removeItem('admin_session');
          localStorage.removeItem('admin_access_token');
          localStorage.removeItem('admin_refresh_token');
        }
      } catch (error) {
        logger.error('[AdminAuth] Error checking session:', error);
        localStorage.removeItem('admin_session');
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_refresh_token');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Auto-refresh token every 90 minutes
  useEffect(() => {
    if (!admin) return;

    const interval = setInterval(async () => {
      const success = await refreshToken();
      if (!success) {
        setAdmin(null);
        localStorage.removeItem('admin_session');
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_refresh_token');
      }
    }, 90 * 60 * 1000); // 90 minutes

    return () => clearInterval(interval);
  }, [admin, refreshToken]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      logger.debug('[AdminAuth] Starting login for:', email);

      // Call backend API for admin login
      const response = await fetch(`${API_URL}/api/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        logger.error('[AdminAuth] Authentication failed:', result.error || 'Unknown error');
        setLoading(false);
        return false;
      }

      logger.debug('[AdminAuth] Admin login successful');

      const adminUser: AdminUser = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name || 'Admin User',
        role: 'admin',
      };

      setAdmin(adminUser);
      localStorage.setItem('admin_session', JSON.stringify(adminUser));

      // Store tokens for API calls
      if (result.session?.access_token) {
        localStorage.setItem('admin_access_token', result.session.access_token);
        logger.debug('[AdminAuth] Access token stored for API calls');
      }
      if (result.session?.refresh_token) {
        localStorage.setItem('admin_refresh_token', result.session.refresh_token);
      }

      setLoading(false);
      return true;
    } catch (error) {
      logger.error('[AdminAuth] Login exception:', error);
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      setAdmin(null);
      localStorage.removeItem('admin_session');
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      logger.debug('[AdminAuth] Logout successful');
    } catch (error) {
      logger.error('[AdminAuth] Logout error:', error);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated: admin !== null,
        admin,
        login,
        logout,
        refreshToken,
        loading,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
