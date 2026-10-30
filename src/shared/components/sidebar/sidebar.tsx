import clsx from 'clsx';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/modules/auth/hooks/use-auth-store';
import { useLogout } from '@/modules/auth/hooks/use-logout';
import { landingPathForRole } from '@/router/landing-path';
import { navItemsForRole } from '@/router/nav-items';
import { getRoleLabel, normalizeRole } from '@/shared/constants/roles';
import { initialsOf } from '@/shared/utils/initials';

/**
 * Barra lateral del back-office. Hasta 1100px es una franja apilada arriba
 * con el menú plegado; desde ahí es una columna fija de 236px.
 */
const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const { isLoggingOut, logout } = useLogout();

  const role = normalizeRole(user?.role);
  const items = role ? navItemsForRole(role) : [];

  // Al navegar en teléfono, el menú se cierra solo.
  useEffect(() => setIsOpen(false), [location.pathname]);

  return (
    <aside className="flex flex-col bg-sidebar text-sidebar-ink print:hidden min-[1100px]:sticky min-[1100px]:top-0 min-[1100px]:h-screen min-[1100px]:overflow-y-auto min-[1100px]:pt-2">
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 min-[1100px]:px-5 min-[1100px]:pb-4.5 min-[1100px]:pt-3.5">
        <Link
          className="flex items-center gap-3 text-base font-semibold leading-tight text-white"
          to={landingPathForRole(role)}
        >
          <span
            aria-hidden="true"
            className="h-[26px] w-[26px] flex-none bg-accent"
          />
          <span>
            Centro Médico
            <br />
            Belgrano
          </span>
        </Link>

        <button
          type="button"
          aria-controls="sidebar-nav"
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setIsOpen((open) => !open)}
          className="inline-flex min-h-10 items-center gap-2 border border-sidebar-line px-3 py-1.5 text-white transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/35 min-[1100px]:hidden"
        >
          {isOpen ? (
            <X className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Menu className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      <nav
        id="sidebar-nav"
        aria-label="Navegación del back-office"
        className={clsx(
          'flex-col border-t border-sidebar-line min-[1100px]:flex min-[1100px]:flex-1',
          isOpen ? 'flex' : 'hidden',
        )}
      >
        <ul className="min-[1100px]:flex-1 list-none py-2.5">
          {items.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    'block border-l-[3px] px-5 py-2.75 transition-colors',
                    isActive
                      ? 'border-l-accent bg-accent/35 font-semibold text-white'
                      : 'border-l-transparent text-sidebar-ink hover:bg-white/5 hover:text-white',
                  )
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-[11px] border-t border-sidebar-line px-5 pb-4.5 pt-4">
          <span
            aria-hidden="true"
            className="grid h-[34px] w-[34px] flex-none place-items-center bg-[#1D4640] text-[0.85rem] font-semibold text-white"
          >
            {initialsOf(user?.shortName ?? user?.name ?? '')}
          </span>

          <span className="flex min-w-0 flex-1 flex-col leading-[1.25]">
            <strong className="truncate text-[0.95rem] font-medium text-white">
              {user?.shortName ?? 'Invitado'}
            </strong>
            <span className="text-[0.8rem] text-sidebar-muted">
              {getRoleLabel(user?.role) ?? 'Sin rol'}
            </span>
          </span>

          <button
            type="button"
            disabled={isLoggingOut}
            onClick={logout}
            className="text-[0.85rem] text-sidebar-muted underline transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingOut ? 'Saliendo…' : 'Salir'}
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
