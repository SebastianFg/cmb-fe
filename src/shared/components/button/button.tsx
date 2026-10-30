import clsx from 'clsx';
import { type ButtonHTMLAttributes, forwardRef } from 'react';
import Spinner from '@/shared/components/spinner/spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = {
  variant?: ButtonVariant;
  isLoading?: boolean;
  block?: boolean;
  small?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'border-accent bg-accent font-semibold text-white hover:border-accent-dark hover:bg-accent-dark',
  secondary:
    'border-border-strong bg-surface text-ink hover:border-accent dark:border-sidebar-line dark:bg-sidebar-soft dark:text-white',
  ghost: 'border-transparent bg-transparent text-ink-soft hover:text-ink',
  danger:
    'border-border-strong bg-surface text-danger hover:border-danger dark:border-sidebar-line dark:bg-sidebar-soft',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      isLoading = false,
      block = false,
      small = false,
      disabled,
      className,
      type = 'button',
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={clsx(
        'inline-flex items-center justify-center gap-2 border leading-tight transition-colors',
        'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/35',
        'disabled:cursor-not-allowed disabled:opacity-45',
        small ? 'min-h-9 px-3.5 py-1.5 text-[0.9rem]' : 'min-h-11 px-5 py-2.5',
        VARIANT_CLASSES[variant],
        block && 'w-full',
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <Spinner
          className="m-0"
          classNameSpinner="m-0 h-5 w-5 border-2 border-current border-t-transparent dark:border-current dark:border-t-transparent"
        />
      ) : (
        children
      )}
    </button>
  ),
);

Button.displayName = 'Button';

export default Button;
