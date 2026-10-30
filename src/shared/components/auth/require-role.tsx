import type { JSX } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/modules/auth/hooks/use-auth-store';
import { landingPathForRole } from '@/router/landing-path';
import NotFoundPage from '@/shared/components/not-found/not-found-page';
import type { AppRole } from '@/shared/constants/roles';
import { useHasRole } from '@/shared/hooks/use-has-role';

type RequireRoleProps = {
  roles: AppRole[];
  children: JSX.Element;
};

/**
 * Guarda de ruta por rol. Una pantalla que no le corresponde al rol no es un
 * error: lo devuelve a la suya. El control real vive en la API (RNF-02).
 */
const RequireRole = ({ roles, children }: RequireRoleProps) => {
  const allowed = useHasRole(roles);
  const role = useAuthStore((state) => state.user?.role);
  const location = useLocation();

  if (allowed) return children;

  const landing = landingPathForRole(role);

  // Si el propio aterrizaje estuviera mal configurado, mostrar el error en
  // lugar de rebotar para siempre entre dos rutas.
  if (location.pathname === landing) {
    return <NotFoundPage redirectTo="/login" buttonLabel="Volver al acceso" />;
  }

  return <Navigate to={landing} replace />;
};

export default RequireRole;
