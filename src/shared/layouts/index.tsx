import { useAuthStore } from '@/modules/auth/hooks/use-auth-store';
import { isStaffRole } from '@/shared/constants/roles';
import PortalShell from './portal-shell';
import StaffShell from './staff-shell';

/**
 * El personal y el paciente usan dos cáscaras distintas, como en los mockups:
 * barra lateral para el back-office, barra superior y pestañas para el portal.
 */
const Layout = () => {
  const role = useAuthStore((state) => state.user?.role);

  return isStaffRole(role) ? <StaffShell /> : <PortalShell />;
};

export default Layout;
