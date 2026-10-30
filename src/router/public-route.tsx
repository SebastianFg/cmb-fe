import type { JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/modules/auth/hooks/use-auth-store';
import { useHydration } from '@/modules/auth/hooks/use-hydration';
import { landingPathForRole } from '@/router/landing-path';
import Spinner from '@/shared/components/spinner/spinner';

/** Pantallas sólo para visitantes: con sesión abierta no tienen sentido. */
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const hydrated = useHydration();
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.user?.role);

  if (!hydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (token) {
    return <Navigate to={landingPathForRole(role)} replace />;
  }

  return children;
};

export default PublicRoute;
