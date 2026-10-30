import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/modules/auth/hooks/use-auth-store';
import type { LoginFormValues } from '@/modules/auth/schemas/login.schema';
import { signIn } from '@/modules/auth/services/auth.service';
import { canRoleOpenPath, landingPathForRole } from '@/router/landing-path';
import type { AppRole } from '@/shared/constants/roles';

type LocationState = {
  from?: { pathname?: string; search?: string; hash?: string };
};

const intendedPath = (state: LocationState | null): string | null => {
  const from = state?.from;
  if (!from?.pathname) return null;

  return `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`;
};

/**
 * Vuelve a donde la persona quiso entrar, pero sólo si esa pantalla existe y
 * le corresponde a su rol: si no, al aterrizaje propio. Sin este chequeo, un
 * paciente que intentó abrir una pantalla del personal terminaba en un 404
 * apenas iniciaba sesión.
 */
const resolveRedirect = (
  state: LocationState | null,
  role: AppRole,
): string => {
  const intended = intendedPath(state);

  return intended && canRoleOpenPath(role, intended)
    ? intended
    : landingPathForRole(role);
};

export const useCredentialsLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);

  const mutation = useMutation({
    mutationFn: ({ email, password }: LoginFormValues) =>
      signIn({ email, password }),
    onSuccess: (session) => {
      setSession(session);
      navigate(resolveRedirect(location.state, session.user.role), {
        replace: true,
      });
    },
  });

  return {
    error: mutation.error,
    isSigningIn: mutation.isPending,
    signIn: mutation.mutate,
  };
};
