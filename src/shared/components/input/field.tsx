import clsx from 'clsx';
import type { ReactNode } from 'react';

export type FieldProps = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  trailing?: ReactNode;
  className?: string;
  children: ReactNode;
};

export const fieldControlClasses = (hasError: boolean, hasTrailing = false) =>
  clsx(
    'min-h-12 w-full border bg-surface px-3.5 py-2.5 text-ink transition-colors',
    'placeholder:text-ink-muted',
    'focus:border-accent focus:outline-none focus:ring-3 focus:ring-accent/35',
    'read-only:bg-surface-alt read-only:text-ink-soft',
    'disabled:cursor-not-allowed disabled:bg-surface-alt disabled:text-ink-soft',
    'dark:bg-sidebar-soft dark:text-white dark:placeholder:text-sidebar-muted',
    hasError
      ? 'border-danger focus:border-danger focus:ring-danger/30'
      : 'border-border-strong dark:border-sidebar-line',
    hasTrailing && 'pr-24',
  );

/** Envoltorio de campo: etiqueta, control, ayuda y error. */
const Field = ({
  id,
  label,
  hint,
  error,
  required = false,
  trailing,
  className,
  children,
}: FieldProps) => (
  <div className={clsx('flex min-w-0 flex-col gap-[7px]', className)}>
    <label
      htmlFor={id}
      className="text-[0.92rem] font-medium text-ink-strong dark:text-sidebar-ink"
    >
      {label}
      {required && <span aria-hidden="true"> *</span>}
    </label>

    <div className="relative">
      {children}
      {trailing && (
        <div className="absolute inset-y-0 right-3 flex items-center">
          {trailing}
        </div>
      )}
    </div>

    {hint && (
      <p id={`${id}-hint`} className="text-[0.82rem] text-ink-soft">
        {hint}
      </p>
    )}

    {error && (
      <p id={`${id}-error`} className="text-[0.85rem] text-danger">
        {error}
      </p>
    )}
  </div>
);

export default Field;
