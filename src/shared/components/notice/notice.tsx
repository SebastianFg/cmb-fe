import clsx from 'clsx';
import type { HTMLAttributes, ReactNode } from 'react';

export type NoticeTone = 'danger' | 'warning' | 'info' | 'success' | 'neutral';

type NoticeProps = {
  tone?: NoticeTone;
  title?: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

const TONE_CLASSES: Record<NoticeTone, string> = {
  danger: 'border-[#EFC9C5] border-l-danger bg-danger-bg text-ink',
  warning: 'border-[#F0D8C3] border-l-warning bg-warning-bg text-ink',
  info: 'border-[#D3DDF6] border-l-info bg-info-bg text-ink',
  success: 'border-[#C6E3CF] border-l-success bg-success-bg text-ink',
  neutral: 'border-border border-l-border bg-surface-alt text-ink',
};

const Notice = ({
  tone = 'neutral',
  title,
  className,
  children,
  ...props
}: NoticeProps) => (
  <div
    className={clsx(
      'border border-l-4 px-4.5 py-3.5',
      TONE_CLASSES[tone],
      className,
    )}
    {...props}
  >
    {title && (
      <strong className="mb-1 block text-[0.85rem] font-semibold uppercase tracking-[0.06em]">
        {title}
      </strong>
    )}
    {children}
  </div>
);

export default Notice;
