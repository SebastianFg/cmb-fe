import clsx from 'clsx';
import type { ReactNode } from 'react';

export type BadgeTone =
  | 'booked'
  | 'confirmed'
  | 'attended'
  | 'no-show'
  | 'cancelled'
  | 'warning'
  | 'neutral'
  | 'portal';

type BadgeProps = {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
};

const TONE_CLASSES: Record<BadgeTone, string> = {
  booked: 'bg-booked-bg text-booked',
  confirmed: 'bg-confirmed-bg text-confirmed',
  attended: 'bg-attended-bg text-attended',
  'no-show': 'bg-no-show-bg text-no-show',
  cancelled: 'bg-cancelled-bg text-cancelled',
  warning: 'bg-warning tracking-[0.04em] text-white',
  neutral: 'bg-surface-muted text-ink-strong',
  portal: 'bg-accent-soft text-accent-dark',
};

const Badge = ({ tone = 'neutral', children, className }: BadgeProps) => (
  <span
    className={clsx(
      'inline-block whitespace-nowrap px-2.5 py-0.5 text-[0.8rem] font-semibold',
      TONE_CLASSES[tone],
      className,
    )}
  >
    {children}
  </span>
);

export default Badge;
