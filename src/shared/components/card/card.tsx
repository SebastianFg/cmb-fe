import clsx from 'clsx';
import type { HTMLAttributes, ReactNode } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement>;

export const Card = ({ className, children, ...props }: CardProps) => (
  <div
    className={clsx(
      'border border-border bg-surface p-5 dark:border-sidebar-line dark:bg-sidebar-soft',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

type CardHeadProps = {
  title: ReactNode;
  action?: ReactNode;
  id?: string;
};

export const CardHead = ({ title, action, id }: CardHeadProps) => (
  <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
    <h2
      id={id}
      className="text-[1.1rem] font-semibold text-ink dark:text-white"
    >
      {title}
    </h2>
    {action}
  </div>
);

export const CardFooter = ({ className, children, ...props }: CardProps) => (
  <div
    className={clsx(
      '-mx-5 -mb-5 mt-6 flex flex-wrap items-center gap-3 border-t border-line px-5 py-4.5 dark:border-sidebar-line',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);
