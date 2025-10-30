import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  restricted?: boolean;
}

export default function PublicRoute({ 
  children, 
  redirectTo = '/links',
  restricted = false 
}: PublicRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (restricted && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

