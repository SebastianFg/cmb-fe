import type { JSX } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/modules/auth/hooks/use-auth-store';
import { useHydration } from '@/modules/auth/hooks/use-hydration';
import Spinner from '@/shared/components/spinner/spinner';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const hydrated = useHydration();
  const token = useAuthStore((state) => state.token);
  const location = useLocation();

  if (!hydrated) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
