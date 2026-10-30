import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/modules/auth/hooks/use-auth-store';
import { useLogout } from '@/modules/auth/hooks/use-logout';
import { navItemsForRole } from '@/router/nav-items';
import Button from '@/shared/components/button/button';
import Footer from '@/shared/components/footer/footer';
import Tabbar, {
  tabClasses,
  tabIconClasses,
} from '@/shared/components/tabbar/tabbar';
import { initialsOf } from '@/shared/utils/initials';

/** Portal del paciente: barra superior con la marca y secciones en pestañas. */
const PortalShell = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((state) => state.user);
  const { isLoggingOut, logout } = useLogout();

  useEffect(() => {
    if (!isMenuOpen) return;

    const closeOnOutside = (event: PointerEvent) => {
      const target = event.target as HTMLElement;

      // Los botones que abren el menú lo alternan por su cuenta: si además
      // cerrara acá, el segundo toque lo dejaría abierto.
      if (target.closest('[aria-controls="account-menu"]')) return;

      if (!containerRef.current?.contains(target)) {
        setIsMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    document.addEventListener('pointerdown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('pointerdown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isMenuOpen]);

  return (
    <div className="flex min-h-screen flex-col bg-ground pb-19 md:pb-0">
      <header className="sticky top-0 z-20 border-b border-line bg-surface print:hidden">
        <div
          ref={containerRef}
          className="relative mx-auto flex min-h-16 w-full max-w-[760px] items-center justify-between gap-4 px-4 py-2.5"
        >
          <Link
            className="flex items-center gap-3 text-base font-semibold text-ink"
            to="/"
          >
            <span
              aria-hidden="true"
              className="h-[26px] w-[26px] flex-none bg-accent"
            />
            Centro Médico Belgrano
          </Link>

          <button
            type="button"
            aria-controls="account-menu"
            aria-expanded={isMenuOpen}
            aria-label="Mi cuenta"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="grid h-[38px] w-[38px] place-items-center border border-border-strong bg-surface text-[0.85rem] font-semibold text-ink transition-colors hover:border-accent"
          >
            {initialsOf(user?.name ?? '')}
          </button>

          {isMenuOpen && (
            <div
              id="account-menu"
              className="absolute right-4 top-[58px] z-30 flex min-w-[230px] flex-col gap-2.5 border border-border-strong bg-surface p-4"
            >
              <strong className="text-ink">{user?.name}</strong>
              <span className="text-[0.82rem] text-ink-soft">
                {user?.email}
              </span>
              <Button onClick={logout} isLoading={isLoggingOut} small>
                Cerrar sesión
              </Button>
            </div>
          )}
        </div>
      </header>

      <Tabbar
        items={navItemsForRole('patient')}
        accountTab={
          <button
            type="button"
            aria-controls="account-menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
            className={tabClasses(isMenuOpen)}
          >
            <span
              aria-hidden="true"
              className={tabIconClasses(isMenuOpen, true)}
            />
            Mi cuenta
          </button>
        }
      />

      <main
        className={clsx(
          'mx-auto w-full max-w-[760px] flex-1 px-4 py-6',
          'print:max-w-none print:px-0',
        )}
      >
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default PortalShell;
