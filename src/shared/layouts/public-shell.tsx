import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { envConfig } from '@/config/env-config';

type PublicShellProps = {
  children: ReactNode;
};

/**
 * Cáscara de las pantallas públicas del centro: barra con la marca, contenido
 * y pie. El back-office usa su propio layout con barra lateral.
 */
const PublicShell = ({ children }: PublicShellProps) => (
  <div className="flex min-h-screen flex-col bg-surface dark:bg-sidebar">
    <header className="border-b border-line bg-surface dark:border-sidebar-line dark:bg-sidebar">
      <div className="mx-auto flex w-full max-w-shell items-center justify-between gap-4 px-4 py-4">
        <Link
          className="flex items-center gap-3 text-ink dark:text-white"
          to="/"
        >
          <span aria-hidden="true" className="h-[30px] w-[30px] bg-accent" />
          <span className="font-semibold">
            {envConfig.VITE_PUBLIC_PROJECT_SHORT_NAME}
          </span>
        </Link>

        <Link
          className="text-accent transition-colors hover:text-accent-dark hover:underline"
          to="/login"
        >
          Iniciar sesión
        </Link>
      </div>
    </header>

    <main className="mx-auto w-full max-w-shell flex-1 px-4 py-8">
      {children}
    </main>

    <footer className="mt-auto border-t border-line bg-surface text-[0.9rem] text-ink-soft dark:border-sidebar-line dark:bg-sidebar">
      <div className="mx-auto flex w-full max-w-shell flex-wrap items-center justify-between gap-x-6 gap-y-2.5 px-4 py-5">
        <span>
          {envConfig.VITE_PUBLIC_PROJECT_SHORT_NAME} · Sistema de gestión de
          turnos
        </span>
        <span>v{envConfig.VITE_PUBLIC_APP_VERSION}</span>
      </div>
    </footer>
  </div>
);

export default PublicShell;
