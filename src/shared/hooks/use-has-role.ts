import { useAuthStore } from '@/modules/auth/hooks/use-auth-store';
import { type AppRole, normalizeRole } from '@/shared/constants/roles';

/** `true` si la sesión tiene alguno de los roles pedidos. */
export const useHasRole = (allowedRoles: AppRole | AppRole[]): boolean => {
  const role = useAuthStore((state) => state.user?.role);
  const normalized = normalizeRole(role);

  if (!normalized) return false;

  const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return allowed.includes(normalized);
};
