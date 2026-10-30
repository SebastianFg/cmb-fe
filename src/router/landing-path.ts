import { findNavItem } from '@/router/nav-items';
import { type AppRole, normalizeRole } from '@/shared/constants/roles';

/**
 * Pantalla a la que entra cada rol al iniciar sesión. Un test verifica que
 * cada destino exista en el mapa de rutas y esté permitido para ese rol.
 */
const ROLE_LANDING: Record<AppRole, string> = {
  admin: '/panel',
  reception: '/panel',
  professional: '/agenda',
  patient: '/mis-turnos',
};

const FALLBACK_LANDING = '/panel';

export const landingPathForRole = (role: string | null | undefined): string => {
  const normalized = normalizeRole(role);
  return normalized ? ROLE_LANDING[normalized] : FALLBACK_LANDING;
};

/** Si el rol puede abrir esa ruta. Acepta la ruta con query y hash. */
export const canRoleOpenPath = (
  role: string | null | undefined,
  pathWithQuery: string,
): boolean => {
  const normalized = normalizeRole(role);
  if (!normalized) return false;

  const [pathname] = pathWithQuery.split(/[?#]/);
  const item = findNavItem(pathname);

  return item ? item.roles.includes(normalized) : false;
};
