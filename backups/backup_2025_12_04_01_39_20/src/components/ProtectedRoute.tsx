import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import logger from '@/lib/logger';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useAuth();

  useEffect(() => {
    // Don't redirect while loading
    if (auth.loading) {
      return;
    }

    // Not authenticated - redirect to login
    if (!auth.isAuthenticated || !auth.user) {
      logger.debug('[ProtectedRoute] Not authenticated, redirecting to login');
      navigate('/login', { replace: true, state: { from: location } });
      return;
    }

    // Check if profile is complete
    const hasUsername = auth.user.username && auth.user.username.trim() !== '';
    const hasPhone = auth.user.phone && auth.user.phone.trim() !== '';

    if (!hasUsername || !hasPhone) {
      logger.debug('[ProtectedRoute] Profile incomplete, redirecting to complete-profile');
      navigate('/complete-profile', { replace: true });
      return;
    }
  }, [auth.loading, auth.isAuthenticated, auth.user, navigate, location]);

  // Show loading while checking auth
  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated or profile incomplete
  if (!auth.isAuthenticated || !auth.user) {
    return null;
  }

  const hasUsername = auth.user.username && auth.user.username.trim() !== '';
  const hasPhone = auth.user.phone && auth.user.phone.trim() !== '';

  if (!hasUsername || !hasPhone) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
