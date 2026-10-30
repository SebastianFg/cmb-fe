/**
 * Roles del centro. `admin`, `reception` y `professional` son cuentas de
 * personal (back-office); `patient` es la cuenta del portal del paciente.
 * Los nombres coinciden con `doc/vistas/data/roles.json`.
 */
export const APP_ROLES = [
  'admin',
  'reception',
  'professional',
  'patient',
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const STAFF_ROLES: AppRole[] = ['admin', 'reception', 'professional'];

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Administrador',
  reception: 'Recepción',
  professional: 'Profesional',
  patient: 'Paciente',
};

const validRoles = new Set<string>(APP_ROLES);

export const normalizeRole = (
  role: string | null | undefined,
): AppRole | null =>
  typeof role === 'string' && validRoles.has(role) ? (role as AppRole) : null;

export const getRoleLabel = (
  role: string | null | undefined,
): string | null => {
  const normalized = normalizeRole(role);
  return normalized ? ROLE_LABELS[normalized] : null;
};

export const isStaffRole = (role: string | null | undefined): boolean => {
  const normalized = normalizeRole(role);
  return normalized !== null && normalized !== 'patient';
};
