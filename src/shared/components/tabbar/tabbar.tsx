import clsx from 'clsx';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import type { NavItem } from '@/router/nav-items';

type TabbarProps = {
  items: NavItem[];
  /** Control de la cuenta, al alcance del pulgar en teléfono. */
  accountTab?: ReactNode;
};

export const tabClasses = (isActive: boolean) =>
  clsx(
    'flex flex-1 flex-col items-center gap-1.5 px-1 pb-3 pt-2.5 text-[0.82rem] transition-colors',
    'md:flex-none md:flex-row md:gap-2 md:border-b-[3px] md:px-4.5 md:py-3 md:text-[0.95rem]',
    isActive
      ? 'font-semibold text-accent md:border-b-accent'
      : 'text-ink-soft hover:text-ink md:border-b-transparent',
  );

export const tabIconClasses = (isActive: boolean, round = false) =>
  clsx(
    'block h-[22px] w-[22px] border-2 border-current md:h-3.5 md:w-3.5',
    round && 'rounded-full',
    isActive && 'bg-accent',
  );

/**
 * Secciones del portal. En teléfono queda fija abajo, al alcance del pulgar;
 * desde 900px sube y se convierte en una fila de pestañas.
 */
const Tabbar = ({ items, accountTab }: TabbarProps) => (
  <nav
    aria-label="Secciones del portal"
    className={clsx(
      'fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-surface print:hidden',
      'md:static md:order-first md:justify-center md:gap-2 md:border-b md:border-t-0',
    )}
  >
    {items.map((item) => (
      <NavLink
        key={item.path}
        to={item.path}
        className={({ isActive }) => tabClasses(isActive)}
      >
        {({ isActive }) => (
          <>
            <span aria-hidden="true" className={tabIconClasses(isActive)} />
            {item.label}
          </>
        )}
      </NavLink>
    ))}

    {accountTab}
  </nav>
);

export default Tabbar;
