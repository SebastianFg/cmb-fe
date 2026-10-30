import clsx from 'clsx';
import { MessageCircle, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { centerOptions, telHref } from '@/config/center-options';

type LinkButtonProps = {
  href: string;
  className?: string;
  children: ReactNode;
  'aria-label'?: string;
};

const base =
  'inline-flex items-center justify-center gap-3 no-underline transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent-bright';

/** Botón grande de WhatsApp, el CTA principal de la landing. */
export const WhatsappButton = ({
  href,
  className,
  children,
}: LinkButtonProps) => (
  <a
    href={href}
    className={clsx(base, 'min-h-15 px-7 text-lg font-bold', className)}
  >
    <MessageCircle className="h-5.5 w-5.5" aria-hidden="true" />
    {children}
  </a>
);

/** Botón de llamada. El número sale de las opciones del centro. */
export const CallButton = ({
  className,
  children,
}: Partial<Omit<LinkButtonProps, 'href'>>) => (
  <a
    href={telHref()}
    className={clsx(base, 'min-h-15 px-7 text-lg font-semibold', className)}
  >
    <Phone className="h-5 w-5" aria-hidden="true" />
    {children ?? centerOptions.phone}
  </a>
);
