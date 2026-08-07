import { Navigate, useLocation } from '@tanstack/react-router';
import { useAuthContext } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: 'buyer' | 'seller' | 'admin';
  requireSellerMode?: boolean;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireRole,
  requireSellerMode,
}: ProtectedRouteProps) {
  const { isAuthenticated, profile, loading, sellerModeEnabled } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" search={{ redirect: location.pathname }} />;
  }

  if (requireRole && profile?.role !== requireRole) {
    return <Navigate to="/" />;
  }

  if (requireSellerMode && !sellerModeEnabled) {
    return <Navigate to="/account" />;
  }

  return <>{children}</>;
}
