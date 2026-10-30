import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

type GoogleButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

const GoogleButton = ({ className, ...props }: GoogleButtonProps) => (
  <button
    type="button"
    className={clsx(
      'flex h-[54px] w-full items-center justify-center gap-3 border border-border-strong bg-white',
      'text-[15px] font-bold text-ink transition-colors',
      'hover:bg-surface-alt',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-60',
      'dark:border-sidebar-soft dark:bg-sidebar-soft dark:text-white dark:hover:bg-sidebar',
      className,
    )}
    {...props}
  >
    <span
      aria-hidden="true"
      className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-border-strong text-[12px] font-bold text-ink-soft dark:border-sidebar-muted dark:text-sidebar-ink"
    >
      G
    </span>
    Continuar con Google
  </button>
);

export default GoogleButton;
