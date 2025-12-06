import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
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
  loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing Supabase session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const userMetadata = session.user.user_metadata;
          const appMetadata = session.user.app_metadata;

          const isAdmin =
            userMetadata?.role === 'admin' ||
            appMetadata?.role === 'admin';

          if (isAdmin) {
            const adminUser: AdminUser = {
              id: session.user.id,
              email: session.user.email!,
              name: userMetadata?.name || userMetadata?.full_name || 'Admin User',
              role: 'admin',
            };

            setAdmin(adminUser);
            localStorage.setItem('admin_session', JSON.stringify(adminUser));
          } else {
            // Not an admin, clear session
            await supabase.auth.signOut();
            localStorage.removeItem('admin_session');
          }
        } else {
          // No session, clear local storage
          localStorage.removeItem('admin_session');
        }
      } catch (error) {
        logger.error('[AdminAuth] Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      logger.debug('[AdminAuth] Starting login for:', email);

      // Step 1: Authenticate with Supabase (password verification)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        logger.error('[AdminAuth] Authentication failed:', authError.message);
        setLoading(false);
        return false;
      }

      if (!authData.user) {
        logger.error('[AdminAuth] No user data returned');
        setLoading(false);
        return false;
      }

      // Step 2: Check if user exists in admins table (database verification)
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .single();

      if (adminError || !adminData) {
        logger.error('[AdminAuth] User is not an admin');
        // Keep user signed in to Supabase - admin pages need auth!
        // DO NOT sign out here, or all Supabase queries will fail
        setLoading(false);
        return false;
      }

      logger.debug('[AdminAuth] Admin login successful');

      const adminUser: AdminUser = {
        id: authData.user.id,
        email: authData.user.email!,
        name: adminData.name || 'Admin User',
        role: 'admin',
      };

      setAdmin(adminUser);
      localStorage.setItem('admin_session', JSON.stringify(adminUser));

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
      await supabase.auth.signOut();
      setAdmin(null);
      localStorage.removeItem('admin_session');
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
