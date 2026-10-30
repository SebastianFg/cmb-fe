import type { ReactNode } from 'react';
import type { AppRole } from '@/shared/constants/roles';
import { useHasRole } from '@/shared/hooks/use-has-role';

export type RoleGateProps = {
  roles: AppRole[];
  children: ReactNode;
  notAllowed?: ReactNode;
};

/** Muestra `children` solo si la sesión tiene alguno de los roles. */
export const RoleGate = ({
  roles,
  children,
  notAllowed = null,
}: RoleGateProps) => {
  const allowed = useHasRole(roles);
  return <>{allowed ? children : notAllowed}</>;
};
