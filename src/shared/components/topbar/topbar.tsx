import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export type TopbarProps = {
  title: string;
  /** Migaja previa al título, por ejemplo «Pacientes ›». */
  crumb?: { label: string; to: string };
  actions?: ReactNode;
};

const Topbar = ({ title, crumb, actions }: TopbarProps) => (
  <header className="flex min-h-[66px] flex-wrap items-center justify-between gap-x-6 gap-y-2.5 border-b border-line bg-surface px-4 py-3 print:hidden min-[1100px]:px-8">
    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
      {crumb && (
        <span className="text-[0.95rem] text-ink-soft after:content-['_›']">
          <Link className="text-inherit hover:underline" to={crumb.to}>
            {crumb.label}
          </Link>
        </span>
      )}
      <h1 className="text-[1.3rem] font-semibold tracking-[-0.01em] text-ink">
        {title}
      </h1>
    </div>

    {actions && (
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-ink-soft">
        {actions}
      </div>
    )}
  </header>
);

export default Topbar;
